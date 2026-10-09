// 第 07 章：劳动者新生 —— 就业结构重塑
// 世界经济论坛《2025 年未来就业报告》（2025—2030 年，覆盖约 12 亿正规就业岗位）

export const WEF_FLOW = {
  base: 1200, // 百万
  created: 170,
  displaced: 92,
  net: 78,
  churn: 22,
  skillsChange: 39,
  aiCreated: 11, // AI 与信息处理技术创造（百万）
  aiDisplaced: 9,
};

// 桑基图：2025 年岗位 → 2030 年岗位（单位：百万个）
export const JOB_SANKEY = {
  nodes: [
    { id: 'now', name: '2025 年现有岗位', slot: 6 },
    { id: 'new', name: '新创造岗位', slot: 0 },
    { id: 'keep', name: '延续的岗位', slot: 6 },
    { id: 'gone', name: '被替代岗位', slot: 1 },
    { id: 'future', name: '2030 年岗位', slot: 'accent' },
    { id: 'transition', name: '需转岗 / 再培训', slot: 1 },
  ],
  links: [
    { source: 'now', target: 'keep', value: 1108 },
    { source: 'now', target: 'gone', value: 92 },
    { source: 'keep', target: 'future', value: 1108 },
    { source: 'new', target: 'future', value: 170 },
    { source: 'gone', target: 'transition', value: 92 },
  ],
};

// 增长最快 / 下降最快的岗位（2025—2030 年净增长率，%）
export const JOBS_GROWTH = [
  { name: '大数据专家', value: 113 },
  { name: '金融科技工程师', value: 93 },
  { name: 'AI 与机器学习专家', value: 82 },
  { name: '软件与应用开发者', value: 57 },
  { name: '安全管理专家', value: 53 },
  { name: '数据仓库专家', value: 49 },
  { name: '自动驾驶与电动车专家', value: 48 },
  { name: 'UI / UX 设计师', value: 48 },
  { name: '邮政服务员', value: -34 },
  { name: '银行柜员', value: -31 },
  { name: '数据录入员', value: -26 },
  { name: '收银与售票员', value: -20 },
  { name: '行政助理与秘书', value: -20 },
  { name: '印刷从业者', value: -20 },
  { name: '会计、簿记与薪资文员', value: -18 },
  { name: '物料记录与仓储文员', value: -16 },
];

// IMF（2024.01）：受 AI 影响（暴露）的就业占比
export const IMF_EXPOSURE = [
  { name: '全球', value: 40 },
  { name: '发达经济体', value: 60 },
  { name: '新兴市场', value: 40 },
  { name: '低收入国家', value: 26 },
];
