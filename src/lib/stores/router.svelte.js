// 极简 hash 路由（纯静态部署友好，如 GitHub Pages）
// - "#/graph" 等以 "#/" 开头的 hash 表示页面
// - 其余 hash（如 "#concept"）视为叙事页内的章节锚点
export const PAGES = [
  { id: 'story', path: '/', name: '数据叙事', short: '叙事', desc: '十章滚动叙事：从千年生产力曲线到"人工智能+"' },
  { id: 'graph', path: '/graph', name: '知识图谱', short: '图谱', desc: '力导向网络：AI 如何连接三要素、产业与发展目标' },
  { id: 'timeline', path: '/timeline', name: 'AI 时光轴', short: '时光轴', desc: '可缩放的 80 年 AI 里程碑，与训练算力曲线联动' },
  { id: 'job', path: '/job', name: '岗位诊断', short: '岗位', desc: '自测你的工作中哪些任务会被 AI 替代、增强或仍由人主导' },
  { id: 'roi', path: '/roi', name: '效益测算', short: '效益', desc: '估算企业引入 AI 的效率红利、投资回报与回收期' },
  { id: 'data', path: '/data', name: '数据工作台', short: '数据', desc: '浏览、对比、下载本站全部数据集' },
];

function parse() {
  const h = typeof location === 'undefined' ? '' : location.hash;
  if (h.startsWith('#/')) {
    const p = h.slice(1).split('?')[0];
    const page = PAGES.find((x) => x.path === p);
    return { page: page ? page.id : 'story', anchor: '' };
  }
  return { page: 'story', anchor: h.slice(1) };
}

export const route = $state(parse());

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const prev = route.page;
    const next = parse();
    route.page = next.page;
    route.anchor = next.anchor;
    // 切换页面时回到顶部（叙事页锚点由页面自身滚动）
    if (prev !== next.page && !next.anchor) window.scrollTo({ top: 0 });
  });
}

export function hrefOf(id) {
  const p = PAGES.find((x) => x.id === id);
  return p.path === '/' ? '#/' : `#${p.path}`;
}
