<script>
  import Section from '../lib/components/Section.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import EnergyChart from '../lib/charts/EnergyChart.svelte';
  import { DC_ELECTRICITY, AI_FOR_GREEN, GOVERNANCE } from '../data/green.js';
  import { inview } from '../lib/actions/inview.js';
  import { tr } from '../lib/i18n/lang.svelte.js';

  let shown = $state(false);
</script>

<Section
  id="green"
  num="09"
  kicker="Sustainability"
  title={tr('绿色与治理：高质量发展')}
  lead={tr('新质生产力本身就是<b>绿色生产力</b>。AI 一方面是新的能源消耗大户，另一方面又是节能降碳的有力工具；同时，它需要以「发展与安全并重」的治理体系作为护栏。')}
>
  <div class="grid-2">
    <ChartCard
      title={tr('AI 的能源账本：数据中心用电')}
      subtitle={tr('全球数据中心用电量（太瓦时 TWh）')}
      source={tr('IEA, Energy and AI（2025）')}
      table={{
        columns: [tr('年份 / 区域'), tr('用电量（TWh）')],
        rows: [
          ...DC_ELECTRICITY.y2024.map((d) => [`2024 · ${tr(d.name)}`, d.value]),
          [tr('2024 · 合计'), DC_ELECTRICITY.total2024],
          [tr('2030 · 基准情景'), DC_ELECTRICITY.total2030],
          [tr('2035 · 基准情景'), DC_ELECTRICITY.total2035],
        ],
      }}
    >
      <EnergyChart />
    </ChartCard>

    <ChartCard title={tr('AI 的节能潜力')} subtitle={tr('IEA 估算：推广现有 AI 应用可在多个领域带来的节能效果')} source={tr('IEA, Energy and AI（2025）')}>
      <div class="green" use:inview={{ onEnter: () => (shown = true) }}>
        {#each AI_FOR_GREEN as g, i}
          <div class="g" class:shown style:transition-delay="{i * 120}ms">
            <div class="gi" aria-hidden="true">{g.icon}</div>
            <div>
              <div class="gl">{tr(g.label)}</div>
              <div class="gv">{tr(g.value)}</div>
              <div class="gt">{tr(g.text)}</div>
            </div>
          </div>
        {/each}
      </div>
    </ChartCard>

    <ChartCard span={2} title={tr('发展与安全并重：中国 AI 治理的关键节点')} subtitle={tr('规则、安全、合作三条主线')} source={tr('国家网信办；外交部；全国网络安全标准化技术委员会')}>
      <ol class="gov">
        {#each GOVERNANCE as g}
          <li class={g.kind === '规则' ? 'k1' : g.kind === '安全' ? 'k2' : 'k3'}>
            <span class="gd">{g.date}</span>
            <span class="gk">{tr(g.kind)}</span>
            <span class="gtt">{tr(g.title)}</span>
          </li>
        {/each}
      </ol>
    </ChartCard>
  </div>
</Section>

<style>
  .green {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .g {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-radius: var(--radius-m);
    background: var(--green-bg);
    border: 1px solid var(--green-border);
    opacity: 0;
    transform: translateY(12px);
    transition: all 0.6s ease;
  }
  .g.shown {
    opacity: 1;
    transform: none;
  }
  .gi {
    font-size: 24px;
  }
  .gl {
    font-size: 12px;
    color: var(--green-text);
  }
  .gv {
    font-size: 19px;
    font-weight: 800;
    color: var(--text-1);
    line-height: 1.3;
  }
  .gt {
    font-size: 12px;
    color: var(--text-2);
    margin-top: 4px;
    line-height: 1.5;
  }
  .gov {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    counter-reset: g;
  }
  .gov li {
    position: relative;
    padding: 14px 14px 14px;
    border-radius: var(--radius-m);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-top: 3px solid var(--c);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .k1 {
    --c: var(--series-1);
  }
  .k2 {
    --c: var(--series-2);
  }
  .k3 {
    --c: var(--series-3);
  }
  .gd {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-1);
  }
  .gk {
    align-self: flex-start;
    font-size: 11px;
    padding: 0 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--c) 18%, transparent);
    color: var(--text-1);
  }
  .gtt {
    font-size: 13px;
    color: var(--text-2);
  }
  @media (max-width: 960px) {
    .gov {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 520px) {
    .green,
    .gov {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
