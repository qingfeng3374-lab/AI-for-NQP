// 数据工作台：全站数据集目录（统一为 { label, value } 行结构，便于图表 / 表格 / 导出）
import { WORLD_GDP_PC } from './history.js';
import { INFERENCE_COST, MODELS } from './engine.js';
import { CORE_INDUSTRY, COMPUTE_POWER, DIGITAL_ECONOMY, GENAI_FILINGS, ROBOTS, ROBOT_DENSITY, GENAI_PATENTS } from './china.js';
import { MCKINSEY_INDUSTRY, LIGHTHOUSE } from './industry.js';
import { EXPERIMENTS } from './efficiency.js';
import { JOBS_GROWTH, IMF_EXPOSURE } from './labor.js';
import { PWC_REGIONS, AI_INVESTMENT_2024, ORG_ADOPTION } from './global.js';
import { PROVINCE_SNAPSHOTS } from './geo.js';
import { DC_ELECTRICITY } from './green.js';

const latestProv = PROVINCE_SNAPSHOTS[PROVINCE_SNAPSHOTS.length - 1];

// kind: time（时间序列 → 折线）| cat（类别 → 条形）| div（含负值 → 发散条形）| table（仅表格）
export const DATASETS = [
  // ---------- 中国 ----------
  { id: 'core', group: '中国', kind: 'time', title: '人工智能核心产业规模', unit: '亿元', source: '中国信通院；CNNIC；工信部', note: '2025 年为工信部预计值，口径或有差异',
    rows: CORE_INDUSTRY.map((d) => ({ label: d.label, value: d.value })) },
  { id: 'digital', group: '中国', kind: 'time', title: '数字经济规模', unit: '万亿元', source: '中国信通院',
    rows: DIGITAL_ECONOMY.map((d) => ({ label: d.label, value: d.value })) },
  { id: 'digital-share', group: '中国', kind: 'time', title: '数字经济占 GDP 比重', unit: '%', source: '中国信通院',
    rows: DIGITAL_ECONOMY.map((d) => ({ label: d.label, value: d.share })) },
  { id: 'compute', group: '中国', kind: 'time', title: '算力总规模（FP32）', unit: 'EFLOPS', source: '工信部；国家数据局',
    rows: COMPUTE_POWER.map((d) => ({ label: d.label, value: d.general + d.intelligent })) },
  { id: 'compute-ai', group: '中国', kind: 'time', title: '智能算力规模（FP32）', unit: 'EFLOPS', source: '工信部；国家数据局', note: '2022 年为行业估计值',
    rows: COMPUTE_POWER.map((d) => ({ label: d.label, value: d.intelligent })) },
  { id: 'filings', group: '中国', kind: 'time', title: '生成式 AI 服务累计备案数', unit: '款', source: '国家网信办',
    rows: GENAI_FILINGS.map((d) => ({ label: `20${d.label}`, value: d.value })) },
  { id: 'robots-cn', group: '中国', kind: 'time', title: '中国工业机器人新装机量', unit: '台', source: 'IFR World Robotics',
    rows: ROBOTS.map((d) => ({ label: d.label, value: d.china })) },
  { id: 'prov', group: '中国', kind: 'cat', title: `各省生成式 AI 备案数（${latestProv.date}）`, unit: '款', source: '国家网信办公告（按备案号属地统计）',
    rows: Object.entries(latestProv.values).map(([k, v]) => ({ label: k, value: v })) },
  { id: 'patents', group: '中国', kind: 'cat', title: '生成式 AI 专利族数量（2014—2023）', unit: '件', source: 'WIPO（2024）',
    rows: GENAI_PATENTS.map((d) => ({ label: d.name, value: d.value })) },
  // ---------- 全球 ----------
  { id: 'robots-world', group: '全球', kind: 'time', title: '全球工业机器人新装机量', unit: '台', source: 'IFR World Robotics',
    rows: ROBOTS.map((d) => ({ label: d.label, value: d.china + d.rest })) },
  { id: 'density', group: '全球', kind: 'cat', title: '制造业机器人密度（2023）', unit: '台/万人', source: 'IFR World Robotics 2024',
    rows: ROBOT_DENSITY.map((d) => ({ label: d.name, value: d.value })) },
  { id: 'adoption', group: '全球', kind: 'time', title: '企业 AI 采用率', unit: '%', source: 'McKinsey State of AI；Stanford AI Index',
    rows: ORG_ADOPTION.map((d) => ({ label: d.label, value: d.value })) },
  { id: 'invest', group: '全球', kind: 'cat', title: '2024 年私营 AI 投资', unit: '十亿美元', source: 'Stanford AI Index 2025',
    rows: AI_INVESTMENT_2024.map((d) => ({ label: d.name, value: d.value })) },
  { id: 'pwc', group: '全球', kind: 'cat', title: '2030 年 AI 带来的 GDP 增幅', unit: '%', source: 'PwC Sizing the prize（2017）',
    rows: PWC_REGIONS.map((d) => ({ label: d.name, value: d.gain })) },
  { id: 'lighthouse', group: '全球', kind: 'cat', title: '全球灯塔工厂分布（2026.01）', unit: '座', source: 'WEF Global Lighthouse Network',
    rows: [{ label: '中国', value: LIGHTHOUSE.china }, { label: '其他国家和地区', value: LIGHTHOUSE.total - LIGHTHOUSE.china }] },
  { id: 'dc', group: '全球', kind: 'cat', title: '全球数据中心用电量', unit: 'TWh', source: 'IEA Energy and AI（2025）', note: '2030、2035 年为基准情景预测',
    rows: [{ label: '2024', value: DC_ELECTRICITY.total2024 }, { label: '2030（预测）', value: DC_ELECTRICITY.total2030 }, { label: '2035（预测）', value: DC_ELECTRICITY.total2035 }] },
  { id: 'gdp', group: '全球', kind: 'time', title: '世界人均 GDP（长期）', unit: '2011 年国际元', source: 'Maddison Project 2023', note: '1820 年前为早期估算换算值',
    rows: WORLD_GDP_PC.map(([y, v]) => ({ label: String(y), value: v })) },
  // ---------- 技术 ----------
  { id: 'models', group: '技术', kind: 'table', title: '代表性模型训练算力', unit: 'FLOP', source: 'Epoch AI',
    rows: MODELS.map((d) => ({ label: d.name, value: d.flop, extra: `${Math.floor(d.date)} · ${d.org}` })) },
  { id: 'cost', group: '技术', kind: 'table', title: 'GPT-3.5 级能力推理价格', unit: '美元/百万 token', source: 'Stanford AI Index 2025；厂商定价',
    rows: INFERENCE_COST.map((d) => ({ label: d.model, value: d.price, extra: d.date.toFixed(2) })) },
  // ---------- 就业与效率 ----------
  { id: 'experiments', group: '就业与效率', kind: 'cat', title: 'AI 生产率实验效果', unit: '%', source: 'NBER；Science；HBS 等',
    rows: EXPERIMENTS.flatMap((e) => e.metrics.map((m) => ({ label: `${e.who} · ${m.name}`, value: m.value }))) },
  { id: 'jobs', group: '就业与效率', kind: 'div', title: '岗位净增长率（2025—2030）', unit: '%', source: 'WEF Future of Jobs 2025',
    rows: JOBS_GROWTH.map((d) => ({ label: d.name, value: d.value })) },
  { id: 'imf', group: '就业与效率', kind: 'cat', title: '受 AI 影响的就业占比', unit: '%', source: 'IMF SDN/2024/001',
    rows: IMF_EXPOSURE.map((d) => ({ label: d.name, value: d.value })) },
  { id: 'mck', group: '就业与效率', kind: 'cat', title: '生成式 AI 行业价值（区间中值）', unit: '十亿美元/年', source: 'McKinsey（2023）',
    rows: MCKINSEY_INDUSTRY.map((d) => ({ label: d.name, value: (d.low + d.high) / 2, extra: `${d.low}–${d.high}` })) },
];

// 指数对比：可对齐基期的中国时间序列
export const INDEXABLE = ['core', 'digital', 'compute', 'robots-cn', 'adoption', 'robots-world'];
