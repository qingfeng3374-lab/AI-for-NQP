<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import StatTile from '../lib/components/StatTile.svelte';
  import ComputeScatter from '../lib/charts/ComputeScatter.svelte';
  import BenchmarkMultiples from '../lib/charts/BenchmarkMultiples.svelte';
  import CostCollapse from '../lib/charts/CostCollapse.svelte';
  import { MODELS, REGIONS, BENCHMARKS, INFERENCE_COST } from '../data/engine.js';
  import { fmtSci } from '../lib/utils/format.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';

  const regionName = Object.fromEntries(REGIONS.map((r) => [r.id, r.name]));
</script>

<Section
  id="engine"
  num="03"
  kicker="Technology"
  title={tr('技术引擎：算力 · 能力 · 成本')}
  lead={tr('新质生产力首先是<b>技术革命性突破</b>。过去十余年，AI 的训练算力每年增长 4—5 倍，模型能力在一个又一个领域追平并超越人类专家，而使用成本却以百倍速度下降——这三条曲线叠加，让 AI 从实验室走向千行百业成为可能。')}
>
  <div class="grid-4 tiles">
    <StatTile value={4.5} decimals={1} suffix="×" unit={tr('/ 年')} label={tr('前沿模型训练算力增速')} note={tr('Epoch AI：2010 年以来约每 5—6 个月翻一番')} icon="⚙" />
    <StatTile value={280} suffix="×" label={tr('推理价格降幅')} note={tr('GPT-3.5 级能力，2022.11 → 2024.10')} accent="var(--series-3)" icon="↓" />
    <StatTile value={91.9} decimals={1} suffix="%" label={tr('GPQA 博士级科学题得分')} note={tr('2025.11 顶尖模型；领域博士约 70%')} accent="var(--series-4)" icon="✦" />
    <StatTile value={35} unit={isEn() ? '' : '个'} label={tr('2025 年中国重要 AI 模型')} note={tr('美国 59 个，中国位列第二（AI Index 2026）')} accent="var(--series-2)" icon="◆" />
  </div>

  <div class="grid-2">
    <ChartCard
      span={2}
      title={tr('训练算力的指数级跃升（2012—2026）')}
      subtitle={tr('每个点代表一个代表性模型；虚线为对当前可见点的对数线性回归，可点击图例筛选国家/地区。DeepSeek-V3 等中国模型以约 1/10 的算力达到接近前沿的性能，体现「算法效率」这一新质路径')}
      source={tr('Epoch AI, Notable AI Models（2026-10 数据快照）')}
      table={{
        columns: [tr('模型'), tr('发布'), tr('机构'), tr('国家/地区'), tr('训练算力（FLOP）')],
        rows: MODELS.map((d) => [d.name, Math.floor(d.date), tr(d.org), tr(regionName[d.region]), fmtSci(d.flop)]),
      }}
    >
      <ComputeScatter />
    </ChartCard>

    <ChartCard
      title={tr('能力：一个接一个地超越人类基线')}
      subtitle={tr('四项代表性基准测试的顶尖模型成绩（只保留刷新纪录的点），橙色虚线为人类专家水平')}
      source={tr('各基准论文与模型发布报告；Stanford AI Index 2025')}
      table={{
        columns: [tr('基准'), tr('时间'), tr('模型'), tr('得分（%）')],
        rows: BENCHMARKS.flatMap((b) => b.points.map((p) => [b.name, p[0].toFixed(1), p[2], p[1]])),
      }}
    >
      <BenchmarkMultiples />
    </ChartCard>

    <ChartCard
      title={tr('成本：智能正在变得「廉价而充裕」')}
      subtitle={tr('GPT-3.5 级能力的大模型 API 价格（美元 / 百万 token，输入:输出 = 3:1 混合，对数轴）')}
      source={tr('Stanford AI Index 2025；OpenAI、Google 官方定价；国内厂商公开定价')}
      table={{ columns: [tr('时间'), tr('模型'), tr('价格（$ / 百万 token）')], rows: INFERENCE_COST.map((d) => [d.date.toFixed(2), d.model, d.price]) }}
    >
      <CostCollapse />
    </ChartCard>
  </div>
</Section>

<style>
  .tiles {
    margin-bottom: 24px;
  }
</style>
