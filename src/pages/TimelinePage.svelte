<script>
  import PageHeader from '../lib/components/PageHeader.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import MilestoneTimeline from '../lib/charts/MilestoneTimeline.svelte';
  import BarTimeline from '../lib/charts/BarTimeline.svelte';
  import { LANES, ERAS, MILESTONES } from '../data/milestones.js';
  import { pal, slotColor } from '../lib/stores/theme.svelte.js';
  import { tr } from '../lib/i18n/lang.svelte.js';

  let tl;
  let selected = $state.raw(null);
  const laneOf = Object.fromEntries(LANES.map((l) => [l.id, l]));

  // 按年代统计收录的里程碑数量 —— 直观呈现"技术革命性突破"的加速
  const decades = [];
  for (let d = 1940; d <= 2020; d += 10) {
    decades.push({ label: `${d}s`, value: MILESTONES.filter((m) => m.date >= d && m.date < d + 10).length });
  }

  // 相邻事件导航
  const sorted = [...MILESTONES].sort((a, b) => a.date - b.date);
  const idx = $derived(selected ? sorted.indexOf(selected) : -1);
  function go(step) {
    const i = idx < 0 ? 0 : Math.min(sorted.length - 1, Math.max(0, idx + step));
    selected = sorted[i];
    tl?.zoomToEvent(selected);
  }

  const JUMPS = [
    { name: '起源 1940—1970', a: 1940, b: 1972 },
    { name: '两次寒冬 1970—1995', a: 1968, b: 1996 },
    { name: '深度学习 2006—2020', a: 2005, b: 2021 },
    { name: '大模型 2017—2026', a: 2016.5, b: 2026.5 },
  ];
</script>

<PageHeader
  kicker="AI Timeline"
  title={tr('AI 时光轴：80 年，从理论到生产力')}
  lead={tr('人工智能经历了两次「寒冬」，直到<b>算法、算力、数据</b>三者在 2012 年后同时成熟，才真正成为推动生产力跃迁的通用技术。拖动、缩放或点击「播放」，沿时间轴回看这段历程；下方的算力条带与时间轴联动。')}
/>

<div class="container">
  <div class="jumps">
    <span>{tr('快速跳转：')}</span>
    {#each JUMPS as j}
      <button onclick={() => tl?.zoomToRange(j.a, j.b)}>{tr(j.name)}</button>
    {/each}
  </div>

  <ChartCard
    title={tr('人工智能里程碑（1943—2025）')}
    subtitle={tr('五条泳道：算法突破 · 算力与数据 · 标志性应用 · 中国进展 · 政策与治理。大圆点为重大里程碑；橙色背景为 AI 寒冬')}
    source={tr('公开史料整理；训练算力来自 Epoch AI')}
    table={{
      columns: [tr('年份'), tr('类别'), tr('事件'), tr('说明')],
      rows: sorted.map((m) => [Math.floor(m.date), tr(laneOf[m.lane].name), tr(m.title), tr(m.desc)]),
    }}
  >
    <MilestoneTimeline bind:this={tl} bind:selected />
  </ChartCard>

  <div class="row">
    <div class="detail" aria-live="polite">
      {#if selected}
        {@const l = laneOf[selected.lane]}
        <div class="top">
          <span class="lane" style:--c={slotColor(l.slot)}>{tr(l.name)}</span>
          <span class="yr grad-text">{Math.floor(selected.date)}</span>
        </div>
        <h2>{tr(selected.title)}</h2>
        <p>{tr(selected.desc)}</p>
        {#if selected.major}<div class="major">★ {tr('重大里程碑')}</div>{/if}
      {:else}
        <h2>{tr('点击时间轴上的事件')}</h2>
        <p>
          {tr('或使用下方按钮逐个浏览。共收录 {n} 个里程碑，其中 {k} 个为重大事件。', { n: MILESTONES.length, k: MILESTONES.filter((m) => m.major).length })}
        </p>
      {/if}
      <div class="nav">
        <button onclick={() => go(-1)} disabled={idx === 0}>← {tr('上一个')}</button>
        <span>{idx >= 0 ? idx + 1 : '–'} / {sorted.length}</span>
        <button onclick={() => go(1)} disabled={idx === sorted.length - 1}>{tr('下一个')} →</button>
      </div>
    </div>

    <ChartCard
      title={tr('里程碑在加速到来')}
      subtitle={tr('本时光轴收录的里程碑数量（按年代）。2010 年代以后的密度远超此前 70 年')}
      source={tr('根据本页收录事件统计')}
      table={{ columns: [tr('年代'), tr('里程碑数量')], rows: decades.map((d) => [d.label, d.value]) }}
    >
      <BarTimeline data={decades} color={pal.accent} unit={tr('个')} height={230} seriesName={tr('里程碑数量')} />
    </ChartCard>
  </div>

  <div class="eras">
    {#each ERAS as e}
      <button class="era" class:winter={e.winter} onclick={() => tl?.zoomToRange(Math.max(1940, e.start - 2), Math.min(2027, e.end + 2))}>
        <span class="en">{tr(e.name)}</span>
        <span class="ey">{e.start} — {Math.floor(e.end) === 2026 ? tr('今') : e.end}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .jumps {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 13px;
    color: var(--text-3);
  }
  .jumps button {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: 12.5px;
  }
  .jumps button:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 20px;
    margin-top: 20px;
  }
  .detail {
    display: flex;
    flex-direction: column;
    padding: 22px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lane {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--c) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
  }
  .yr {
    font-size: 44px;
    font-weight: 900;
    line-height: 1;
  }
  h2 {
    font-size: 24px;
    margin: 10px 0 8px;
  }
  .detail p {
    color: var(--text-2);
    flex: 1;
  }
  .major {
    font-size: 12.5px;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 10px;
  }
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 12.5px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .nav button {
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text-1);
    font-size: 13px;
  }
  .nav button:disabled {
    opacity: 0.4;
  }
  .eras {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 8px;
    margin-top: 20px;
  }
  .era {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px;
    border-radius: var(--radius-m);
    border: 1px solid var(--border);
    background: var(--card-bg);
    text-align: left;
    color: var(--text-1);
  }
  .era:hover {
    border-color: var(--accent);
  }
  .era.winter {
    background: var(--warn-bg);
    border-color: var(--warn-border);
  }
  .en {
    font-size: 13px;
    font-weight: 700;
  }
  .ey {
    font-size: 11.5px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 900px) {
    .row {
      grid-template-columns: minmax(0, 1fr);
    }
    .eras {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
