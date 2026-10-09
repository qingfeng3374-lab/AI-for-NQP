// 效益测算：企业引入 AI 的投入产出（教学示意模型，默认值可自行调整）

// 行业预设：知识型工作占比 / 其中 AI 可覆盖的比例 / 人均年薪（万元，示意值）
export const INDUSTRIES = [
  { id: 'mfg', name: '制造业', knowledge: 35, applicable: 50, salary: 10 },
  { id: 'fin', name: '金融业', knowledge: 80, applicable: 65, salary: 20 },
  { id: 'it', name: '软件与信息技术', knowledge: 85, applicable: 70, salary: 22 },
  { id: 'retail', name: '批发零售', knowledge: 45, applicable: 55, salary: 9 },
  { id: 'health', name: '医疗卫生', knowledge: 55, applicable: 45, salary: 14 },
  { id: 'edu', name: '教育', knowledge: 70, applicable: 50, salary: 12 },
  { id: 'gov', name: '政务与公共服务', knowledge: 65, applicable: 55, salary: 12 },
];

// 效率提升情景：来自随机对照 / 现场实验
export const SCENARIOS = [
  { id: 'low', name: '保守', gain: 14, ref: '客服坐席实验 +14%（Brynjolfsson 等）' },
  { id: 'mid', name: '中性', gain: 26, ref: '企业开发者现场实验 +26%（Cui 等）' },
  { id: 'high', name: '乐观', gain: 40, ref: '咨询 / 写作实验 +40%（Dell\'Acqua 等；Noy & Zhang）' },
];

/**
 * 核心测算
 * 年度效率价值 = 员工数 × 覆盖率 × 年薪 × 知识型占比 × AI 适用比例 × 节省时间比例
 * 节省时间比例 = 1 − 1 / (1 + 效率提升)
 */
export function computeROI(p) {
  const users = p.employees * (p.adoption / 100);
  const saveRatio = 1 - 1 / (1 + p.gain / 100);
  const affected = (p.knowledge / 100) * (p.applicable / 100);
  const value = users * p.salary * affected * saveRatio; // 万元 / 年
  const toolCost = (users * p.seatCost * 12) / 10000; // 万元 / 年
  const oneOff = p.oneOff; // 万元
  const net1 = value - toolCost - oneOff;
  const roi1 = (value - toolCost - oneOff) / Math.max(1e-6, toolCost + oneOff);
  const monthlyNet = (value - toolCost) / 12;
  const payback = monthlyNet > 0 ? oneOff / monthlyNet : Infinity;
  const fte = value / p.salary; // 等效新增人力
  const hours = users * 2000 * affected * saveRatio; // 每人年工时约 2000 小时
  return { users, saveRatio, value, toolCost, oneOff, net1, roi1, payback, fte, hours };
}

/** 36 个月累计净收益：前 12 个月采用率按学习曲线从 30% 线性爬升到 100% */
export function cumulative(p, months = 36) {
  const r = computeROI(p);
  const pts = [{ m: 0, v: -r.oneOff }];
  let acc = -r.oneOff;
  for (let m = 1; m <= months; m++) {
    const ramp = Math.min(1, 0.3 + (0.7 * (m - 1)) / 11);
    acc += (r.value * ramp) / 12 - r.toolCost / 12;
    pts.push({ m, v: acc });
  }
  return pts;
}
