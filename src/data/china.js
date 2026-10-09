// 第 04 章：中国动能 —— 规模与底座

// 人工智能核心产业规模（亿元）
// 2020—2023：中国信通院口径；2024：CNNIC 第 56 次报告"突破 7000 亿元"；
// 2025：工信部国新办发布会（2026-01-21）"预计突破 1.2 万亿元"（官方表述，口径或有差异）
export const CORE_INDUSTRY = [
  { label: '2020', value: 3031 },
  { label: '2021', value: 4000, note: '工信部："超过 4000 亿元"' },
  { label: '2022', value: 5080 },
  { label: '2023', value: 5784 },
  { label: '2024', value: 7000, note: 'CNNIC："突破 7000 亿元"（信通院更宽口径为超 9000 亿元）' },
  { label: '2025', value: 12000, note: '工信部："预计突破 1.2 万亿元"', estimate: true },
];

// 《新一代人工智能发展规划》（2017）设定的核心产业规模目标
export const PLAN_TARGETS = [
  { label: '2020', value: 1500, text: '规划目标 1500' },
  { label: '2025', value: 4000, text: '规划目标 4000' },
];

// 算力规模（EFLOPS，FP32 口径）：通用 + 智能
// 来源：工信部、国家数据局；2022 年智能算力 41 EFLOPS 为行业估计
export const COMPUTE_POWER = [
  { label: '2022', general: 139, intelligent: 41 },
  { label: '2023', general: 160, intelligent: 70 },
  { label: '2024', general: 190, intelligent: 90 },
];

// 数字经济规模（万亿元）与占 GDP 比重（%），中国信通院
export const DIGITAL_ECONOMY = [
  { label: '2017', value: 27.2, share: 32.9 },
  { label: '2018', value: 31.3, share: 34.8 },
  { label: '2019', value: 35.8, share: 36.2 },
  { label: '2020', value: 39.2, share: 38.6 },
  { label: '2021', value: 45.5, share: 39.8 },
  { label: '2022', value: 50.2, share: 41.5 },
  { label: '2023', value: 53.9, share: 42.8 },
  { label: '2024', value: 59.2, share: 43.8 },
];

// 生成式 AI 服务累计备案数（款），国家网信办公告
export const GENAI_FILINGS = [
  { label: '24.12', value: 302 },
  { label: '25.03', value: 346 },
  { label: '25.06', value: 439 },
  { label: '25.08', value: 538 },
  { label: '25.12', value: 748 },
  { label: '26.02', value: 796 },
  { label: '26.04', value: 868 },
  { label: '26.06', value: 988 },
  { label: '26.08', value: 1112, note: '据公开报道，约数' },
];

// 工业机器人新装机量（台）：中国 vs 世界其他地区（IFR World Robotics 各年度发布值）
export const ROBOTS = [
  { label: '2019', china: 140500, rest: 373000 - 140500 },
  { label: '2020', china: 168400, rest: 384000 - 168400 },
  { label: '2021', china: 268200, rest: 517400 - 268200 },
  { label: '2022', china: 290258, rest: 553052 - 290258 },
  { label: '2023', china: 276288, rest: 541302 - 276288 },
  { label: '2024', china: 295000, rest: 542000 - 295000 },
  { label: '2025', china: 354000, rest: 603000 - 354000 },
];

// 制造业机器人密度（台 / 万名员工，2023），IFR World Robotics 2024
export const ROBOT_DENSITY = [
  { name: '韩国', value: 1012 },
  { name: '新加坡', value: 770 },
  { name: '中国', value: 470 },
  { name: '德国', value: 429 },
  { name: '日本', value: 419 },
  { name: '美国', value: 295 },
  { name: '全球平均', value: 162 },
];

// 生成式 AI 专利族数量（2014—2023），WIPO《生成式人工智能专利态势报告》（2024）
export const GENAI_PATENTS = [
  { name: '中国', value: 38210 },
  { name: '美国', value: 6276 },
  { name: '韩国', value: 4155 },
  { name: '日本', value: 3409 },
  { name: '印度', value: 1350 },
];
