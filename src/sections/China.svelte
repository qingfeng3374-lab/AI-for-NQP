<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import StatTile from '../lib/components/StatTile.svelte';
  import BarTimeline from '../lib/charts/BarTimeline.svelte';
  import StackedBars from '../lib/charts/StackedBars.svelte';
  import HBarRank from '../lib/charts/HBarRank.svelte';
  import {
    CORE_INDUSTRY,
    PLAN_TARGETS,
    COMPUTE_POWER,
    DIGITAL_ECONOMY,
    GENAI_FILINGS,
    ROBOTS,
    ROBOT_DENSITY,
    GENAI_PATENTS,
  } from '../data/china.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { tr, isEn, loc } from '../lib/i18n/lang.svelte.js';

  const fmtInt = (v) => Math.round(v).toLocaleString(loc());
  const fmt1 = (v) => (+v).toFixed(1);
  // 英文模式：核心产业规模由"亿元"换算为"十亿元"（RMB billion）
  const coreScale = $derived(isEn() ? 0.1 : 1);
  const coreData = $derived(CORE_INDUSTRY.map((d) => ({ ...d, value: d.value * coreScale, note: d.note && tr(d.note) })));
  const coreTargets = $derived(
    PLAN_TARGETS.map((t) => ({ ...t, value: t.value * coreScale, text: tr('规划目标 {v}', { v: t.value * coreScale }) })),
  );
  const filings = $derived(GENAI_FILINGS.map((d) => ({ ...d, note: d.note && tr(d.note) })));
  const density = $derived(ROBOT_DENSITY.map((d) => ({ ...d, name: tr(d.name) })));
  const patents = $derived(GENAI_PATENTS.map((d) => ({ ...d, name: tr(d.name) })));
</script>

<Section
  id="china"
  num="04"
  kicker="China"
  title={tr('中国动能：规模与底座')}
  lead={tr('新质生产力需要<b>新型基础设施</b>和<b>规模化市场</b>作为土壤。中国以全球最完整的工业体系、最大规模的数据资源和应用场景，推动 AI 核心产业规模在五年间扩大到约 4 倍——按官方预计，2025 年即已越过 2017 年规划为 2030 年设定的 1 万亿元目标。')}
