<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import FutureMilestones from '../lib/charts/FutureMilestones.svelte';
  import SixActions from '../lib/charts/SixActions.svelte';
  import { MILESTONES, SIX_ACTIONS } from '../data/future.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';
</script>

<Section
  id="future"
  num="10"
  kicker="Outlook"
  title={tr('未来已来："人工智能+"')}
  lead={tr('2025 年 8 月，国务院印发《关于深入实施"人工智能+"行动的意见》，为 AI 作为新质生产力的发展绘制了时间表：从 2027 年的<b>广泛深度融合</b>，到 2030 年的<b>全面赋能高质量发展</b>，再到 2035 年<em>全面步入智能经济和智能社会</em>。')}
>
  <ChartCard
    title={tr('三阶段目标')}
    subtitle={tr('新一代智能终端、智能体等应用普及率目标；轴上标注了当前所处的位置')}
    source={tr('国务院《关于深入实施「人工智能+」行动的意见》（国发〔2025〕11 号）')}
    table={{ columns: [tr('年份'), tr('目标'), tr('内容')], rows: MILESTONES.map((m) => [m.year, tr(m.title), tr(m.text)]) }}
  >
    <FutureMilestones />
  </ChartCard>
  <div style="height:24px"></div>
  <ChartCard
    title={tr('六大重点行动')}
    subtitle={tr('悬停或点击六边形，查看每一项行动的内涵与典型场景')}
    source={tr('国务院《关于深入实施「人工智能+」行动的意见》')}
    table={{ columns: [tr('行动'), tr(isEn() ? '行动内涵' : '内涵'), tr('典型场景')], rows: SIX_ACTIONS.map((a) => [tr('人工智能+{n}', { n: tr(a.name) }), tr(a.desc), tr(a.example)]) }}
  >
    <SixActions />
  </ChartCard>
</Section>
