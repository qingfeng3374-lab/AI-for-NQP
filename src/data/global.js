// 全球视野：普华永道《Sizing the prize》（2017）—— 到 2030 年 AI 带来的 GDP 增幅
// 中国、北美数值经新闻稿核实；其余区域取自报告区域图
export const PWC_REGIONS = [
  { id: 'cn', name: '中国', gain: 26.1, usd: 7.0 },
  { id: 'na', name: '北美', gain: 14.5, usd: 3.7 },
  { id: 'se', name: '南欧', gain: 11.5, usd: 0.7 },
  { id: 'da', name: '亚洲发达经济体', gain: 10.4, usd: 0.9 },
  { id: 'ne', name: '北欧及西欧', gain: 9.9, usd: 1.8 },
  { id: 'ot', name: '非洲、大洋洲及其他亚洲', gain: 5.6, usd: 1.2 },
  { id: 'la', name: '拉丁美洲', gain: 5.4, usd: 0.5 },
];

// ISO 3166-1 数字代码 → 区域
const SETS = {
  cn: [156, 158],
  na: [840, 124],
  ne: [826, 372, 276, 250, 528, 56, 442, 208, 752, 578, 246, 352, 40, 756, 616, 203, 703, 348, 233, 428, 440],
  se: [380, 724, 620, 300, 470, 196, 705, 191],
  da: [392, 410, 702],
  la: [
    484, 32, 68, 76, 152, 170, 188, 192, 214, 218, 222, 320, 332, 340, 388, 558, 591, 600, 604, 630, 780, 858, 862, 328, 740, 84,
    44, 238,
  ],
};
const LOOKUP = new Map();
for (const [region, ids] of Object.entries(SETS)) for (const id of ids) LOOKUP.set(id, region);

export function regionOfCountry(id) {
  return LOOKUP.get(id) ?? 'ot';
}

// Stanford AI Index：私营 AI 投资（十亿美元）
export const AI_INVESTMENT_2024 = [
  { name: '美国', value: 109.1 },
  { name: '中国', value: 9.3 },
  { name: '英国', value: 4.5 },
  { name: '瑞典', value: 4.3 },
  { name: '加拿大', value: 2.9 },
  { name: '法国', value: 2.6 },
  { name: '德国', value: 2.0 },
  { name: '阿联酋', value: 1.8 },
];

// 采用 AI 的组织比例（%），麦肯锡 State of AI 调查（各年度口径略有变化）
export const ORG_ADOPTION = [
  { label: '2017', value: 20 },
  { label: '2018', value: 47 },
  { label: '2019', value: 58 },
  { label: '2020', value: 50 },
  { label: '2021', value: 56 },
  { label: '2022', value: 50 },
  { label: '2023', value: 55 },
  { label: '2024', value: 78 },
  { label: '2025', value: 88 },
];
