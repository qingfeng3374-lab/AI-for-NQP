// 第 09 章：绿色与治理

// 全球数据中心用电量（太瓦时），IEA《能源与人工智能》（2025）
// 2024 年区域占比：美国 45%、中国 25%、欧洲 15%、其他 15%
export const DC_ELECTRICITY = {
  y2024: [
    { key: 'us', name: '美国', value: 187 },
    { key: 'cn', name: '中国', value: 104 },
    { key: 'eu', name: '欧洲', value: 62 },
    { key: 'ot', name: '其他地区', value: 62 },
  ],
  total2024: 415,
  total2030: 945,
  total2035: 1200,
  share2024: 1.5,
};

// IEA：AI 赋能节能减排的潜力
export const AI_FOR_GREEN = [
  { icon: '⚡', value: '175 GW', label: '电网', text: 'AI 工具可在不新建线路的情况下释放最多 175 GW 输电能力' },
  { icon: '🏭', value: '≈ 墨西哥全国能耗', label: '工业', text: '推广现有 AI 工艺优化，节约的能源相当于墨西哥当前全国能源消费量' },
  { icon: '🏢', value: '300 TWh', label: '建筑', text: '规模化 AI 楼宇能效管理可节约约 300 太瓦时电力' },
  { icon: '🚚', value: '1.2 亿辆车', label: '交通', text: 'AI 优化交通运输可节约的能源相当于 1.2 亿辆汽车的用能' },
];

// 治理：发展与安全并重（中国主要制度安排）
export const GOVERNANCE = [
  { date: '2023.08', title: '《生成式人工智能服务管理暂行办法》施行', kind: '规则' },
  { date: '2023.10', title: '提出《全球人工智能治理倡议》', kind: '合作' },
  { date: '2024.09', title: '发布《人工智能安全治理框架》1.0 版', kind: '安全' },
  { date: '2025.09', title: '《人工智能生成合成内容标识办法》施行', kind: '规则' },
  { date: '2025.09', title: '发布《人工智能安全治理框架》2.0 版', kind: '安全' },
];
