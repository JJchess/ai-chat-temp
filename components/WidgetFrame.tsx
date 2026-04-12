'use client';

import morphdom from 'morphdom';
import { useEffect, useMemo, useRef } from 'react';
import { widgetSurfaceInnerHtml } from '../lib/widgetShell';

declare global {
  interface Window {
    sendPrompt?: (text?: string) => void;
    openLink?: (url?: string) => void;
  }
}

interface WidgetFrameProps {
  widgetCode: string;
  status: 'streaming' | 'completed';
  loadingMessages?: string[];
  height?: number;
}

export function WidgetFrame({ widgetCode, status, loadingMessages, height }: WidgetFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingHtmlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameHeight = height ?? 460;
  const renderedHtml = useMemo(() => widgetSurfaceInnerHtml(widgetCode), [widgetCode]);

  useEffect(() => {
    if (typeof window.sendPrompt !== 'function') {
      window.sendPrompt = () => {};
    }
    if (typeof window.openLink !== 'function') {
      window.openLink = (url?: string) => {
        if (!url) return;
        window.open(String(url), '_blank', 'noopener,noreferrer');
      };
    }
  }, []);

  const applyMorphdom = (html: string) => {
    const root = containerRef.current;
    if (!root) return;
    const target = document.createElement('div');
    target.className = root.className;
    target.innerHTML = html;
    morphdom(root, target, {
      onBeforeElUpdated: (fromEl, toEl) => !fromEl.isEqualNode(toEl),
      onNodeAdded: (node) => {
        if (node.nodeType === 1 && node instanceof HTMLElement && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
          node.style.animation = 'widgetFadeIn .2s ease both';
        }
        return node;
      },
    });
  };

  useEffect(() => {
    if (status === 'completed') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      applyMorphdom(renderedHtml);
      const root = containerRef.current;
      if (!root) return;
      root.querySelectorAll('script').forEach((oldScript) => {
        if (oldScript.getAttribute('data-widget-ran') === 'true') return;
        const nextScript = document.createElement('script');
        const oldType = oldScript.getAttribute('type');
        if (oldType) nextScript.type = oldType;
        if (oldScript.src) {
          nextScript.src = oldScript.src;
        } else {
          nextScript.textContent = `(function(){${oldScript.textContent}\n})();`;
        }
        nextScript.setAttribute('data-widget-ran', 'true');
        oldScript.parentNode?.replaceChild(nextScript, oldScript);
      });
      return;
    }

    pendingHtmlRef.current = renderedHtml;
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (pendingHtmlRef.current) {
        applyMorphdom(pendingHtmlRef.current);
      }
    }, 150);
  }, [renderedHtml, status]);

  return (
    <div className="space-y-2">
      {status === 'streaming' && loadingMessages && loadingMessages.length > 0 ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {loadingMessages.join(' · ')}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800"
        style={{ height: `${frameHeight}px` }}
      />
    </div>
  );
}
