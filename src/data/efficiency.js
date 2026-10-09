// 第 06 章：效率革命 —— 来自随机对照实验 / 准实验的证据

export const EXPERIMENTS = [
  {
    id: 'support',
    study: 'Brynjolfsson, Li & Raymond（2023/2025）',
    venue: 'NBER / QJE',
    who: '客服坐席',
    n: '5,179 名坐席',
    metrics: [{ name: '每小时解决问题数', value: 14 }],
    detail: '生成式 AI 助手使客服人员每小时解决问题数平均提升 14%，新手与低技能员工提升 34%。',
  },
  {
    id: 'copilot',
    study: 'Peng et al.（2023）',
    venue: 'GitHub Copilot 实验',
    who: '软件开发者',
    n: '95 名开发者',
    metrics: [{ name: '任务完成速度', value: 55.8 }],
    detail: '使用 AI 编程助手的开发者完成同一 HTTP 服务器编写任务的速度快 55.8%。',
  },
  {
    id: 'bcg',
    study: "Dell'Acqua et al.（2023）",
    venue: '哈佛商学院 × BCG',
    who: '咨询顾问',
    n: '758 名顾问',
    metrics: [
      { name: '完成任务数', value: 12.2 },
      { name: '完成速度', value: 25.1 },
      { name: '产出质量', value: 40 },
    ],
    detail: '在 AI 能力"边界内"的任务上，顾问多完成 12.2% 的任务、速度快 25.1%、质量高 40% 以上。',
  },
  {
    id: 'writing',
    study: 'Noy & Zhang（2023）',
    venue: 'Science',
    who: '专业写作者',
    n: '453 名白领',
    metrics: [
      { name: '用时缩短', value: 40 },
      { name: '质量提升', value: 18 },
    ],
    detail: '使用 ChatGPT 完成专业写作任务，平均用时减少 40%，产出质量提升 18%。',
  },
  {
    id: 'dev-field',
    study: 'Cui et al.（2024）',
    venue: '微软 / 埃森哲等现场实验',
    who: '企业开发者',
    n: '4,867 名开发者',
    metrics: [{ name: '每周完成任务数', value: 26.1 }],
    detail: '三项大规模现场实验合并估计：使用 AI 编程助手使开发者每周完成的任务数提升 26.08%。',
  },
];

// 技能差距压缩：不同技能水平劳动者获得的提升
export const SKILL_GAP = [
  { study: '客服坐席（Brynjolfsson 等）', low: 34, high: 0, lowLabel: '新手 / 低技能', highLabel: '资深 / 高技能' },
  { study: '咨询顾问（Dell\'Acqua 等）', low: 43, high: 17, lowLabel: '基线低于平均', highLabel: '基线高于平均' },
];

// 生产函数模拟器的参数假设
// Y = A · K^α · L^(1-α)，A 为全要素生产率（TFP）
// 基准：TFP 年增 0.5%，资本年增 4%，劳动年增 -0.3%（人口老龄化）
// AI 情景：TFP 额外增速 = 渗透率 × 潜在增益（麦肯锡估计生成式 AI 每年可贡献 0.1–0.6 个百分点劳动生产率增长，
// 叠加其他自动化技术合计 0.5–3.4 个百分点）
export const SIM_DEFAULTS = {
  alpha: 0.4,
  baseTFP: 0.005,
  capitalGrowth: 0.04,
  laborGrowth: -0.003,
  years: [2025, 2035],
};
