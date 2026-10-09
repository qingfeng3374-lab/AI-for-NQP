// 知识图谱：人工智能 × 新质生产力的关系网络（结构性知识，非统计数据）
// 分组 → 色板位置（slot）；节点均带直接标签，颜色不是唯一的识别方式

export const GROUPS = [
  { id: 'core', name: '核心概念', slot: 'accent' },
  { id: 'element', name: '生产力三要素', slot: 0 },
  { id: 'tech', name: 'AI 技术', slot: 2 },
  { id: 'infra', name: '新型基础设施', slot: 6 },
  { id: 'industry', name: '赋能产业', slot: 1 },
  { id: 'outcome', name: '作用与意义', slot: 3 },
  { id: 'policy', name: '政策制度', slot: 4 },
];

export const NODES = [
  // 核心
  { id: 'np', group: 'core', name: '新质生产力', size: 3, desc: '创新起主导作用、摆脱传统增长路径的先进生产力质态，具有高科技、高效能、高质量特征。' },
  { id: 'tfp', group: 'core', name: '全要素生产率', size: 2.2, desc: '新质生产力的核心标志：在资本与劳动投入不变的情况下，依靠技术与组织创新带来的产出增长。' },
  // 三要素
  { id: 'labor', group: 'element', name: '劳动者', size: 2, desc: 'AI 将劳动者从重复性劳动中解放，延伸认知与创造能力，人机协同成为新的劳动形态。', fact: '中国生成式 AI 用户 6.02 亿（2025.12）' },
  { id: 'means', group: 'element', name: '劳动资料', size: 2, desc: '算力、大模型、工业机器人与智能终端，构成具有"感知—决策—执行"能力的新型劳动资料。', fact: '中国算力总规模 280 EFLOPS（2024）' },
  { id: 'object', group: 'element', name: '劳动对象', size: 2, desc: '数据成为新型生产要素；AI for Science 拓展了新材料、新药物、新能源等劳动对象的边界。', fact: '2024 年全国数据生产总量 41.06 ZB' },
  // AI 技术
  { id: 'dl', group: 'tech', name: '深度学习', size: 1.5, desc: '以多层神经网络从数据中学习表示的方法，2012 年 AlexNet 之后成为 AI 主流范式。' },
  { id: 'llm', group: 'tech', name: '大模型', size: 1.9, desc: '在海量数据上预训练的通用基础模型，可理解与生成语言、代码、图像，是新一代"通用智能工具"。', fact: '累计备案生成式 AI 服务超 1100 款（2026.08）' },
  { id: 'agent', group: 'tech', name: '智能体', size: 1.5, desc: '能感知环境、规划并调用工具自主完成多步任务的 AI 系统，推动"人机协同"走向"人机共事"。' },
  { id: 'cv', group: 'tech', name: '计算机视觉', size: 1.3, desc: '让机器"看懂"图像视频，广泛用于质检、医学影像、自动驾驶感知等场景。' },
  { id: 'embodied', group: 'tech', name: '具身智能', size: 1.4, desc: '拥有物理身体、能与真实世界交互的智能体，如人形机器人、智能产线机器人。' },
  { id: 'ai4s', group: 'tech', name: 'AI for Science', size: 1.4, desc: '用 AI 加速科学发现，如蛋白质结构预测、材料筛选、气象大模型，被称为科研"第五范式"。' },
  // 新型基础设施
  { id: 'compute', group: 'infra', name: '智能算力', size: 1.7, desc: 'AI 训练与推理所需的计算能力，被视为智能时代的"电力"。' },
  { id: 'data', group: 'infra', name: '数据要素', size: 1.7, desc: '2019 年起数据被列为生产要素，"数据二十条"构建数据基础制度。' },
  { id: 'chip', group: 'infra', name: 'AI 芯片', size: 1.3, desc: 'GPU、NPU 等专用计算芯片，是算力的物理基础。' },
  { id: 'eastwest', group: 'infra', name: '东数西算', size: 1.3, desc: '8 大枢纽、10 大集群，将东部算力需求有序引导到西部可再生能源富集区。' },
  { id: 'iiot', group: 'infra', name: '工业互联网', size: 1.3, desc: '连接设备、产线、工厂与供应链的网络平台，是 AI 进入制造业的"神经系统"。' },
  { id: 'oss', group: 'infra', name: '开源生态', size: 1.2, desc: '开源模型与框架降低创新门槛，中国开源大模型在全球影响力快速上升。' },
  // 赋能产业
  { id: 'mfg', group: 'industry', name: '智能制造', size: 1.6, desc: '视觉质检、预测性维护、工艺优化与柔性生产，智能工厂产品不良率平均下降约 47%。', fact: '中国灯塔工厂 101 座，占全球 45%' },
  { id: 'fin', group: 'industry', name: '智慧金融', size: 1.2, desc: '智能风控、智能投研与智能客服；麦肯锡估计银行业每年可获 2000 亿—3400 亿美元价值。' },
  { id: 'med', group: 'industry', name: '智慧医疗', size: 1.2, desc: '医学影像辅助诊断、AI 制药、健康管理，提升优质医疗资源的可及性。' },
  { id: 'traffic', group: 'industry', name: '智能交通', size: 1.2, desc: '自动驾驶、车路协同与智慧物流调度。' },
  { id: 'energy', group: 'industry', name: '智慧能源', size: 1.2, desc: '电网调度、新能源功率预测与负荷管理；IEA 估计 AI 可释放最多 175 GW 输电能力。' },
  { id: 'agri', group: 'industry', name: '智慧农业', size: 1.1, desc: '精准种植、病虫害识别与农机自动驾驶，推动农业数智化转型。' },
  { id: 'edu', group: 'industry', name: '智慧教育', size: 1.1, desc: '个性化学习与智能辅导，加速人力资本积累。' },
  { id: 'gov', group: 'industry', name: '政务治理', size: 1.1, desc: '城市大脑、智慧政务与生态监测，提升治理效能。' },
  { id: 'device', group: 'industry', name: '智能终端', size: 1.2, desc: 'AI 手机、AI 电脑、智能网联汽车等新一代智能终端，是"人工智能+"消费提质的重点。' },
  { id: 'research', group: 'industry', name: '科学研究', size: 1.1, desc: '实验设计、文献挖掘与仿真计算全流程智能化。' },
  // 作用与意义
  { id: 'eff', group: 'outcome', name: '效率跃升', size: 1.5, desc: '随机对照实验显示，AI 使知识工作产出提升 14%—56%。' },
  { id: 'newind', group: 'outcome', name: '培育新兴产业', size: 1.4, desc: '催生智能终端、具身智能、智能体服务等新产业、新业态、新模式。' },
  { id: 'upgrade', group: 'outcome', name: '改造传统产业', size: 1.4, desc: 'AI 与制造、农业、服务业深度融合，推动传统产业高端化、智能化、绿色化。' },
  { id: 'green', group: 'outcome', name: '绿色低碳', size: 1.3, desc: '优化能源系统与生产工艺，同时需要应对数据中心用电增长的挑战。' },
  { id: 'jobs', group: 'outcome', name: '就业结构优化', size: 1.3, desc: 'WEF 预计 2025—2030 年全球新增 1.7 亿岗位、替代 0.92 亿岗位，净增 7800 万。' },
  { id: 'hc', group: 'outcome', name: '人力资本提升', size: 1.3, desc: 'AI 将高手经验传递给新手，低技能者提升最多（客服实验中 +34%）。' },
  { id: 'hqd', group: 'outcome', name: '高质量发展', size: 2, desc: '新质生产力的最终指向：以创新驱动实现更高质量、更有效率、更加公平、更可持续的发展。' },
  { id: 'inclusive', group: 'outcome', name: '普惠共享', size: 1.2, desc: '推理成本两年下降约 280 倍，让智能服务成为人人可用的公共品。' },
  // 政策
  { id: 'plan2017', group: 'policy', name: '新一代 AI 发展规划', size: 1.2, desc: '2017 年国务院印发，提出"三步走"战略目标。' },
  { id: 'aiplus', group: 'policy', name: '"人工智能+"行动', size: 1.6, desc: '2025 年 8 月国务院印发意见：2027 年智能终端、智能体应用普及率超 70%，2030 年超 90%。' },
  { id: 'data20', group: 'policy', name: '数据二十条', size: 1.1, desc: '2022 年 12 月《关于构建数据基础制度更好发挥数据要素作用的意见》。' },
  { id: 'genrule', group: 'policy', name: '生成式 AI 管理办法', size: 1.1, desc: '2023 年 8 月施行，确立备案制度，坚持发展与安全并重。' },
  { id: 'factory', group: 'policy', name: '智能工厂梯度培育', size: 1.1, desc: '基础级—先进级—卓越级—领航级四级体系，已培育 3.5 万余家基础级智能工厂。' },
];

