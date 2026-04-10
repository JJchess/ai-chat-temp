'use client';

import { useEffect, useMemo, useRef } from 'react';

interface WidgetFrameProps {
  widgetCode: string;
  status: 'streaming' | 'completed';
  height?: number;
}

const shellHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#ffffff;color:#111827;font-family:Inter,Arial,sans-serif}
    #root{padding:12px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window._morphReady = false;
    window._pendingHtml = '';
    window._setContent = function (html) {
      if (!window._morphReady) {
        window._pendingHtml = html;
        return;
      }
      const root = document.getElementById('root');
      const target = document.createElement('div');
      target.id = 'root';
      target.innerHTML = html;
      window.morphdom(root, target, {
        onBeforeElUpdated: function(from, to) {
          if (from.isEqualNode(to)) return false;
          return true;
        },
        onNodeAdded: function(node) {
          if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            node.style.animation = 'fadeIn .2s ease both';
          }
          return node;
        }
      });
    };
    window._runScripts = function() {
      document.querySelectorAll('#root script').forEach(function(oldScript) {
        const nextScript = document.createElement('script');
        if (oldScript.src) {
          nextScript.src = oldScript.src;
        } else {
          nextScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(nextScript, oldScript);
      });
    };
    window.addEventListener('message', function (event) {
      const payload = event.data || {};
      if (payload.type === 'widget:set') {
        window._setContent(payload.html || '');
      }
      if (payload.type === 'widget:finalize') {
        window._setContent(payload.html || '');
        window._runScripts();
      }
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js" onload="window._morphReady=true;if(window._pendingHtml){window._setContent(window._pendingHtml);}"></script>
</body>
</html>`;

export function WidgetFrame({ widgetCode, status, height }: WidgetFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameHeight = height ?? 520;

  const messagePayload = useMemo(
    () => ({
      type: status === 'completed' ? 'widget:finalize' : 'widget:set',
      html: widgetCode,
    }),
    [status, widgetCode]
  );

  useEffect(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage(messagePayload, '*');
  }, [messagePayload]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={shellHtml}
      title="generated-widget"
      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
      style={{ height: `${frameHeight}px` }}
      sandbox="allow-scripts"
    />
  );
}
