<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import ExperimentChart from '../lib/charts/ExperimentChart.svelte';
  import SkillGapSlope from '../lib/charts/SkillGapSlope.svelte';
  import ProductionSimulator from '../lib/charts/ProductionSimulator.svelte';
  import { EXPERIMENTS, SKILL_GAP } from '../data/efficiency.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';
</script>

<Section
  id="efficiency"
  num="06"
  kicker="Productivity"
  title={tr('效率革命：全要素生产率')}
  lead={tr('新质生产力的核心标志是<b>全要素生产率（TFP）大幅提升</b>——即在资本和劳动投入不变的情况下产出更多。来自随机对照实验的证据显示：AI 让知识工作者的产出提升 14%—56%，而且<em>越是新手获益越大</em>。')}
>
  <div class="grid-2">
    <ChartCard
      title={tr('随机对照实验：AI 带来的效率提升')}
      subtitle={tr('点击各行查看研究细节')}
      source={tr('NBER w31161；arXiv 2302.06590；HBS 24-013；Science (2023)；SSRN 4945566')}
      table={{
        columns: [tr('研究'), tr('对象'), tr('指标'), tr(isEn() ? '提升幅度' : '提升')],
        rows: EXPERIMENTS.flatMap((e) => e.metrics.map((m) => [tr(e.study), tr(e.who), tr(m.name), `+${m.value}%`])),
      }}
    >
      <ExperimentChart />
    </ChartCard>

    <ChartCard
      title={tr('技能差距被压缩')}
      subtitle={tr('不同技能水平劳动者使用 AI 后的生产率 / 表现提升')}
      source={tr("Brynjolfsson, Li & Raymond（2023）；Dell'Acqua et al.（2023）")}
      table={{
        columns: [tr('研究'), tr('低技能组提升'), tr('高技能组提升')],
        rows: SKILL_GAP.map((s) => [tr(s.study), `+${s.low}%`, `+${s.high}%`]),
      }}
    >
      <SkillGapSlope />
      {#snippet footer()}
        <div class="counter">
          {@html tr('<b>理性看待：</b>METR 2025 年对 16 名资深开源开发者的随机对照实验发现，使用早期 AI 工具反而使其完成任务<b>慢了 19%</b>（尽管他们自认为快了约 20%）。哈佛—BCG 实验也发现，在 AI 能力「边界外」的任务上，顾问的正确率下降 19 个百分点。AI 的增益取决于任务与人机协作方式。')}
        </div>
      {/snippet}
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('交互模拟：AI 如何通过 TFP 改变增长轨迹')}
      subtitle={tr('基于 Cobb-Douglas 生产函数 Y = A·K^α·L^(1−α) 的增长核算。拖动滑块，观察 AI 渗透、技能协同与资本投入如何共同决定 2035 年的产出——这是一个教学模型，参数取自公开研究的区间，并非预测')}
      source={tr('模型设定：作者构建；参数参考 McKinsey（2023）、国务院「人工智能+」行动目标')}
    >
      <ProductionSimulator />
    </ChartCard>
  </div>
</Section>

<style>
  .counter {
    font-size: 12.5px;
    color: var(--text-2);
    padding: 10px 12px;
    border-radius: var(--radius-m);
    background: var(--warn-bg);
    border: 1px solid var(--warn-border);
  }
  .counter :global(b) {
    color: var(--warn-text);
  }
</style>
