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
    --p:#111827;--s:#4b5563;--t:#6b7280;--bg2:#f9fafb;--b:#d1d5db;
  }
  [data-widget-surface]{
    background:transparent;
    color:var(--color-text-primary);
    font-family:var(--font-sans);
    padding:12px;
    min-height:120px;
  }
  [data-widget-surface] *{box-sizing:border-box}
  @keyframes widgetFadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}

  /* Pre-styled form elements */
  button{background:transparent;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);color:var(--color-text-primary);padding:6px 14px;font-size:14px;cursor:pointer;font-family:var(--font-sans)}
  button:hover{background:var(--color-background-secondary)}
  button:active{transform:scale(0.98)}
  input[type="range"]{-webkit-appearance:none;height:4px;background:var(--color-border-secondary);border-radius:2px;outline:none}
  input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--color-text-primary);cursor:pointer}
  input[type="text"],input[type="number"],textarea,select{height:36px;background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);color:var(--color-text-primary);padding:0 10px;font-size:14px;font-family:var(--font-sans);outline:none}
  input[type="text"]:hover,input[type="number"]:hover,textarea:hover,select:hover{border-color:var(--color-border-secondary)}
  input[type="text"]:focus,input[type="number"]:focus,textarea:focus,select:focus{border-color:var(--color-border-primary);box-shadow:0 0 0 2px rgba(0,0,0,0.06)}

  /* SVG text classes */
  svg .t{font-family:var(--font-sans);font-size:14px;fill:var(--p)}
  svg .ts{font-family:var(--font-sans);font-size:12px;fill:var(--s)}
  svg .th{font-family:var(--font-sans);font-size:14px;font-weight:500;fill:var(--p)}
  svg .box{fill:var(--bg2);stroke:var(--b)}
  svg .node{cursor:pointer}
  svg .node:hover{opacity:0.8}
  svg .arr{stroke:var(--t);stroke-width:1.5;fill:none}
  svg .leader{stroke:var(--t);stroke-width:0.5;stroke-dasharray:4 3;fill:none}

  /* SVG color ramps — light mode: 50 fill, 600 stroke, 800 title, 600 subtitle */
  svg .c-purple>rect,svg .c-purple>circle,svg .c-purple>ellipse{fill:#EEEDFE;stroke:#534AB7}
  svg .c-purple>.th,svg .c-purple>.t{fill:#3C3489} svg .c-purple>.ts{fill:#534AB7}
  svg rect.c-purple,svg circle.c-purple,svg ellipse.c-purple{fill:#EEEDFE;stroke:#534AB7}
  svg .c-teal>rect,svg .c-teal>circle,svg .c-teal>ellipse{fill:#E1F5EE;stroke:#0F6E56}
  svg .c-teal>.th,svg .c-teal>.t{fill:#085041} svg .c-teal>.ts{fill:#0F6E56}
  svg rect.c-teal,svg circle.c-teal,svg ellipse.c-teal{fill:#E1F5EE;stroke:#0F6E56}
  svg .c-coral>rect,svg .c-coral>circle,svg .c-coral>ellipse{fill:#FAECE7;stroke:#993C1D}
  svg .c-coral>.th,svg .c-coral>.t{fill:#712B13} svg .c-coral>.ts{fill:#993C1D}
  svg rect.c-coral,svg circle.c-coral,svg ellipse.c-coral{fill:#FAECE7;stroke:#993C1D}
  svg .c-pink>rect,svg .c-pink>circle,svg .c-pink>ellipse{fill:#FBEAF0;stroke:#993556}
  svg .c-pink>.th,svg .c-pink>.t{fill:#72243E} svg .c-pink>.ts{fill:#993556}
  svg rect.c-pink,svg circle.c-pink,svg ellipse.c-pink{fill:#FBEAF0;stroke:#993556}
  svg .c-gray>rect,svg .c-gray>circle,svg .c-gray>ellipse{fill:#F1EFE8;stroke:#5F5E5A}
  svg .c-gray>.th,svg .c-gray>.t{fill:#444441} svg .c-gray>.ts{fill:#5F5E5A}
  svg rect.c-gray,svg circle.c-gray,svg ellipse.c-gray{fill:#F1EFE8;stroke:#5F5E5A}
  svg .c-blue>rect,svg .c-blue>circle,svg .c-blue>ellipse{fill:#E6F1FB;stroke:#185FA5}
  svg .c-blue>.th,svg .c-blue>.t{fill:#0C447C} svg .c-blue>.ts{fill:#185FA5}
  svg rect.c-blue,svg circle.c-blue,svg ellipse.c-blue{fill:#E6F1FB;stroke:#185FA5}
  svg .c-green>rect,svg .c-green>circle,svg .c-green>ellipse{fill:#EAF3DE;stroke:#3B6D11}
  svg .c-green>.th,svg .c-green>.t{fill:#27500A} svg .c-green>.ts{fill:#3B6D11}
  svg rect.c-green,svg circle.c-green,svg ellipse.c-green{fill:#EAF3DE;stroke:#3B6D11}
  svg .c-amber>rect,svg .c-amber>circle,svg .c-amber>ellipse{fill:#FAEEDA;stroke:#854F0B}
  svg .c-amber>.th,svg .c-amber>.t{fill:#633806} svg .c-amber>.ts{fill:#854F0B}
  svg rect.c-amber,svg circle.c-amber,svg ellipse.c-amber{fill:#FAEEDA;stroke:#854F0B}
  svg .c-red>rect,svg .c-red>circle,svg .c-red>ellipse{fill:#FCEBEB;stroke:#A32D2D}
  svg .c-red>.th,svg .c-red>.t{fill:#791F1F} svg .c-red>.ts{fill:#A32D2D}
  svg rect.c-red,svg circle.c-red,svg ellipse.c-red{fill:#FCEBEB;stroke:#A32D2D}

  @media (prefers-color-scheme: dark){
    :root{
      --color-text-primary:#e5e7eb;
      --color-text-secondary:#cbd5e1;
      --color-text-tertiary:#94a3b8;
      --color-text-info:#93c5fd;
      --color-text-danger:#fca5a5;
      --color-text-success:#86efac;
      --color-text-warning:#fcd34d;
      --color-background-primary:#0f172a;
      --color-background-secondary:#1e293b;
      --color-background-tertiary:#334155;
      --color-background-info:#1e3a8a;
      --color-background-danger:#7f1d1d;
      --color-background-success:#14532d;
      --color-background-warning:#78350f;
      --color-border-primary:rgba(255,255,255,.5);
      --color-border-secondary:rgba(255,255,255,.35);
      --color-border-tertiary:rgba(255,255,255,.18);
      --p:#e5e7eb;--s:#94a3b8;--t:#64748b;--bg2:#1e293b;--b:#475569;
    }
    input[type="text"]:focus,input[type="number"]:focus,textarea:focus,select:focus{box-shadow:0 0 0 2px rgba(255,255,255,0.1)}
    /* SVG color ramps — dark mode: 800 fill, 200 stroke, 100 title, 200 subtitle */
    svg .c-purple>rect,svg .c-purple>circle,svg .c-purple>ellipse{fill:#3C3489;stroke:#AFA9EC}
    svg .c-purple>.th,svg .c-purple>.t{fill:#CECBF6} svg .c-purple>.ts{fill:#AFA9EC}
    svg rect.c-purple,svg circle.c-purple,svg ellipse.c-purple{fill:#3C3489;stroke:#AFA9EC}
    svg .c-teal>rect,svg .c-teal>circle,svg .c-teal>ellipse{fill:#085041;stroke:#5DCAA5}
    svg .c-teal>.th,svg .c-teal>.t{fill:#9FE1CB} svg .c-teal>.ts{fill:#5DCAA5}
    svg rect.c-teal,svg circle.c-teal,svg ellipse.c-teal{fill:#085041;stroke:#5DCAA5}
    svg .c-coral>rect,svg .c-coral>circle,svg .c-coral>ellipse{fill:#712B13;stroke:#F0997B}
    svg .c-coral>.th,svg .c-coral>.t{fill:#F5C4B3} svg .c-coral>.ts{fill:#F0997B}
    svg rect.c-coral,svg circle.c-coral,svg ellipse.c-coral{fill:#712B13;stroke:#F0997B}
    svg .c-pink>rect,svg .c-pink>circle,svg .c-pink>ellipse{fill:#72243E;stroke:#ED93B1}
    svg .c-pink>.th,svg .c-pink>.t{fill:#F4C0D1} svg .c-pink>.ts{fill:#ED93B1}
    svg rect.c-pink,svg circle.c-pink,svg ellipse.c-pink{fill:#72243E;stroke:#ED93B1}
    svg .c-gray>rect,svg .c-gray>circle,svg .c-gray>ellipse{fill:#444441;stroke:#B4B2A9}
    svg .c-gray>.th,svg .c-gray>.t{fill:#D3D1C7} svg .c-gray>.ts{fill:#B4B2A9}
    svg rect.c-gray,svg circle.c-gray,svg ellipse.c-gray{fill:#444441;stroke:#B4B2A9}
    svg .c-blue>rect,svg .c-blue>circle,svg .c-blue>ellipse{fill:#0C447C;stroke:#85B7EB}
    svg .c-blue>.th,svg .c-blue>.t{fill:#B5D4F4} svg .c-blue>.ts{fill:#85B7EB}
    svg rect.c-blue,svg circle.c-blue,svg ellipse.c-blue{fill:#0C447C;stroke:#85B7EB}
    svg .c-green>rect,svg .c-green>circle,svg .c-green>ellipse{fill:#27500A;stroke:#97C459}
    svg .c-green>.th,svg .c-green>.t{fill:#C0DD97} svg .c-green>.ts{fill:#97C459}
    svg rect.c-green,svg circle.c-green,svg ellipse.c-green{fill:#27500A;stroke:#97C459}
    svg .c-amber>rect,svg .c-amber>circle,svg .c-amber>ellipse{fill:#633806;stroke:#EF9F27}
    svg .c-amber>.th,svg .c-amber>.t{fill:#FAC775} svg .c-amber>.ts{fill:#EF9F27}
    svg rect.c-amber,svg circle.c-amber,svg ellipse.c-amber{fill:#633806;stroke:#EF9F27}
    svg .c-red>rect,svg .c-red>circle,svg .c-red>ellipse{fill:#791F1F;stroke:#F09595}
    svg .c-red>.th,svg .c-red>.t{fill:#F7C1C1} svg .c-red>.ts{fill:#F09595}
    svg rect.c-red,svg circle.c-red,svg ellipse.c-red{fill:#791F1F;stroke:#F09595}
  }
</style>`;

export function WidgetFrame({ widgetCode, status, loadingMessages, height }: WidgetFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingHtmlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
          nextScript.textContent = oldScript.textContent;
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
