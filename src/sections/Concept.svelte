<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import ElementsDiagram from '../lib/charts/ElementsDiagram.svelte';
  import PolicyTimeline from '../lib/charts/PolicyTimeline.svelte';
  import { ELEMENTS, POLICY_TIMELINE } from '../data/concept.js';
  import { tr } from '../lib/i18n/lang.svelte.js';
</script>

<Section
  id="concept"
  num="01"
  kicker="Concept"
  title={tr('何为新质生产力')}
  lead={tr('新质生产力是<b>创新起主导作用</b>，摆脱传统经济增长方式、生产力发展路径的先进生产力质态。它由<em>技术革命性突破、生产要素创新性配置、产业深度转型升级</em>催生，以劳动者、劳动资料、劳动对象及其优化组合的跃升为基本内涵，以<b>全要素生产率大幅提升</b>为核心标志。人工智能恰恰同时作用于这三大要素。')}
>
  <ChartCard
    title={tr('AI 如何重塑生产力三要素')}
    subtitle={tr('切换「传统 / 新质」观察要素形态与中心全要素生产率（TFP）的变化；粒子流速代表要素协同效率')}
    source={tr('中共中央政治局第十一次集体学习（2024.01）；CNNIC；国家数据局')}
    table={{
      columns: [tr('要素'), tr('传统形态'), tr('AI 赋能后的新质形态'), tr('关键数据')],
      rows: ELEMENTS.map((e) => [
        tr(e.name),
        e.old.map((s) => tr(s)).join(tr('；')),
        e.neo.map((s) => tr(s)).join(tr('；')),
        tr('{v}（{l}）', { v: tr(e.fact.value), l: tr(e.fact.label) }),
      ]),
    }}
  >
    <ElementsDiagram />
  </ChartCard>

  <div style="height:24px"></div>

  <ChartCard
    title={tr('从「人工智能」到「新质生产力」：两条政策主线的交汇')}
    subtitle={tr('悬停或点击节点查看详情')}
    source={tr('中国政府网、新华社公开报道')}
    table={{
      columns: [tr('时间'), tr('事件'), tr('要点')],
      rows: POLICY_TIMELINE.map((e) => [e.date, tr(e.title), tr(e.desc)]),
    }}
  >
    <PolicyTimeline />
  </ChartCard>
</Section>
