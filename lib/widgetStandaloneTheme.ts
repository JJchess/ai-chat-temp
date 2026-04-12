/**
 * Offline copy of widget design tokens from ``app/globals.css`` (:root + dark).
 * When you change widget colors there, update this string so downloaded HTML matches.
 */
export const WIDGET_STANDALONE_THEME_CSS = `
:root {
  --background: #ffffff;
  --foreground: #171717;
  --widget-base-text: #111827;
  --widget-base-bg: #ffffff;
  --widget-base-border: #111827;
  --widget-accent-info: #378ADD;
  --widget-accent-danger: #E24B4A;
  --widget-accent-success: #639922;
  --widget-accent-warning: #BA7517;
  --ramp-purple: #7F77DD;
  --ramp-teal: #1D9E75;
  --ramp-coral: #D85A30;
  --ramp-pink: #D4537E;
  --ramp-gray: #888780;
  --ramp-blue: #378ADD;
  --ramp-green: #639922;
  --ramp-amber: #BA7517;
  --ramp-red: #E24B4A;
  --widget-text-primary: var(--widget-base-text);
  --widget-text-secondary: color-mix(in oklch, var(--widget-base-text) 65%, transparent);
  --widget-text-tertiary: color-mix(in oklch, var(--widget-base-text) 45%, transparent);
  --widget-text-info: color-mix(in oklch, var(--widget-accent-info) 85%, black);
  --widget-text-danger: color-mix(in oklch, var(--widget-accent-danger) 85%, black);
  --widget-text-success: color-mix(in oklch, var(--widget-accent-success) 85%, black);
  --widget-text-warning: color-mix(in oklch, var(--widget-accent-warning) 85%, black);
  --widget-bg-primary: var(--widget-base-bg);
  --widget-bg-secondary: color-mix(in oklch, var(--widget-base-bg) 96%, var(--widget-base-text));
  --widget-bg-tertiary: color-mix(in oklch, var(--widget-base-bg) 92%, var(--widget-base-text));
  --widget-bg-info: color-mix(in oklch, var(--widget-accent-info) 12%, var(--widget-base-bg));
  --widget-bg-danger: color-mix(in oklch, var(--widget-accent-danger) 10%, var(--widget-base-bg));
  --widget-bg-success: color-mix(in oklch, var(--widget-accent-success) 10%, var(--widget-base-bg));
  --widget-bg-warning: color-mix(in oklch, var(--widget-accent-warning) 10%, var(--widget-base-bg));
  --widget-border-primary: color-mix(in oklch, var(--widget-base-border) 40%, transparent);
  --widget-border-secondary: color-mix(in oklch, var(--widget-base-border) 25%, transparent);
  --widget-border-tertiary: color-mix(in oklch, var(--widget-base-border) 15%, transparent);
  --widget-border-info: color-mix(in oklch, var(--widget-accent-info) 50%, var(--widget-base-bg));
  --widget-border-danger: color-mix(in oklch, var(--widget-accent-danger) 50%, var(--widget-base-bg));
  --widget-border-success: color-mix(in oklch, var(--widget-accent-success) 50%, var(--widget-base-bg));
  --widget-border-warning: color-mix(in oklch, var(--widget-accent-warning) 50%, var(--widget-base-bg));
  --widget-font-sans: Inter, Arial, sans-serif;
  --widget-font-serif: Georgia, serif;
  --widget-font-mono: ui-monospace, Consolas, monospace;
  --widget-radius-md: 8px;
  --widget-radius-lg: 12px;
  --widget-radius-xl: 16px;
  --widget-focus-shadow: 0 0 0 2px color-mix(in oklch, var(--widget-base-text) 8%, transparent);
  --widget-svg-p: var(--widget-text-primary);
  --widget-svg-s: var(--widget-text-secondary);
  --widget-svg-t: var(--widget-text-tertiary);
  --widget-svg-bg2: var(--widget-bg-secondary);
  --widget-svg-b: var(--widget-border-secondary);
  --ramp-purple-fill: color-mix(in oklch, var(--ramp-purple) 18%, var(--widget-base-bg));
  --ramp-purple-stroke: color-mix(in oklch, var(--ramp-purple) 75%, black);
  --ramp-purple-title: color-mix(in oklch, var(--ramp-purple) 88%, black);
  --ramp-purple-sub: color-mix(in oklch, var(--ramp-purple) 75%, black);
  --ramp-teal-fill: color-mix(in oklch, var(--ramp-teal) 18%, var(--widget-base-bg));
  --ramp-teal-stroke: color-mix(in oklch, var(--ramp-teal) 75%, black);
  --ramp-teal-title: color-mix(in oklch, var(--ramp-teal) 88%, black);
  --ramp-teal-sub: color-mix(in oklch, var(--ramp-teal) 75%, black);
  --ramp-coral-fill: color-mix(in oklch, var(--ramp-coral) 18%, var(--widget-base-bg));
  --ramp-coral-stroke: color-mix(in oklch, var(--ramp-coral) 75%, black);
  --ramp-coral-title: color-mix(in oklch, var(--ramp-coral) 88%, black);
  --ramp-coral-sub: color-mix(in oklch, var(--ramp-coral) 75%, black);
  --ramp-pink-fill: color-mix(in oklch, var(--ramp-pink) 18%, var(--widget-base-bg));
  --ramp-pink-stroke: color-mix(in oklch, var(--ramp-pink) 75%, black);
  --ramp-pink-title: color-mix(in oklch, var(--ramp-pink) 88%, black);
  --ramp-pink-sub: color-mix(in oklch, var(--ramp-pink) 75%, black);
  --ramp-gray-fill: color-mix(in oklch, var(--ramp-gray) 18%, var(--widget-base-bg));
  --ramp-gray-stroke: color-mix(in oklch, var(--ramp-gray) 75%, black);
  --ramp-gray-title: color-mix(in oklch, var(--ramp-gray) 88%, black);
  --ramp-gray-sub: color-mix(in oklch, var(--ramp-gray) 75%, black);
  --ramp-blue-fill: color-mix(in oklch, var(--ramp-blue) 18%, var(--widget-base-bg));
  --ramp-blue-stroke: color-mix(in oklch, var(--ramp-blue) 75%, black);
  --ramp-blue-title: color-mix(in oklch, var(--ramp-blue) 88%, black);
  --ramp-blue-sub: color-mix(in oklch, var(--ramp-blue) 75%, black);
  --ramp-green-fill: color-mix(in oklch, var(--ramp-green) 18%, var(--widget-base-bg));
  --ramp-green-stroke: color-mix(in oklch, var(--ramp-green) 75%, black);
  --ramp-green-title: color-mix(in oklch, var(--ramp-green) 88%, black);
  --ramp-green-sub: color-mix(in oklch, var(--ramp-green) 75%, black);
  --ramp-amber-fill: color-mix(in oklch, var(--ramp-amber) 18%, var(--widget-base-bg));
  --ramp-amber-stroke: color-mix(in oklch, var(--ramp-amber) 75%, black);
  --ramp-amber-title: color-mix(in oklch, var(--ramp-amber) 88%, black);
  --ramp-amber-sub: color-mix(in oklch, var(--ramp-amber) 75%, black);
  --ramp-red-fill: color-mix(in oklch, var(--ramp-red) 18%, var(--widget-base-bg));
  --ramp-red-stroke: color-mix(in oklch, var(--ramp-red) 75%, black);
  --ramp-red-title: color-mix(in oklch, var(--ramp-red) 88%, black);
  --ramp-red-sub: color-mix(in oklch, var(--ramp-red) 75%, black);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --widget-base-text: #e5e7eb;
    --widget-base-bg: #0f172a;
    --widget-base-border: #e5e7eb;
    --widget-bg-secondary: color-mix(in oklch, var(--widget-base-bg) 75%, var(--widget-base-text));
    --widget-bg-tertiary: color-mix(in oklch, var(--widget-base-bg) 58%, var(--widget-base-text));
    --widget-svg-bg2: var(--widget-bg-secondary);
    --widget-text-info: color-mix(in oklch, var(--widget-accent-info) 40%, white);
    --widget-text-danger: color-mix(in oklch, var(--widget-accent-danger) 40%, white);
    --widget-text-success: color-mix(in oklch, var(--widget-accent-success) 40%, white);
    --widget-text-warning: color-mix(in oklch, var(--widget-accent-warning) 40%, white);
    --widget-bg-info: color-mix(in oklch, var(--widget-accent-info) 25%, black);
    --widget-bg-danger: color-mix(in oklch, var(--widget-accent-danger) 25%, black);
    --widget-bg-success: color-mix(in oklch, var(--widget-accent-success) 25%, black);
    --widget-bg-warning: color-mix(in oklch, var(--widget-accent-warning) 25%, black);
    --widget-focus-shadow: 0 0 0 2px color-mix(in oklch, var(--widget-base-text) 12%, transparent);
    --ramp-purple-fill: color-mix(in oklch, var(--ramp-purple) 85%, black);
    --ramp-purple-stroke: color-mix(in oklch, var(--ramp-purple) 35%, white);
    --ramp-purple-title: color-mix(in oklch, var(--ramp-purple) 18%, white);
    --ramp-purple-sub: color-mix(in oklch, var(--ramp-purple) 35%, white);
    --ramp-teal-fill: color-mix(in oklch, var(--ramp-teal) 85%, black);
    --ramp-teal-stroke: color-mix(in oklch, var(--ramp-teal) 35%, white);
    --ramp-teal-title: color-mix(in oklch, var(--ramp-teal) 18%, white);
    --ramp-teal-sub: color-mix(in oklch, var(--ramp-teal) 35%, white);
    --ramp-coral-fill: color-mix(in oklch, var(--ramp-coral) 85%, black);
    --ramp-coral-stroke: color-mix(in oklch, var(--ramp-coral) 35%, white);
    --ramp-coral-title: color-mix(in oklch, var(--ramp-coral) 18%, white);
    --ramp-coral-sub: color-mix(in oklch, var(--ramp-coral) 35%, white);
    --ramp-pink-fill: color-mix(in oklch, var(--ramp-pink) 85%, black);
    --ramp-pink-stroke: color-mix(in oklch, var(--ramp-pink) 35%, white);
    --ramp-pink-title: color-mix(in oklch, var(--ramp-pink) 18%, white);
    --ramp-pink-sub: color-mix(in oklch, var(--ramp-pink) 35%, white);
    --ramp-gray-fill: color-mix(in oklch, var(--ramp-gray) 85%, black);
    --ramp-gray-stroke: color-mix(in oklch, var(--ramp-gray) 35%, white);
    --ramp-gray-title: color-mix(in oklch, var(--ramp-gray) 18%, white);
    --ramp-gray-sub: color-mix(in oklch, var(--ramp-gray) 35%, white);
    --ramp-blue-fill: color-mix(in oklch, var(--ramp-blue) 85%, black);
    --ramp-blue-stroke: color-mix(in oklch, var(--ramp-blue) 35%, white);
    --ramp-blue-title: color-mix(in oklch, var(--ramp-blue) 18%, white);
    --ramp-blue-sub: color-mix(in oklch, var(--ramp-blue) 35%, white);
    --ramp-green-fill: color-mix(in oklch, var(--ramp-green) 85%, black);
    --ramp-green-stroke: color-mix(in oklch, var(--ramp-green) 35%, white);
    --ramp-green-title: color-mix(in oklch, var(--ramp-green) 18%, white);
    --ramp-green-sub: color-mix(in oklch, var(--ramp-green) 35%, white);
    --ramp-amber-fill: color-mix(in oklch, var(--ramp-amber) 85%, black);
    --ramp-amber-stroke: color-mix(in oklch, var(--ramp-amber) 35%, white);
    --ramp-amber-title: color-mix(in oklch, var(--ramp-amber) 18%, white);
    --ramp-amber-sub: color-mix(in oklch, var(--ramp-amber) 35%, white);
    --ramp-red-fill: color-mix(in oklch, var(--ramp-red) 85%, black);
    --ramp-red-stroke: color-mix(in oklch, var(--ramp-red) 35%, white);
    --ramp-red-title: color-mix(in oklch, var(--ramp-red) 18%, white);
    --ramp-red-sub: color-mix(in oklch, var(--ramp-red) 35%, white);
  }
}
`;

const EXPORT_CHROME_CSS = `
body { margin: 0; padding: 24px; background: var(--background); color: var(--foreground); }
.widget-export-chrome {
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid var(--widget-border-secondary);
  border-radius: 12px;
  background: var(--widget-bg-primary);
  box-sizing: border-box;
  overflow: auto;
}
`;

export function buildStandaloneWidgetDocumentCss(frameHeightPx: number): string {
  return `${WIDGET_STANDALONE_THEME_CSS}\n${EXPORT_CHROME_CSS}\n.widget-export-chrome{min-height:${frameHeightPx}px;}`;
}
