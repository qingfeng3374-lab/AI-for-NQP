<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import ChinaMap from '../lib/charts/ChinaMap.svelte';
  import GlobeGains from '../lib/charts/GlobeGains.svelte';
  import HBarRank from '../lib/charts/HBarRank.svelte';
  import { HUBS, CLUSTERS, PILOT_ZONES, PROVINCE_SNAPSHOTS } from '../data/geo.js';
  import { PWC_REGIONS, AI_INVESTMENT_2024 } from '../data/global.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { tr } from '../lib/i18n/lang.svelte.js';

  const latest = PROVINCE_SNAPSHOTS[PROVINCE_SNAPSHOTS.length - 1];
</script>

<Section
  id="geo"
  num="08"
  kicker="Geography"
  title={tr('空间格局：东数西算与全球版图')}
  lead={tr('新质生产力也意味着<b>生产要素的创新性配置</b>。「东数西算」让东部的数据在西部可再生能源富集区完成计算，算力像电力一样跨区调度；而在全球尺度上，AI 带来的经济增量将高度集中于中国和北美。')}
>
  <div class="grid-2">
    <ChartCard
      span={2}
      title={tr('中国 AI 与算力的空间布局')}
      subtitle={tr('切换图层：「东数西算」8 大枢纽与 10 大集群 · 生成式 AI 备案的省际分布（可播放时间演变）· 18 个国家新一代人工智能创新发展试验区')}
      source={tr('国家发展改革委等「东数西算」工程；国家网信办备案公告（按备案号属地统计）；科技部；地图底图：阿里云 DataV.GeoAtlas')}
      table={{
        columns: [tr('类型'), tr('名称 / 省份'), tr('数值')],
        rows: [
          ...HUBS.map((h) => [tr('算力枢纽'), tr(h.name), tr(h.side === 'east' ? '东部（需求侧）' : '西部（供给侧）')]),
          ...CLUSTERS.map((c) => [tr('数据中心集群'), tr(c.name), '']),
          ...Object.entries(latest.values).map(([k, v]) => [tr('备案数（{d}）', { d: latest.date }), tr(k), v]),
          ...PILOT_ZONES.map((z) => [tr('AI 创新发展试验区'), tr(z.name), '']),
        ],
      }}
    >
      <ChinaMap />
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('全球视野：到 2030 年 AI 为各地区 GDP 带来的增幅')}
      subtitle={tr('拖拽地球旋转，悬停右侧列表高亮对应区域。全球合计约 15.7 万亿美元（+14%），中国增幅最大')}
      source={tr('PwC, Sizing the prize（2017）——中国、北美数值经核实，其余区域取自报告区域图')}
      table={{ columns: [tr('区域'), tr('GDP 增幅'), tr('增量（万亿美元）')], rows: PWC_REGIONS.map((r) => [tr(r.name), `${r.gain}%`, r.usd]) }}
    >
      <GlobeGains />
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('资本流向：2024 年私营 AI 投资')}
      subtitle={tr('十亿美元。2025 年美国增至 2859 亿美元、中国 124 亿美元（AI Index 2026）；中国的优势更多体现在应用规模与制造场景')}
      source={tr('Stanford HAI, AI Index 2025 / 2026（第 4 名以后来自二级汇总）')}
      table={{ columns: [tr('国家'), tr('私营 AI 投资（十亿美元）')], rows: AI_INVESTMENT_2024.map((d) => [tr(d.name), d.value]) }}
    >
      <HBarRank data={AI_INVESTMENT_2024.map((d) => ({ ...d, name: tr(d.name) }))} highlight={[tr('中国')]} color={pal.series[1]} unit={tr('十亿美元')} fmt={(v) => v.toFixed(1)} ariaLabel={tr('各国私营 AI 投资')} />
    </ChartCard>
  </div>
</Section>
