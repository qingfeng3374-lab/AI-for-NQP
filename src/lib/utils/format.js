import { format } from 'd3';
import { isEn } from '../i18n/lang.svelte.js';

export const fmtInt = format(',d');
export const fmt1 = format(',.1f');
export const fmt2 = format(',.2f');
export const fmtPct = (v, d = 0) => `${(+v).toFixed(d)}%`;

/** 科学计数法 → 上标形式，如 3.1×10²³ */
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function fmtSci(v, digits = 1) {
  if (!v) return '0';
  const e = Math.floor(Math.log10(v));
  const m = v / 10 ** e;
  const sup = String(e)
    .split('')
    .map((c) => SUP[c])
    .join('');
  return `${m.toFixed(digits)}×10${sup}`;
}
export function fmtPow10(e) {
  const sup = String(e)
    .split('')
    .map((c) => SUP[c])
    .join('');
  return `10${sup}`;
}

/** 中文数量级：亿、万（英文模式：billion / million / thousand） */
export function fmtCN(v, digits = 1) {
  if (isEn()) {
    if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(digits)} billion`;
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(digits)} million`;
    if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(digits)}k`;
    return fmtInt(v);
  }
  if (Math.abs(v) >= 1e8) return `${(v / 1e8).toFixed(digits)}亿`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e4).toFixed(digits)}万`;
  return fmtInt(v);
}
