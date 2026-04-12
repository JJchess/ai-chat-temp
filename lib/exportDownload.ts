/** Client-side helpers to save widget HTML and session payloads. */

import { widgetSurfaceInnerHtml } from './widgetShell';
import { buildStandaloneWidgetDocumentCss } from './widgetStandaloneTheme';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fileStemFromTitle(title: string): string {
  const cleaned = title.replaceAll('_', '-').replace(/[^\w\u4e00-\u9fff-]+/gu, '-').replace(/^-+|-+$/g, '');
  return cleaned.slice(0, 48) || 'widget';
}

export function downloadTextFile(filename: string, contents: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadWidgetAsHtml(title: string, widgetCode: string, heightPx?: number) {
  const stem = fileStemFromTitle(title);
  const safeTitle = escapeHtml(title.replaceAll('_', ' '));
  const frameHeight = typeof heightPx === 'number' && heightPx > 0 ? heightPx : 460;
  const inner = widgetSurfaceInnerHtml(widgetCode);
  const docCss = buildStandaloneWidgetDocumentCss(frameHeight);
  const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${docCss}</style>
</head>
<body>
  <script>
    window.sendPrompt = window.sendPrompt || function () {};
    window.openLink = window.openLink || function (url) {
      if (url) window.open(String(url), '_blank', 'noopener,noreferrer');
    };
  </script>
  <div class="widget-export-chrome">${inner}</div>
</body>
</html>
`;
  downloadTextFile(`${stem}.html`, doc, 'text/html;charset=utf-8');
}

export function downloadJsonFile(filename: string, data: unknown) {
  downloadTextFile(filename, `${JSON.stringify(data, null, 2)}\n`, 'application/json;charset=utf-8');
}