// [source, target, 关系说明]
export const LINKS = [
  ['labor', 'tfp', '优化组合'], ['means', 'tfp', '优化组合'], ['object', 'tfp', '优化组合'],
  ['tfp', 'np', '核心标志'], ['np', 'hqd', '根本指向'],
  ['dl', 'llm', '技术基础'], ['dl', 'cv', '技术基础'], ['dl', 'ai4s', '技术基础'], ['llm', 'agent', '演进为'], ['dl', 'embodied', '技术基础'],
  ['llm', 'means', '成为通用智能工具'], ['embodied', 'means', '智能装备'], ['compute', 'means', '新型基础设施'], ['iiot', 'means', '连接生产资料'],
  ['data', 'object', '新型生产要素'], ['ai4s', 'object', '拓展劳动对象'],
  ['agent', 'labor', '人机协同'], ['llm', 'labor', '降低知识工作门槛'], ['hc', 'labor', '提升劳动者素质'],
  ['chip', 'compute', '物理基础'], ['eastwest', 'compute', '统筹布局'], ['data', 'llm', '训练语料'], ['compute', 'llm', '训练与推理'], ['oss', 'llm', '降低门槛'],
  ['cv', 'mfg', '视觉质检'], ['embodied', 'mfg', '柔性生产'], ['iiot', 'mfg', '工业互联'], ['agent', 'mfg', '生产调度'],
  ['llm', 'fin', '智能投研'], ['llm', 'edu', '智能辅导'], ['llm', 'gov', '智慧政务'], ['cv', 'med', '医学影像'], ['ai4s', 'med', 'AI 制药'],
  ['cv', 'traffic', '环境感知'], ['embodied', 'traffic', '自动驾驶'], ['dl', 'energy', '功率预测'], ['cv', 'agri', '病虫害识别'],
  ['agent', 'device', '智能助手'], ['llm', 'device', '端侧大模型'], ['ai4s', 'research', '科研范式'],
  ['mfg', 'upgrade', ''], ['agri', 'upgrade', ''], ['fin', 'eff', ''], ['mfg', 'eff', ''], ['gov', 'eff', ''],
  ['energy', 'green', ''], ['traffic', 'green', ''], ['med', 'inclusive', ''], ['edu', 'inclusive', ''], ['edu', 'hc', ''],
  ['research', 'newind', ''], ['device', 'newind', ''], ['agent', 'newind', ''], ['agent', 'jobs', '岗位重组'],
  ['eff', 'tfp', '提升'], ['upgrade', 'hqd', ''], ['newind', 'hqd', ''], ['green', 'hqd', ''], ['jobs', 'hqd', ''], ['inclusive', 'hqd', ''],
  ['plan2017', 'dl', '战略部署'], ['plan2017', 'np', '前瞻布局'],
  ['aiplus', 'mfg', '产业发展'], ['aiplus', 'research', '科学技术'], ['aiplus', 'device', '消费提质'], ['aiplus', 'med', '民生福祉'], ['aiplus', 'gov', '治理能力'], ['aiplus', 'np', '行动路径'],
  ['data20', 'data', '制度基础'], ['genrule', 'llm', '规范发展'], ['factory', 'mfg', '梯度培育'], ['eastwest', 'green', '绿电算力'],
];
