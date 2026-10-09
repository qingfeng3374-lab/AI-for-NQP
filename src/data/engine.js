// 第 03 章：技术引擎 —— 算力 · 能力 · 成本

// 代表性 AI 模型训练算力（FLOP），来源：Epoch AI "Notable AI Models" 数据库（2026-10 快照）
// region: us 美国 | cn 中国 | other 其他国家/地区（英国、加拿大、阿联酋、法国等）
export const MODELS = [
  { name: 'AlexNet', date: 2012.75, flop: 4.7e17, region: 'other', org: '多伦多大学（加拿大）', label: true },
  { name: 'VGG-16', date: 2014.68, flop: 1.23e19, region: 'other', org: '牛津大学（英国）' },
  { name: 'Seq2Seq LSTM', date: 2014.69, flop: 5.6e19, region: 'us', org: 'Google' },
  { name: 'ResNet-152', date: 2015.94, flop: 1.04e19, region: 'us', org: 'Microsoft' },
  { name: 'AlphaGo Lee', date: 2016.07, flop: 1.9e21, region: 'other', org: 'DeepMind（英国）', label: true },
  { name: 'Transformer', date: 2017.45, flop: 7.4e18, region: 'us', org: 'Google' },
  { name: 'AlphaGo Zero', date: 2017.8, flop: 6.5e20, region: 'other', org: 'DeepMind（英国）' },
  { name: 'BERT-Large', date: 2018.78, flop: 2.85e20, region: 'us', org: 'Google' },
  { name: 'GPT-2', date: 2019.12, flop: 1.92e21, region: 'us', org: 'OpenAI' },
  { name: 'T5-11B', date: 2019.81, flop: 3.3e22, region: 'us', org: 'Google' },
  { name: 'GPT-3', date: 2020.41, flop: 3.14e23, region: 'us', org: 'OpenAI', label: true },
  { name: 'Gopher', date: 2021.93, flop: 6.31e23, region: 'other', org: 'DeepMind（英国）' },
  { name: 'ERNIE 3.0 Titan', date: 2021.98, flop: 1.04e24, region: 'cn', org: '百度 / 鹏城实验室' },
  { name: 'Chinchilla', date: 2022.24, flop: 5.76e23, region: 'other', org: 'DeepMind（英国）' },
  { name: 'PaLM', date: 2022.26, flop: 2.53e24, region: 'us', org: 'Google' },
  { name: 'BLOOM-176B', date: 2022.53, flop: 3.66e23, region: 'other', org: 'BigScience（法国等）' },
  { name: 'GLM-130B', date: 2022.59, flop: 3.55e23, region: 'cn', org: '清华大学 / 智谱' },
  { name: 'GPT-4', date: 2023.2, flop: 2.1e25, region: 'us', org: 'OpenAI', label: true },
  { name: 'PanGu-Σ', date: 2023.21, flop: 4.67e23, region: 'cn', org: '华为诺亚方舟实验室' },
  { name: 'Falcon-180B', date: 2023.68, flop: 3.76e24, region: 'other', org: 'TII（阿联酋）' },
  { name: 'Gemini 1.0 Ultra', date: 2023.93, flop: 5.0e25, region: 'us', org: 'Google DeepMind' },
  { name: 'Llama 3.1-405B', date: 2024.56, flop: 3.8e25, region: 'us', org: 'Meta' },
  { name: 'Qwen2.5-72B', date: 2024.72, flop: 7.8e24, region: 'cn', org: '阿里巴巴' },
  { name: 'Doubao-pro', date: 2024.82, flop: 2.5e25, region: 'cn', org: '字节跳动' },
  { name: 'DeepSeek-V3', date: 2024.98, flop: 3.3e24, region: 'cn', org: '深度求索', label: true },
  { name: 'Grok 3', date: 2025.13, flop: 3.5e26, region: 'us', org: 'xAI' },
  { name: 'GPT-4.5', date: 2025.16, flop: 3.8e26, region: 'us', org: 'OpenAI' },
  { name: 'Qwen3-235B', date: 2025.33, flop: 4.75e24, region: 'cn', org: '阿里巴巴' },
  { name: 'Grok 4', date: 2025.52, flop: 5.0e26, region: 'us', org: 'xAI（估算）', label: true },
  { name: 'Kimi K2', date: 2025.53, flop: 2.98e24, region: 'cn', org: '月之暗面' },
  { name: 'GLM-4.5', date: 2025.57, flop: 4.42e24, region: 'cn', org: '智谱' },
  { name: 'Qwen3-Max', date: 2025.68, flop: 1.51e25, region: 'cn', org: '阿里巴巴（估算）' },
  { name: 'GLM-5', date: 2026.12, flop: 6.84e24, region: 'cn', org: '智谱' },
  { name: 'DeepSeek-V4-Pro', date: 2026.31, flop: 9.7e24, region: 'cn', org: '深度求索', label: true },
];

