<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import IndustryChainTree from '../lib/charts/IndustryChainTree.svelte';
  import RangeDumbbell from '../lib/charts/RangeDumbbell.svelte';
  import Waffle from '../lib/charts/Waffle.svelte';
  import FactoryPyramid from '../lib/charts/FactoryPyramid.svelte';
  import BarTimeline from '../lib/charts/BarTimeline.svelte';
  import { CHAIN, MCKINSEY_INDUSTRY, MCKINSEY_FUNCTION, LIGHTHOUSE, SMART_FACTORY, SMART_FACTORY_EFFECT } from '../data/industry.js';
  import { ORG_ADOPTION } from '../data/global.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';

  // 产业链树 → 数据表
  const chainRows = $derived(
    CHAIN.children.flatMap((l1) =>
      l1.children.map((l2) => [tr(l1.name), tr(l2.name), (l2.children ?? []).map((c) => tr(c.name)).join(isEn() ? ', ' : '、')]),
    ),
  );
</script>

<Section
  id="industry"
  num="05"
  kicker="Industry"
  title={tr('千行百业：AI+ 产业')}
  lead={tr('新质生产力的第三个催生动力是<b>产业深度转型升级</b>。AI 作为通用目的技术，一端连接芯片、算力、数据等基础层，一端渗透到制造、金融、医疗、能源等应用层；它既<em>催生新兴产业</em>，又<em>改造传统产业</em>。')}
>
  <div class="grid-2">
    <ChartCard
      title={tr('人工智能产业链图谱')}
      subtitle={tr('基础层 → 技术层 → 应用层。点击节点展开细分环节')}
      source={tr('根据中国信通院《人工智能产业图谱》等公开资料整理')}
      table={{ columns: [tr('层级'), tr('环节'), tr('细分')], rows: chainRows }}
    >
      <IndustryChainTree />
    </ChartCard>

    <div class="stack">
      <ChartCard
        title={tr('生成式 AI 的行业价值潜力')}
        subtitle={tr('每年可创造的经济价值（十亿美元，区间），全球合计 2.6 万亿—4.4 万亿美元')}
        source={tr('McKinsey, The economic potential of generative AI（2023）')}
        table={{ columns: [tr('行业'), tr('下限（十亿美元）'), tr('上限（十亿美元）')], rows: MCKINSEY_INDUSTRY.map((d) => [tr(d.name), d.low, d.high]) }}
      >
        <RangeDumbbell data={MCKINSEY_INDUSTRY} unit={tr('十亿美元')} color={pal.series[0]} labelW={isEn() ? 185 : 112} rowH={27} ariaLabel={tr('生成式 AI 行业价值区间')} />
      </ChartCard>
      <ChartCard
        title={tr('价值集中在四类职能')}
        subtitle={tr('生成式 AI 对职能支出的生产率影响（%）——这四类职能占全部价值约 75%')}
        source={tr('McKinsey（2023）')}
        table={{ columns: [tr('职能'), tr('下限（%）'), tr('上限（%）')], rows: MCKINSEY_FUNCTION.map((d) => [tr(d.name), d.low, d.high]) }}
      >
        <RangeDumbbell data={MCKINSEY_FUNCTION} unit="%" color={pal.series[2]} labelW={isEn() ? 150 : 80} rowH={30} ariaLabel={tr('职能生产率影响区间')} />
      </ChartCard>
    </div>

    <ChartCard
      title={tr('「灯塔工厂」：中国占全球 45%')}
      subtitle={tr('世界经济论坛全球灯塔网络，每个方块代表一座灯塔工厂（{date}）', { date: tr(LIGHTHOUSE.date) })}
      source="World Economic Forum, Global Lighthouse Network"
      table={{ columns: [tr('范围'), tr('数量')], rows: [[tr('全球'), LIGHTHOUSE.total], [tr('中国'), LIGHTHOUSE.china], [tr('其他国家和地区'), LIGHTHOUSE.total - LIGHTHOUSE.china]] }}
    >
      <div class="lh">
        <Waffle
          total={LIGHTHOUSE.total}
          segments={[{ count: LIGHTHOUSE.china, color: pal.series[1], label: tr('中国') }]}
          cols={16}
          cell={14}
          gap={4}
        />
        <div class="lh-leg">
          <div><span class="sq" style:background={pal.series[1]}></span>{tr('中国')} <b>{LIGHTHOUSE.china}</b> {tr('座')}</div>
          <div><span class="sq" style:background="var(--empty)"></span>{tr('其他国家和地区')} <b>{LIGHTHOUSE.total - LIGHTHOUSE.china}</b> {tr('座')}</div>
          <p>{tr('灯塔工厂是应用 AI、数字孪生等第四次工业革命技术、实现规模化效益提升的标杆工厂。')}</p>
        </div>
      </div>
    </ChartCard>

    <ChartCard
      title={tr('智能工厂梯度培育')}
      subtitle={tr('工信部构建「基础级—先进级—卓越级—领航级」四级智能工厂体系（2026）')}
      source={tr('工业和信息化部；公开报道')}
      table={{ columns: [tr('层级'), tr('数量')], rows: SMART_FACTORY.map((d) => [tr(d.tier), tr(d.text)]) }}
    >
      <FactoryPyramid />
      {#snippet footer()}
        <div class="eff">
          <div><b class="grad-text">−{SMART_FACTORY_EFFECT.defect}%</b><span>{tr('产品不良率平均下降')}</span></div>
          <div><b class="grad-text">−{SMART_FACTORY_EFFECT.rnd}%</b><span>{tr('研发周期平均缩短')}</span></div>
        </div>
      {/snippet}
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('全球企业 AI 采用率')}
      subtitle={tr('受访组织中至少在一个业务职能使用 AI 的比例（%）。生成式 AI 出现后的 2024—2025 年跃升明显')}
      source={tr('McKinsey, The State of AI 各年度调查；Stanford AI Index 2025 / 2026（各年问卷口径略有变化）')}
      table={{ columns: [tr('年份'), tr('采用率（%）')], rows: ORG_ADOPTION.map((d) => [d.label, d.value]) }}
    >
      <BarTimeline data={ORG_ADOPTION} unit="%" color={pal.series[6]} height={260} yMax={100} seriesName={tr('AI 采用率')} fmt={(v) => `${v}`} />
    </ChartCard>
  </div>
</Section>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }
  .lh {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(140px, 1fr);
    gap: 18px;
    align-items: center;
  }
  .lh-leg {
    font-size: 13px;
    color: var(--text-2);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .lh-leg b {
    color: var(--text-1);
    font-size: 18px;
  }
  .lh-leg p {
    font-size: 12px;
    color: var(--text-3);
    margin: 0;
  }
  .sq {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 6px;
  }
  .eff {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .eff div {
    padding: 10px 12px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }
  .eff b {
    display: block;
    font-size: 26px;
    font-weight: 800;
  }
  .eff span {
    font-size: 12px;
    color: var(--text-3);
  }
  @media (max-width: 520px) {
    .lh {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
