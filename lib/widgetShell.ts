/**
 * Shared markup/CSS for widget preview (WidgetFrame) and standalone HTML export.
 * Theme variables (--widget-*) come from globals.css at runtime; exports bundle
 * a copy for offline downloads (see widgetStandaloneTheme.ts).
 */

const RAMP_NAMES = ['purple', 'teal', 'coral', 'pink', 'gray', 'blue', 'green', 'amber', 'red'] as const;

function buildRampCSS(ramps: readonly string[]): string {
  return ramps
    .map(r => {
      const sel = (sh: string) => `svg .c-${r}>${sh},svg ${sh}.c-${r}`;
      return [
        `${sel('rect')},${sel('circle')},${sel('ellipse')}{fill:var(--ramp-${r}-fill);stroke:var(--ramp-${r}-stroke)}`,
        `svg .c-${r}>.th,svg .c-${r}>.t{fill:var(--ramp-${r}-title)}`,
        `svg .c-${r}>.ts{fill:var(--ramp-${r}-sub)}`,
      ].join('\n');
    })
    .join('\n');
}

const widgetFrameDesignTokensStyle = `<style>
  :root{
    --color-text-primary:var(--widget-text-primary);
    --color-text-secondary:var(--widget-text-secondary);
    --color-text-tertiary:var(--widget-text-tertiary);
    --color-text-info:var(--widget-text-info);
    --color-text-danger:var(--widget-text-danger);
    --color-text-success:var(--widget-text-success);
    --color-text-warning:var(--widget-text-warning);
    --color-background-primary:var(--widget-bg-primary);
    --color-background-secondary:var(--widget-bg-secondary);
    --color-background-tertiary:var(--widget-bg-tertiary);
    --color-background-info:var(--widget-bg-info);
    --color-background-danger:var(--widget-bg-danger);
    --color-background-success:var(--widget-bg-success);
    --color-background-warning:var(--widget-bg-warning);
    --color-border-primary:var(--widget-border-primary);
    --color-border-secondary:var(--widget-border-secondary);
    --color-border-tertiary:var(--widget-border-tertiary);
    --color-border-info:var(--widget-border-info);
    --color-border-danger:var(--widget-border-danger);
    --color-border-success:var(--widget-border-success);
    --color-border-warning:var(--widget-border-warning);
    --font-sans:var(--widget-font-sans);
    --font-serif:var(--widget-font-serif);
    --font-mono:var(--widget-font-mono);
    --border-radius-md:var(--widget-radius-md);
    --border-radius-lg:var(--widget-radius-lg);
    --border-radius-xl:var(--widget-radius-xl);
    --p:var(--widget-svg-p);--s:var(--widget-svg-s);--t:var(--widget-svg-t);--bg2:var(--widget-svg-bg2);--b:var(--widget-svg-b);
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

  button{background:transparent;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);color:var(--color-text-primary);padding:6px 14px;font-size:14px;cursor:pointer;font-family:var(--font-sans)}
  button:hover{background:var(--color-background-secondary)}
  button:active{transform:scale(0.98)}
  input[type="range"]{-webkit-appearance:none;height:4px;background:var(--color-border-secondary);border-radius:2px;outline:none}
  input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--color-text-primary);cursor:pointer}
  input[type="text"],input[type="number"],textarea,select{height:36px;background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);color:var(--color-text-primary);padding:0 10px;font-size:14px;font-family:var(--font-sans);outline:none}
  input[type="text"]:hover,input[type="number"]:hover,textarea:hover,select:hover{border-color:var(--color-border-secondary)}
  input[type="text"]:focus,input[type="number"]:focus,textarea:focus,select:focus{border-color:var(--color-border-primary);box-shadow:var(--widget-focus-shadow)}

  svg .t{font-family:var(--font-sans);font-size:14px;fill:var(--p)}
  svg .ts{font-family:var(--font-sans);font-size:12px;fill:var(--s)}
  svg .th{font-family:var(--font-sans);font-size:14px;font-weight:500;fill:var(--p)}
  svg .box{fill:var(--bg2);stroke:var(--b)}
  svg .node{cursor:pointer}
  svg .node:hover{opacity:0.8}
  svg .arr{stroke:var(--t);stroke-width:1.5;fill:none}
  svg .leader{stroke:var(--t);stroke-width:0.5;stroke-dasharray:4 3;fill:none}

  ${buildRampCSS(RAMP_NAMES)}
</style>`;

/** Same inner fragment as WidgetFrame injects (tokens + surface wrapper). */
export function widgetSurfaceInnerHtml(widgetCode: string): string {
  return `${widgetFrameDesignTokensStyle}<div data-widget-surface>${widgetCode}</div>`;
}