>
  <div class="grid-4 tiles">
    <StatTile value={1.2} decimals={1} unit={tr('万亿元')} label={tr('AI 核心产业规模（2025）')} note={tr('工信部预计值；2017 年规划的 2030 年目标为 1 万亿元')} icon="◎" />
    <StatTile value={6000} suffix="+" unit={isEn() ? 'companies' : '家'} label={tr('人工智能企业数量')} note={tr('2025 年底，约占全球 15%')} accent="var(--series-3)" icon="▣" />
    <StatTile value={isEn() ? 602 : 6.02} decimals={isEn() ? 0 : 2} unit={isEn() ? 'million' : '亿人'} label={tr('生成式 AI 用户规模')} note={tr('2025.12，普及率 42.8%（CNNIC）')} accent="var(--series-4)" icon="◉" />
    <StatTile value={59} suffix="%" label={tr('全球新装工业机器人占比')} note={tr('2025 年中国新装 35.4 万台（IFR）')} accent="var(--series-2)" icon="⚙" />
  </div>

  <div class="grid-2">
    <ChartCard
      title={tr('AI 核心产业规模：远超规划目标')}
      subtitle={tr('单位：亿元。橙色虚线为《新一代人工智能发展规划》（2017）设定的目标；2025 年为官方预计值（浅色）')}
      source={tr('中国信通院；CNNIC 第 56 次报告；工信部国新办发布会（2026.01）')}
      table={{ columns: [tr('年份'), tr('核心产业规模（亿元）'), tr('说明')], rows: coreData.map((d) => [d.label, +d.value.toFixed(1), d.note ?? '']) }}
    >
      <BarTimeline data={coreData} targets={coreTargets} unit={isEn() ? 'RMB bn' : '亿元'} color={pal.series[0]} fmt={fmtInt} seriesName={tr('核心产业规模')} />
    </ChartCard>

    <ChartCard
      title={tr('算力：新质生产力的「电力」')}
      subtitle={tr('算力总规模（EFLOPS，FP32 口径）。2025 年起智能算力改按 FP16 统计，年底达 1590 EFLOPS，口径不可直接比较')}
      source={tr('工业和信息化部；国家数据局')}
      table={{
        columns: [tr('年份'), tr('通用及其他算力'), tr('智能算力'), tr('合计')],
        rows: COMPUTE_POWER.map((d) => [d.label, d.general, d.intelligent, d.general + d.intelligent]),
      }}
    >
      <StackedBars
        data={COMPUTE_POWER}
        keys={[
          { key: 'general', name: tr('通用及其他算力'), color: pal.series[6] },
          { key: 'intelligent', name: tr('智能算力'), color: pal.series[0] },
        ]}
        unit="EFLOPS"
        shareOf="intelligent"
        height={280}
        ariaLabel={tr('中国算力规模堆叠柱状图')}
      />
    </ChartCard>

    <ChartCard
      title={tr('数字经济：占 GDP 比重逐年攀升')}
      subtitle={tr('数字经济规模（万亿元）；柱下一行为占 GDP 比重')}
      source={tr('中国信通院《中国数字经济发展研究报告》各年版')}
      table={{ columns: [tr('年份'), tr('规模（万亿元）'), tr('占 GDP 比重')], rows: DIGITAL_ECONOMY.map((d) => [d.label, d.value, `${d.share}%`]) }}
    >
      <BarTimeline
        data={DIGITAL_ECONOMY}
        unit={tr('万亿元')}
        color={pal.series[2]}
        fmt={fmt1}
        subRow={{ name: tr('占GDP'), values: DIGITAL_ECONOMY.map((d) => `${d.share}%`) }}
        seriesName={tr('数字经济规模')}
      />
    </ChartCard>

    <ChartCard
      title={tr('大模型从「百模」到「千模」')}
      subtitle={tr('完成备案的生成式人工智能服务累计数量（款）')}
      source={tr('国家互联网信息办公室历次公告')}
      table={{ columns: [tr('时间'), tr('累计备案（款）')], rows: GENAI_FILINGS.map((d) => [`20${d.label}`, d.value]) }}
    >
      <BarTimeline data={filings} unit={isEn() ? 'services' : '款'} color={pal.series[3]} fmt={fmtInt} seriesName={tr('累计备案数')} />
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('工业机器人：中国装机量占全球过半')}
      subtitle={tr('每年新装工业机器人数量（台）。柱顶为总量 · 中国占比。2019—2022 年为 IFR 当年发布值，后续年份 IFR 有小幅修订')}
      source={tr('国际机器人联合会（IFR）World Robotics 各年版')}
      table={{
        columns: [tr('年份'), tr('中国'), tr('世界其他地区'), tr('全球合计'), tr('中国占比')],
        rows: ROBOTS.map((d) => [d.label, d.china, d.rest, d.china + d.rest, `${((d.china / (d.china + d.rest)) * 100).toFixed(1)}%`]),
      }}
    >
      <StackedBars
        data={ROBOTS}
        keys={[
          { key: 'china', name: tr('中国'), color: pal.series[1] },
          { key: 'rest', name: tr('世界其他地区'), color: pal.series[6] },
        ]}
        unit={tr('台')}
        shareOf="china"
        fmt={(v) => (v >= 10000 ? (isEn() ? `${(v / 1000).toFixed(0)}k` : `${(v / 10000).toFixed(1)}万`) : fmtInt(v))}
        height={300}
        ariaLabel={tr('工业机器人新装机量堆叠柱状图')}
      />
    </ChartCard>

    <ChartCard
      title={tr('制造业机器人密度')}
      subtitle={tr('每万名制造业员工拥有的工业机器人（台，2023）——中国已超过德国、日本')}
      source="IFR World Robotics 2024"
      table={{ columns: [tr('国家'), tr('密度（台/万人）')], rows: density.map((d) => [d.name, d.value]) }}
    >
      <HBarRank data={density} highlight={[tr('中国')]} color={pal.series[1]} unit={tr('台/万人')} labelW={isEn() ? 104 : 92} ariaLabel={tr('机器人密度排名')} />
    </ChartCard>

    <ChartCard
      title={tr('生成式 AI 专利：中国约占七成')}
      subtitle={tr('2014—2023 年生成式 AI 专利族数量（件）')}
      source={tr('WIPO《生成式人工智能专利态势报告》（2024）')}
      table={{ columns: [tr('国家'), tr('专利族数量')], rows: patents.map((d) => [d.name, d.value]) }}
    >
      <HBarRank data={patents} highlight={[tr('中国')]} color={pal.series[1]} unit={isEn() ? 'families' : '件'} rowH={34} labelW={isEn() ? 104 : 92} ariaLabel={tr('生成式 AI 专利数量排名')} />
    </ChartCard>
  </div>
</Section>

<style>
  .tiles {
    margin-bottom: 24px;
  }
</style>