// slot：分类色板中的固定位置（颜色随主题从 pal.series 取）
export const REGIONS = [
  { id: 'us', name: '美国', slot: 0 },
  { id: 'cn', name: '中国', slot: 1 },
  { id: 'other', name: '其他国家/地区', slot: 2 },
];

// 基准测试：顶尖模型得分随时间变化 vs 人类基线
// 只保留刷新纪录的成绩点（前沿曲线）；date 为小数年份；human 为人类专家基线（无则为 null）
// 来源：各基准论文与模型发布报告；Stanford AI Index 2025
export const BENCHMARKS = [
  {
    id: 'mmlu',
    name: 'MMLU',
    desc: '57 个学科的综合知识',
    human: 89.8,
    humanLabel: '人类专家 89.8%',
    points: [
      [2020.4, 43.9, 'GPT-3'],
      [2021.95, 60.0, 'Gopher'],
      [2022.25, 67.6, 'Chinchilla'],
      [2022.8, 75.2, 'Flan-PaLM'],
      [2023.2, 86.4, 'GPT-4'],
      [2023.95, 90.0, 'Gemini Ultra'],
      [2024.7, 92.3, 'o1'],
    ],
  },
  {
    id: 'math',
    name: 'MATH',
    desc: '高中数学竞赛题',
    human: 90,
    humanLabel: 'IMO 金牌选手 ≈90%',
    points: [
      [2021.2, 5.2, 'GPT-3'],
      [2022.45, 50.3, 'Minerva'],
      [2023.6, 69.7, 'GPT-4 Code'],
      [2024.37, 76.6, 'GPT-4o'],
      [2024.7, 94.8, 'o1'],
      [2025.05, 97.3, 'DeepSeek-R1'],
    ],
  },
  {
    id: 'gpqa',
    name: 'GPQA Diamond',
    desc: '博士级科学难题',
    human: 69.7,
    humanLabel: '领域博士 ≈70%',
    points: [
      [2023.85, 39, 'GPT-4'],
      [2024.2, 50.4, 'Claude 3 Opus'],
      [2024.45, 59.4, 'Claude 3.5 Sonnet'],
      [2024.7, 78.0, 'o1'],
      [2025.22, 84.0, 'Gemini 2.5 Pro'],
      [2025.52, 87.5, 'Grok 4'],
      [2025.88, 91.9, 'Gemini 3 Pro'],
    ],
  },
  {
    id: 'swe',
    name: 'SWE-bench Verified',
    desc: '真实 GitHub 软件工程任务',
    human: null,
    humanLabel: '',
    points: [
      [2024.6, 33.2, 'GPT-4o'],
      [2024.8, 49.0, 'Claude 3.5 Sonnet'],
      [2024.97, 71.7, 'o3'],
      [2025.39, 72.5, 'Claude Opus 4'],
      [2025.6, 74.9, 'GPT-5'],
      [2025.74, 77.2, 'Claude Sonnet 4.5'],
      [2025.9, 80.9, 'Claude Opus 4.5'],
    ],
  },
];

// GPT-3.5 级别（MMLU ≥ 64.8）模型推理价格（美元 / 百万 token，按输入:输出 = 3:1 混合计）
// 来源：Stanford AI Index 2025；各厂商官方定价
export const INFERENCE_COST = [
  { date: 2022.88, price: 20, model: 'text-davinci-003' },
  { date: 2023.17, price: 2.0, model: 'gpt-3.5-turbo' },
  { date: 2023.45, price: 1.63, model: 'gpt-3.5-turbo-0613' },
  { date: 2024.07, price: 0.75, model: 'gpt-3.5-turbo-0125' },
  { date: 2024.55, price: 0.26, model: 'GPT-4o mini' },
  { date: 2024.8, price: 0.07, model: 'Gemini 1.5 Flash-8B' },
];

// 中国大模型价格战（2024 年 5 月）
export const CN_PRICE_WAR = [
  { name: 'DeepSeek-V2', note: '输入 1 元 / 百万 token', date: '2024.05' },
  { name: '豆包 Pro 32k', note: '输入 0.8 元 / 百万 token', date: '2024.05' },
  { name: '通义千问 Qwen-Long', note: '输入 0.5 元 / 百万 token，降价 97%', date: '2024.05' },
];
