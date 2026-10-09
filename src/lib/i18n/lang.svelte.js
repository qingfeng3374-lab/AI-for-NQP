// 全站中英文切换
// 用法：在模板或 $derived 中调用 tr('中文原文', { 参数 })。
// - 中文模式直接返回原文；英文模式到词典（lib/i18n/en/*.js，以中文原文为键）中查找译文，缺失时回退原文。
// - 必须在渲染时调用（模板 / $derived / 事件回调），不要在模块顶层或一次性 const 中调用，否则不会随语言切换更新。
const modules = import.meta.glob('./en/*.js', { eager: true });
const DICT = Object.assign({}, ...Object.values(modules).map((m) => m.default));

const KEY = 'aiqp-lang';
const initial = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'zh';
export const lang = $state({ code: initial });

const misses = new Set();
if (typeof window !== 'undefined') window.__i18nMisses = misses;

export function tr(s, params) {
  if (s == null) return s;
  let out = s;
  if (lang.code === 'en') {
    const hit = DICT[s];
    if (hit === undefined) misses.add(s);
    else out = hit;
  }
  if (params) out = out.replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m));
  return out;
}

export const isEn = () => lang.code === 'en';
/** 数字格式化使用的区域设置 */
export const loc = () => (lang.code === 'en' ? 'en-US' : 'zh-CN');

export function setLang(code) {
  lang.code = code;
  document.documentElement.lang = code === 'en' ? 'en' : 'zh-CN';
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* 忽略 */
  }
}
export function toggleLang() {
  setLang(lang.code === 'en' ? 'zh' : 'en');
}
