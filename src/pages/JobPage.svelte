<script>
  import PageHeader from '../lib/components/PageHeader.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import RadarChart from '../lib/charts/RadarChart.svelte';
  import QuadrantScatter from '../lib/charts/QuadrantScatter.svelte';
  import { TASKS, OCCUPATIONS, EVIDENCE, THRESH, QUADRANTS, ADVICE } from '../data/jobs.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';

  // ---- 状态：任务时间构成（相对权重）+ 每周工时 ----
  let preset = $state('dev');
  let mix = $state({ ...OCCUPATIONS[0].mix });
  let hours = $state(40);

  function load(id) {
    preset = id;
    mix = { ...OCCUPATIONS.find((o) => o.id === id).mix };
  }

  // ---- 计算 ----
  function evaluate(m) {
    const total = TASKS.reduce((s, t) => s + (m[t.id] ?? 0), 0) || 1;
    const shares = TASKS.map((t) => (m[t.id] ?? 0) / total);
    const A = TASKS.reduce((s, t, i) => s + shares[i] * t.auto, 0);
    const G = TASKS.reduce((s, t, i) => s + shares[i] * t.aug, 0);
    return { shares, A, G, H: 1 - A - G };
  }
  const r = $derived(evaluate(mix));
  const saved = $derived(r.A * EVIDENCE.autoSave + r.G * (1 - 1 / (1 + EVIDENCE.augGain)));
  const hoursSaved = $derived(hours * saved);
  const boost = $derived(1 / (1 - saved) - 1);
  const quad = $derived(
    QUADRANTS.find((q) => (q.x === 'high') === r.A >= THRESH.auto && (q.y === 'high') === r.G >= THRESH.aug),
  );

  const points = OCCUPATIONS.map((o) => {
    const e = evaluate(o.mix);
    return { id: o.id, name: o.name, x: e.A, y: e.G };
  });

  // 雷达：你的时间分布 vs AI 可作用的时间（同一刻度）
  const maxShare = $derived(Math.max(...r.shares, 0.01));
  const radarSeries = $derived([
    { name: tr('你的时间分布'), color: pal.series[6], values: r.shares.map((s) => s / maxShare) },
    { name: tr('AI 可作用的部分'), color: pal.series[1], values: r.shares.map((s, i) => (s * (TASKS[i].auto + TASKS[i].aug)) / maxShare) },
  ]);

  // 建议：时间占比最高的两类任务
  const topTasks = $derived(
    TASKS.map((t, i) => ({ ...t, share: r.shares[i] }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 3)
      .filter((t) => t.share > 0.05),
  );

  // 数字滚动
  const tA = new Tween(0, { duration: 500, easing: cubicOut });
  const tG = new Tween(0, { duration: 500, easing: cubicOut });
  const tH = new Tween(0, { duration: 500, easing: cubicOut });
  const tS = new Tween(0, { duration: 500, easing: cubicOut });
  $effect(() => {
    tA.target = r.A;
    tG.target = r.G;
    tH.target = r.H;
    tS.target = hoursSaved;
  });
  const SPLIT = $derived([
    { key: tr('可由 AI 自动完成'), v: tA.current, color: pal.series[1] },
    { key: tr('AI 增强、人主导'), v: tG.current, color: pal.series[0] },
    { key: tr('人类主导'), v: tH.current, color: pal.series[2] },
  ]);
</script>

<PageHeader
  kicker="Job × AI"
  title={tr('岗位诊断：AI 会怎样改变你的工作？')}
  lead={tr('AI 作为新质生产力，首先改变的是<b>劳动者</b>。选择一个职业或按实际情况调整你的任务构成，看看哪些工作会被 AI <b>替代</b>、哪些会被 AI <b>增强</b>、哪些仍由<b>人类主导</b>。')}
/>

<div class="container">
  <div class="presets" role="group" aria-label={tr('预设职业')}>
    {#each OCCUPATIONS as o}
      <button class:on={preset === o.id} onclick={() => load(o.id)}>{tr(o.name)}</button>
    {/each}
  </div>

  <div class="layout">
    <!-- 输入 -->
    <section class="inputs">
      <h2>{tr('① 你的任务构成')}</h2>
      <p class="sub">{tr('拖动滑块表示每类任务占用你工作时间的多少（系统自动换算为百分比）')}</p>
      {#each TASKS as t, i}
        <label class="task">
          <span class="tn">{tr(t.name)}<b>{Math.round(r.shares[i] * 100)}%</b></span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            bind:value={mix[t.id]}
            oninput={() => (preset = '')}
            style:--p="{mix[t.id]}%"
          />
          <span class="th">{tr(t.hint)}</span>
        </label>
      {/each}
      <label class="hours">
        <span>{tr('每周工作时长')}</span>
        <input type="number" min="1" max="80" bind:value={hours} />
        <span>{tr('小时')}</span>
      </label>
    </section>

    <!-- 结果 -->
    <section class="result">
      <h2>{tr('② 诊断结果')}</h2>
      <div class="badge" style:--c={quad.id === 'risk' ? pal.series[1] : quad.id === 'human' ? pal.series[3] : quad.id === 'amplify' ? pal.series[0] : pal.accent2}>
        <span class="bt">{tr(quad.name)}</span>
        <span class="bd">{tr(quad.text)}</span>
      </div>
      <div class="kpis">
        <div class="kpi"><span>{tr('每周可节省')}</span><b class="grad-text">{tS.current.toFixed(1)}</b><em>{tr('小时')}</em></div>
        <div class="kpi"><span>{tr('同样时间多完成')}</span><b class="grad-text">+{Math.round(boost * 100)}%</b><em>{tr('工作量')}</em></div>
      </div>
      <div class="split">
        <div class="sbar">
          {#each SPLIT as s}
            <div style:flex-grow={Math.max(0.001, s.v)} style:background={s.color} title="{s.key} {Math.round(s.v * 100)}%"></div>
          {/each}
        </div>
        <div class="sleg">
          {#each SPLIT as s}
            <span><i style:background={s.color}></i>{s.key} <b>{Math.round(s.v * 100)}%</b></span>
          {/each}
        </div>
      </div>
      <p class="note">
        {tr('测算依据：可自动化任务按节省约 80% 用时计（Anthropic Economic Index, 2025），增强型任务按效率提升 26% 计（Cui et al., 2024 现场实验）。任务系数为教学示意模型。')}
      </p>
    </section>
  </div>

  <div class="grid-2 charts">
    <ChartCard
      title={tr('任务雷达：AI 作用在你工作的哪些部分')}
      subtitle={tr('蓝色为你的时间分布，橙色为其中 AI 可以介入（替代或增强）的部分，两者使用同一刻度')}
      table={{
        columns: [tr('任务'), tr('时间占比'), tr('AI 可介入占比')],
        rows: TASKS.map((t, i) => [tr(t.name), `${Math.round(r.shares[i] * 100)}%`, `${Math.round(r.shares[i] * (t.auto + t.aug) * 100)}%`]),
      }}
    >
      <RadarChart axes={TASKS.map((t) => tr(t.name))} series={radarSeries} size={360} ariaLabel={tr('任务雷达图')} />
    </ChartCard>

    <ChartCard
      title={tr('职业坐标：你在哪个象限？')}
      subtitle={tr('横轴为自动化潜力，纵轴为增强潜力（参考 IMF「暴露度—互补性」框架）。点击灰点可载入该职业')}
      source={tr('示意模型；参考 IMF SDN/2024/001、Eloundou et al.（2023）')}
      table={{ columns: [tr('职业'), tr('自动化潜力'), tr('增强潜力')], rows: points.map((p) => [tr(p.name), `${Math.round(p.x * 100)}%`, `${Math.round(p.y * 100)}%`]) }}
    >
      <QuadrantScatter {points} me={{ x: r.A, y: r.G }} thresh={THRESH} quadrants={QUADRANTS} activeId={quad.id} onPick={load} />
    </ChartCard>
  </div>

  <div class="tasks-card">
    <ChartCard title={tr('逐项拆解：每类任务的时间去向')} subtitle={tr('条形长度 = 该任务占你的时间；颜色 = 其中可自动化 / 可增强 / 人类主导的比例')}>
      <div class="rows">
        {#each TASKS as t, i}
          <div class="trow" class:en={isEn()}>
            <span class="tl">{tr(t.name)}</span>
            <div class="tbar" style:width="{(r.shares[i] / maxShare) * 100}%">
              <div style:flex-grow={t.auto} style:background={pal.series[1]}></div>
              <div style:flex-grow={t.aug} style:background={pal.series[0]}></div>
              <div style:flex-grow={1 - t.auto - t.aug} style:background={pal.series[2]}></div>
            </div>
            <span class="tv">{Math.round(r.shares[i] * 100)}%</span>
          </div>
        {/each}
      </div>
    </ChartCard>
  </div>

  <h2 class="adv-h">{tr('③ 给你的转型建议')}</h2>
  <div class="advice">
    {#each topTasks as t, i}
      <div class="adv">
        <span class="an">0{i + 1}</span>
        <div>
          <div class="at">{tr(t.name)} <em>{tr('占你 {p}% 的时间', { p: Math.round(t.share * 100) })}</em></div>
          <p>{tr(ADVICE[t.id])}</p>
        </div>
      </div>
    {/each}
    <div class="adv key">
      <span class="an">★</span>
      <div>
        <div class="at">{tr('核心观点')}</div>
        <p>{tr('AI 替代的是「任务」而不是「人」。把可自动化的部分交给 AI，把节省出的约 {h} 小时投入到更高价值的工作，正是劳动者在新质生产力中的「跃升」。', { h: tS.current.toFixed(0) })}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 18px;
  }
  .presets button {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 13px;
  }
  .presets button:hover {
    color: var(--text-1);
  }
  .presets button.on {
    color: #fff;
    border-color: transparent;
    background: var(--accent-grad);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 20px;
  }
  section {
    padding: 22px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    min-width: 0;
  }
  h2 {
    font-size: 18px;
    margin-bottom: 4px;
  }
  .sub {
    font-size: 12.5px;
    color: var(--text-3);
    margin-bottom: 14px;
  }
  .task {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
    margin-bottom: 12px;
  }
  .tn {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
  }
  .tn b {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .th {
    font-size: 11.5px;
    color: var(--text-3);
  }
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 6px;
    background: linear-gradient(90deg, var(--accent) var(--p), var(--surface-3) var(--p));
    outline: none;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--surface-1);
    border: 3px solid var(--accent);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.4);
  }
  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--surface-1);
    border: 3px solid var(--accent);
  }
  .hours {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: var(--text-2);
    margin-top: 8px;
  }
  .hours input {
    width: 70px;
    padding: 5px 8px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font: inherit;
  }
  .badge {
    margin: 12px 0 16px;
    padding: 16px 18px;
    border-radius: var(--radius-m);
    background: color-mix(in srgb, var(--c) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .bt {
    font-size: 26px;
    font-weight: 900;
    color: var(--c);
  }
  .bd {
    font-size: 13.5px;
    color: var(--text-2);
  }
  .kpis {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .kpi {
    padding: 14px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }
  .kpi span {
    display: block;
    font-size: 12px;
    color: var(--text-3);
  }
  .kpi b {
    font-size: 38px;
    font-weight: 900;
    line-height: 1.15;
  }
  .kpi em {
    font-style: normal;
    font-size: 13px;
    color: var(--text-2);
    margin-left: 4px;
  }
  .split {
    margin-top: 16px;
  }
  .sbar {
    display: flex;
    gap: 2px;
    height: 18px;
    border-radius: 5px;
    overflow: hidden;
  }
  .sbar div {
    flex-basis: 0;
    transition: flex-grow 0.3s;
  }
  .sleg {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-top: 8px;
    font-size: 12.5px;
    color: var(--text-2);
  }
  .sleg b {
    color: var(--text-1);
  }
  i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 3px;
    margin-right: 5px;
  }
  .note {
    margin: 14px 0 0;
    font-size: 11.5px;
    color: var(--text-3);
  }
  .charts {
    margin-top: 20px;
  }
  .tasks-card {
    margin-top: 20px;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .trow {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 12px;
  }
  .trow.en {
    grid-template-columns: 210px minmax(0, 1fr) 48px;
  }
  .tl {
    font-size: 13px;
    color: var(--text-2);
    text-align: right;
  }
  .tbar {
    display: flex;
    gap: 2px;
    height: 16px;
    border-radius: 4px;
    overflow: hidden;
    min-width: 2px;
    transition: width 0.4s ease;
  }
  .tbar div {
    flex-basis: 0;
  }
  .tv {
    font-size: 12.5px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .adv-h {
    margin: 32px 0 12px;
  }
  .advice {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .adv {
    display: flex;
    gap: 14px;
    padding: 16px 18px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
  }
  .adv.key {
    border-color: rgba(var(--accent-rgb), 0.5);
    background: var(--accent-wash);
  }
  .an {
    font-size: 22px;
    font-weight: 900;
    color: var(--accent);
    line-height: 1.2;
  }
  .at {
    font-weight: 800;
    margin-bottom: 4px;
  }
  .at em {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-3);
    margin-left: 6px;
  }
  .adv p {
    margin: 0;
    font-size: 13.5px;
    color: var(--text-2);
  }
  @media (max-width: 860px) {
    .layout,
    .advice {
      grid-template-columns: minmax(0, 1fr);
    }
    .trow {
      grid-template-columns: 96px minmax(0, 1fr) 40px;
    }
    .trow.en {
      grid-template-columns: 130px minmax(0, 1fr) 40px;
    }
  }
</style>
