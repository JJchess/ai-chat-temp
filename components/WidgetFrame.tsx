'use client';

import morphdom from 'morphdom';
import { useEffect, useMemo, useRef } from 'react';

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

const designTokens = `<style>
  :root{
    --color-text-primary:#111827;
    --color-text-secondary:#4b5563;
    --color-text-tertiary:#6b7280;
    --color-text-info:#1d4ed8;
    --color-text-danger:#b91c1c;
    --color-text-success:#166534;
    --color-text-warning:#92400e;
    --color-background-primary:#ffffff;
    --color-background-secondary:#f9fafb;
    --color-background-tertiary:#f3f4f6;
    --color-background-info:#dbeafe;
    --color-background-danger:#fee2e2;
    --color-background-success:#dcfce7;
    --color-background-warning:#fef3c7;
    --color-border-primary:rgba(17,24,39,.4);
    --color-border-secondary:rgba(17,24,39,.25);
    --color-border-tertiary:rgba(17,24,39,.15);
    --color-border-info:#93c5fd;
    --color-border-danger:#fca5a5;
    --color-border-success:#86efac;
    --color-border-warning:#fcd34d;
    --font-sans:Inter,Arial,sans-serif;
    --font-serif:Georgia,serif;
    --font-mono:ui-monospace,Consolas,monospace;
    --border-radius-md:8px;
    --border-radius-lg:12px;
    --border-radius-xl:16px;
  }
  [data-widget-surface]{
    background:var(--color-background-primary);
    color:var(--color-text-primary);
    font-family:var(--font-sans);
    padding:12px;
    min-height:120px;
  }
  [data-widget-surface] *{box-sizing:border-box}
  [data-widget-surface] button,
  [data-widget-surface] input,
  [data-widget-surface] select,
  [data-widget-surface] textarea{font-family:var(--font-sans)}
  @keyframes widgetFadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
  @media (prefers-color-scheme: dark){
    :root{
      --color-text-primary:#e5e7eb;
      --color-text-secondary:#cbd5e1;
      --color-text-tertiary:#94a3b8;
      --color-text-info:#93c5fd;
      --color-text-danger:#fca5a5;
      --color-text-success:#86efac;
      --color-text-warning:#fcd34d;
      --color-background-primary:#111827;
      --color-background-secondary:#1f2937;
      --color-background-tertiary:#374151;
      --color-background-info:#1e3a8a;
      --color-background-danger:#7f1d1d;
      --color-background-success:#14532d;
      --color-background-warning:#78350f;
      --color-border-primary:rgba(229,231,235,.45);
      --color-border-secondary:rgba(229,231,235,.3);
      --color-border-tertiary:rgba(229,231,235,.18);
    }
  }
</style>`;

export function WidgetFrame({ widgetCode, status, loadingMessages, height }: WidgetFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameHeight = height ?? 460;
  const renderedHtml = useMemo(() => `${designTokens}<div data-widget-surface>${widgetCode}</div>`, [widgetCode]);

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

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const target = document.createElement('div');
    target.className = root.className;
    target.innerHTML = renderedHtml;
    morphdom(root, target, {
      onBeforeElUpdated: (fromEl, toEl) => !fromEl.isEqualNode(toEl),
      onNodeAdded: (node) => {
        if (node.nodeType === 1 && node instanceof HTMLElement && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
          node.style.animation = 'widgetFadeIn .2s ease both';
        }
        return node;
      },
    });
    if (status === 'completed') {
      root.querySelectorAll('script').forEach((oldScript) => {
        if (oldScript.getAttribute('data-widget-ran') === 'true') return;
        const nextScript = document.createElement('script');
        const oldType = oldScript.getAttribute('type');
        if (oldType) nextScript.type = oldType;
        if (oldScript.src) {
          nextScript.src = oldScript.src;
        } else {
          nextScript.textContent = oldScript.textContent;
        }
        nextScript.setAttribute('data-widget-ran', 'true');
        oldScript.parentNode?.replaceChild(nextScript, oldScript);
      });
    }
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
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ height: `${frameHeight}px` }}
      />
    </div>
  );
}
