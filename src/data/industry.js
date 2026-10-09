// 第 05 章：千行百业 —— AI 产业链与行业价值

// 人工智能产业链图谱（结构性知识，非数值数据）
export const CHAIN = {
  name: '人工智能产业链',
  children: [
    {
      name: '基础层',
      desc: '算力 · 数据 · 底座',
      children: [
        { name: 'AI 芯片', children: [{ name: 'GPU' }, { name: 'NPU / ASIC' }, { name: 'FPGA' }] },
        { name: '智能算力', children: [{ name: '智算中心' }, { name: '云计算' }, { name: '东数西算' }] },
        { name: '数据要素', children: [{ name: '数据采集' }, { name: '数据标注' }, { name: '数据交易' }] },
        { name: '开发框架', children: [{ name: 'PyTorch' }, { name: '昇思 MindSpore' }, { name: '飞桨 Paddle' }] },
        { name: '智能传感器' },
      ],
    },
    {
      name: '技术层',
      desc: '模型 · 算法 · 能力',
      children: [
        { name: '通用大模型', children: [{ name: '语言大模型' }, { name: '多模态大模型' }, { name: '推理模型' }] },
        { name: '计算机视觉' },
        { name: '智能语音' },
        { name: '自然语言处理' },
        { name: '知识图谱' },
        { name: '具身智能', children: [{ name: '人形机器人' }, { name: '机器人大模型' }] },
        { name: '智能体 Agent' },
      ],
    },
    {
      name: '应用层',
      desc: 'AI+ 千行百业',
      children: [
        { name: '智能制造', children: [{ name: '视觉质检' }, { name: '预测性维护' }, { name: '工艺优化' }] },
        { name: '智慧金融', children: [{ name: '智能风控' }, { name: '智能投研' }] },
        { name: '智慧医疗', children: [{ name: '医学影像' }, { name: 'AI 制药' }] },
        { name: '智能交通', children: [{ name: '自动驾驶' }, { name: '车路协同' }] },
        { name: '智慧能源', children: [{ name: '电网调度' }, { name: '新能源预测' }] },
        { name: '智慧农业' },
        { name: '智慧教育' },
        { name: '智慧政务' },
        { name: '科学智能', children: [{ name: '蛋白质结构' }, { name: '材料发现' }, { name: '气象预报' }] },
      ],
    },
  ],
};

// 麦肯锡（2023）：生成式 AI 每年可为各行业创造的经济价值（十亿美元，区间）
export const MCKINSEY_INDUSTRY = [
  { name: '零售与消费品', low: 400, high: 660 },
  { name: '高科技', low: 240, high: 460 },
  { name: '银行', low: 200, high: 340 },
  { name: '旅游、交通与物流', low: 180, high: 300 },
  { name: '先进制造', low: 170, high: 290 },
  { name: '医疗健康', low: 150, high: 260 },
  { name: '能源', low: 150, high: 240 },
  { name: '教育', low: 120, high: 230 },
  { name: '制药与医疗产品', low: 60, high: 110 },
  { name: '电信', low: 60, high: 100 },
];

// 麦肯锡：约 75% 的价值集中在四类职能；生成式 AI 对职能支出的生产率影响（%，区间）
export const MCKINSEY_FUNCTION = [
  { name: '客户运营', low: 30, high: 45 },
  { name: '软件工程', low: 20, high: 45 },
  { name: '产品研发', low: 10, high: 15 },
  { name: '营销', low: 5, high: 15 },
];

// 世界经济论坛"灯塔工厂"（2026 年 1 月）
export const LIGHTHOUSE = { total: 224, china: 101, date: '2026 年 1 月' };

// 工信部智能工厂梯度培育体系（2026 年）
export const SMART_FACTORY = [
  { tier: '领航级', count: 15, text: '15 家' },
  { tier: '卓越级', count: 500, text: '500 余家' },
  { tier: '先进级', count: 8200, text: '8200 余家' },
  { tier: '基础级', count: 35000, text: '3.5 万余家' },
];
export const SMART_FACTORY_EFFECT = { defect: 47, rnd: 38 };
