import { flushSync } from 'svelte';
import { PALETTES } from '../utils/palette.js';

// 主题状态：dark（夜间，默认）| light（日间）
// - CSS 侧：<html data-theme="..."> 切换 tokens.css 中的变量
// - JS 侧：`pal` 为响应式色板，SVG 属性 / canvas / p5 读取它即可随主题更新
const KEY = 'aiqp-theme';

function readInitial() {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.dataset.theme;
  return attr === 'light' ? 'light' : 'dark';
}

const init = readInitial();
export const theme = $state({ mode: init });
export const pal = $state(structuredClone(PALETTES[init]));

/** 将数据中的色板位置（数字下标或 'accent'）解析为当前主题下的颜色 */
export const slotColor = (slot) => (slot === 'accent' ? pal.accent : pal.series[slot] ?? pal.series[0]);

function apply(mode) {
  theme.mode = mode;
  Object.assign(pal, structuredClone(PALETTES[mode]));
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* 隐私模式等情况下忽略 */
  }
}

/**
 * 切换主题：支持 View Transitions API 的浏览器上，以点击位置为圆心做"圆形扩散"揭示动画；
 * 否则直接切换。
 */
export function toggleTheme(event) {
  const next = theme.mode === 'dark' ? 'light' : 'dark';
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    apply(next);
    return;
  }
  const x = event?.clientX ?? window.innerWidth - 40;
  const y = event?.clientY ?? 28;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const t = document.startViewTransition(() => {
    apply(next);
    flushSync();
  });
  t.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
}
