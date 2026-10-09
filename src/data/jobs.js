// 岗位诊断：任务构成 × AI 作用系数（教学示意模型）
// 思路参考：IMF（Pizzinelli et al., 2023）"暴露度—互补性"框架；
//          Eloundou et al.（2023）"GPTs are GPTs" 任务级暴露度评估。
// auto：该类任务中可由现有 AI 较大程度自动完成的时间比例
// aug ：该类任务中 AI 可作为助手显著增强（人仍主导）的时间比例
// 其余为人类主导部分。系数为基于文献的示意性设定，并非对具体职业的精确测量。

export const TASKS = [
  { id: 'info', name: '信息检索与整理', auto: 0.7, aug: 0.2, hint: '查资料、整理表格、录入、归档、写纪要' },
  { id: 'content', name: '文字/代码/内容生成', auto: 0.4, aug: 0.45, hint: '写报告、写代码、做设计稿、翻译、文案' },
  { id: 'analysis', name: '数据分析与决策支持', auto: 0.25, aug: 0.55, hint: '数据分析、方案比选、风险评估、诊断' },
  { id: 'social', name: '人际沟通与服务', auto: 0.1, aug: 0.3, hint: '客户沟通、谈判、教学、护理、团队协调' },
  { id: 'physical', name: '现场操作与体力劳动', auto: 0.12, aug: 0.15, hint: '设备操作、装配、驾驶、搬运、田间作业' },
  { id: 'creative', name: '创新与复杂问题', auto: 0.08, aug: 0.5, hint: '提出新方案、科研探索、战略规划、艺术创作' },
];

// 证据参数：自动化任务可节省约 80% 用时（Anthropic Economic Index, 2025）；
// 增强型任务效率提升取实验中位数约 26%（Cui et al., 2024）→ 节省 1 - 1/1.26 ≈ 20.6%
export const EVIDENCE = { autoSave: 0.8, augGain: 0.26 };

// 预设职业的任务时间构成（%，示意性估计）
export const OCCUPATIONS = [
  { id: 'dev', name: '软件工程师', mix: { info: 15, content: 45, analysis: 20, social: 10, physical: 0, creative: 10 } },
  { id: 'cs', name: '客服专员', mix: { info: 35, content: 15, analysis: 5, social: 45, physical: 0, creative: 0 } },
  { id: 'acct', name: '会计', mix: { info: 40, content: 15, analysis: 30, social: 10, physical: 0, creative: 5 } },
  { id: 'clerk', name: '行政文员', mix: { info: 50, content: 25, analysis: 5, social: 20, physical: 0, creative: 0 } },
  { id: 'teacher', name: '中小学教师', mix: { info: 10, content: 20, analysis: 10, social: 45, physical: 5, creative: 10 } },
  { id: 'doctor', name: '临床医生', mix: { info: 15, content: 10, analysis: 30, social: 30, physical: 10, creative: 5 } },
  { id: 'nurse', name: '护士', mix: { info: 15, content: 5, analysis: 10, social: 40, physical: 30, creative: 0 } },
  { id: 'lawyer', name: '律师', mix: { info: 30, content: 30, analysis: 20, social: 15, physical: 0, creative: 5 } },
  { id: 'designer', name: '平面设计师', mix: { info: 10, content: 50, analysis: 5, social: 10, physical: 0, creative: 25 } },
  { id: 'analyst', name: '数据分析师', mix: { info: 25, content: 20, analysis: 40, social: 10, physical: 0, creative: 5 } },
  { id: 'sales', name: '销售代表', mix: { info: 20, content: 10, analysis: 10, social: 55, physical: 5, creative: 0 } },
  { id: 'editor', name: '新闻编辑', mix: { info: 30, content: 45, analysis: 10, social: 10, physical: 0, creative: 5 } },
  { id: 'scientist', name: '科研人员', mix: { info: 20, content: 20, analysis: 25, social: 5, physical: 5, creative: 25 } },
  { id: 'operator', name: '制造业操作工', mix: { info: 5, content: 0, analysis: 10, social: 10, physical: 75, creative: 0 } },
  { id: 'courier', name: '快递 / 外卖骑手', mix: { info: 5, content: 0, analysis: 5, social: 15, physical: 75, creative: 0 } },
  { id: 'farmer', name: '农业生产者', mix: { info: 5, content: 0, analysis: 15, social: 5, physical: 70, creative: 5 } },
];

// 象限划分阈值（自动化潜力 x / 增强潜力 y）
export const THRESH = { auto: 0.3, aug: 0.33 };

export const QUADRANTS = [
  { id: 'reshape', name: '深度重塑型', x: 'high', y: 'high', text: 'AI 既能自动完成大量任务，又能显著放大人的能力。岗位内容将被深度重写——善用 AI 的人将大幅领先。' },
  { id: 'risk', name: '替代风险型', x: 'high', y: 'low', text: '较多任务可被 AI 自动完成，而增强空间有限。建议尽早向更高阶、更需判断与沟通的任务转型。' },
  { id: 'amplify', name: '能力放大型', x: 'low', y: 'high', text: 'AI 主要作为"副驾驶"增强你的分析与创造能力，岗位本身不易被替代，生产率提升潜力大。' },
  { id: 'human', name: '人类主导型', x: 'low', y: 'low', text: '以现场操作、情感沟通为主，受生成式 AI 直接影响较小；但具身智能与机器人可能在中长期带来变化。' },
];

// 技能建议规则
export const ADVICE = {
  info: '把信息整理交给 AI，重点培养「问题拆解 + 结果核验」能力，防止 AI 幻觉带来的错误。',
  content: '学习提示工程与 AI 工作流编排，把精力从"从零写"转向"定方向、做审校、出判断"。',
  analysis: '提升数据素养与业务理解：AI 给出分析，你负责提出好问题、解释结果并承担决策。',
  social: '共情、信任与复杂沟通是 AI 最难替代的能力，可借助 AI 准备材料，把时间留给人。',
  physical: '关注具身智能与智能装备的发展，学习人机协作操作、设备维护与安全规范。',
  creative: '把 AI 当作灵感放大器：快速生成多个方案原型，再用你的专业判断做取舍与深化。',
};
