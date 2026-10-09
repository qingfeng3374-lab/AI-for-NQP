<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import StatTile from '../lib/components/StatTile.svelte';
  import SankeyFlow from '../lib/charts/SankeyFlow.svelte';
  import DivergingBars from '../lib/charts/DivergingBars.svelte';
  import Waffle from '../lib/charts/Waffle.svelte';
  import { WEF_FLOW, JOB_SANKEY, JOBS_GROWTH, IMF_EXPOSURE } from '../data/labor.js';
  import { pal, slotColor } from '../lib/stores/theme.svelte.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';

  const sankeyNodes = $derived(JOB_SANKEY.nodes.map((n) => ({ ...n, color: slotColor(n.slot) })));
</script>

<Section
  id="labor"
  num="07"
  kicker="Workforce"
  title={tr('劳动者新生：人机协同')}
  lead={tr('新质生产力的第一要素是<b>劳动者</b>。AI 不会简单地「取代人」，而是在重组岗位结构：一些重复性岗位收缩，数据、算法、安全等新岗位快速扩张。世界经济论坛预测，到 2030 年全球岗位将<em>净增 7800 万个</em>，关键在于技能的更新速度。')}
>
  <div class="grid-4 tiles">
    <StatTile value={isEn() ? 170 : 1.7} decimals={isEn() ? 0 : 1} unit={isEn() ? 'million' : '亿个'} label={tr('新创造岗位（2025—2030）')} note={tr('占现有正规就业的 14%')} accent="var(--series-1)" icon="＋" />
    <StatTile value={isEn() ? 92 : 0.92} decimals={isEn() ? 0 : 2} unit={isEn() ? 'million' : '亿个'} label={tr('被替代岗位')} note={tr('占现有正规就业的 8%')} accent="var(--series-2)" icon="－" />
    <StatTile value={isEn() ? 78 : 0.78} decimals={isEn() ? 0 : 2} unit={isEn() ? 'million' : '亿个'} label={tr('净增岗位')} note={tr('结构性变动率 22%')} accent="var(--accent)" icon="＝" />
    <StatTile value={39} suffix="%" label={tr('核心技能将发生变化')} note={tr('雇主预计到 2030 年')} accent="var(--series-3)" icon="✎" />
  </div>

  <div class="grid-2">
    <ChartCard
      span={2}
      title={tr('岗位的「大迁徙」：2025 → 2030')}
      subtitle={tr('全球约 12 亿个正规就业岗位的流向（单位：百万个）。悬停节点高亮相关流向')}
      source="World Economic Forum, Future of Jobs Report 2025"
      table={{
        columns: [tr('来源'), tr('去向'), tr('规模（百万个）')],
        rows: JOB_SANKEY.links.map((l) => [tr(JOB_SANKEY.nodes.find((n) => n.id === l.source).name), tr(JOB_SANKEY.nodes.find((n) => n.id === l.target).name), l.value]),
      }}
    >
      <SankeyFlow nodes={sankeyNodes} links={JOB_SANKEY.links} unit={tr('百万')} height={340} ariaLabel={tr('2025—2030 年全球岗位流向桑基图')} />
      {#snippet footer()}
        <p class="fn">{tr('其中，人工智能与信息处理技术预计创造约 {a} 百万个岗位、替代约 {b} 百万个，是净创造岗位最多的技术驱动因素。', { a: WEF_FLOW.aiCreated, b: WEF_FLOW.aiDisplaced })}</p>
      {/snippet}
    </ChartCard>

    <ChartCard
      title={tr('增长最快 vs 下降最快的岗位')}
      subtitle={tr('2025—2030 年预计净增长率（%）')}
      source="World Economic Forum, Future of Jobs Report 2025"
      table={{ columns: [tr('岗位'), tr('净增长率（%）')], rows: JOBS_GROWTH.map((d) => [tr(d.name), d.value]) }}
    >
      <DivergingBars data={JOBS_GROWTH} rowH={24} posLabel="增长" negLabel="收缩" ariaLabel={tr('岗位增长与收缩发散条形图')} />
    </ChartCard>

    <ChartCard
      title={tr('谁会受到 AI 影响？')}
      subtitle={tr('受 AI 影响（暴露）的就业占比，每个方块代表 1%。其中约一半可能因 AI 互补而受益')}
      source="IMF Staff Discussion Note SDN/2024/001"
      table={{ columns: [tr('经济体'), tr('暴露于 AI 的就业占比')], rows: IMF_EXPOSURE.map((d) => [tr(d.name), `${d.value}%`]) }}
    >
      <div class="waffles">
        {#each IMF_EXPOSURE as d}
          <Waffle total={100} segments={[{ count: d.value, color: pal.series[2], label: tr(d.name) }]} cols={10} cell={11} gap={3} title={tr(d.name)} caption="<b>{d.value}%</b>" />
        {/each}
      </div>
      {#snippet footer()}
        <p class="fn">{tr('发达经济体中认知型岗位占比更高，因此「暴露度」更高——这既意味着替代风险，也意味着更大的增效空间。')}</p>
      {/snippet}
    </ChartCard>
  </div>
</Section>

<style>
  .tiles {
    margin-bottom: 24px;
  }
  .waffles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 24px;
  }
  .fn {
    font-size: 12.5px;
    color: var(--text-2);
    margin: 0;
  }
</style>
