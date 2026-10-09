// JS 端色板（d3 / SVG 属性 / canvas / p5 使用），与 styles/tokens.css 两套主题一一对应。
// 组件中请通过 lib/stores/theme.svelte.js 导出的响应式对象 `pal` 读取，主题切换时自动更新。

const DARK = {
  mode: 'dark',
  series: ['#1898c2', '#e0703a', '#8b7cf6', '#1f9e6e', '#b8890f', '#e0609a', '#4a7ff0', '#e05a5a'],
  // 单色相顺序色阶：深色背景下"接近背景 = 小值，越亮 = 越大"
  seq: ['#13263d', '#14466a', '#156c96', '#1898c2', '#56c3e6', '#a6e6fa'],
  // 有序色阶（金字塔等）：由高阶到低阶
  ordinal: ['#a6e6fa', '#56c3e6', '#1898c2', '#156c96'],
  div: { pos: '#1898c2', neg: '#e0703a', mid: '#3a4256' },
  page: '#070b14',
  surface1: '#0f1626',
  surface2: '#151e33',
  surface3: '#1c2740',
  text1: '#f2f5fa',
  text2: '#aab4c8',
  text3: '#7d89a1',
  grid: '#1c2740',
  axis: '#2e3b58',
  ring: '#0f1626',
  muted: '#3a4a6b',
  empty: '#1c2740',
  accent: '#34d4ff',
  accent2: '#8b7cf6',
  accentRGB: '52,212,255',
  accent2RGB: '139,124,246',
  warn: '#e0703a',
  hero: { particles: [[52, 212, 255], [106, 168, 255], [139, 124, 246]], free: 110, line: '52,212,255' },
  globe: { ocean: '#0b1322', grat: 'rgba(255,255,255,0.05)', stroke: 'rgba(7,11,20,0.7)', hover: '#f2f5fa', rim: 'rgba(52,212,255,0.35)' },
  map: { land: '#111a2c', border: '#2e3b58', jd: '#4a5a7c', cluster: '#f2f5fa', flowDot: '#a6e6fa', pilot: '#8b7cf6' },
};

const LIGHT = {
  mode: 'light',
  series: ['#0b87b8', '#e55f1c', '#6a4be3', '#0f8a59', '#c98b00', '#d9407f', '#2a62dc', '#d63a3a'],
  // 浅色背景下"接近背景 = 小值，越深 = 越大"
  seq: ['#e3f2fa', '#b4dcf0', '#78bfe2', '#3b9cce', '#0b75ad', '#08497a'],
  ordinal: ['#08497a', '#0b75ad', '#3b9cce', '#78bfe2'],
  div: { pos: '#0b87b8', neg: '#e55f1c', mid: '#d5dae4' },
  page: '#eef2f8',
  surface1: '#ffffff',
  surface2: '#f4f6fb',
  surface3: '#e6ebf3',
  text1: '#0a0f1f',
  text2: '#3b4560',
  text3: '#68728b',
  grid: '#e6eaf1',
  axis: '#c2cad8',
  ring: '#ffffff',
  muted: '#c5cedd',
  empty: '#e3e8f1',
  accent: '#0b63ff',
  accent2: '#7b2ff7',
  accentRGB: '11,99,255',
  accent2RGB: '123,47,247',
  warn: '#e55f1c',
  hero: { particles: [[11, 99, 255], [123, 47, 247], [255, 46, 126]], free: 130, line: '11,99,255' },
  globe: { ocean: '#e4ecf7', grat: 'rgba(10,30,80,0.07)', stroke: '#ffffff', hover: '#0a0f1f', rim: 'rgba(11,99,255,0.4)' },
  map: { land: '#e3e9f2', border: '#c2cad8', jd: '#8a96ad', cluster: '#0a0f1f', flowDot: '#0b63ff', pilot: '#6a4be3' },
};

export const PALETTES = { dark: DARK, light: LIGHT };
