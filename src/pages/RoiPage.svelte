<script>
  import { scaleLinear, area, line, format } from 'd3';
  import PageHeader from '../lib/components/PageHeader.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import Waterfall from '../lib/charts/Waterfall.svelte';
  import SensitivityHeatmap from '../lib/charts/SensitivityHeatmap.svelte';
  import { INDUSTRIES, SCENARIOS, computeROI, cumulative } from '../data/roi.js';
  import { pal } from '../lib/stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../lib/stores/tooltip.svelte.js';
  import { tr, isEn, loc } from '../lib/i18n/lang.svelte.js';

  // ---- 参数 ----
  let industry = $state('fin');
  let logEmp = $state(Math.log10(500));
  let salary = $state(20);
  let knowledge = $state(80);
  let applicable = $state(65);
  let adoption = $state(60);
  let gain = $state(26);
  let seatCost = $state(150);
  let oneOff = $state(40);

  const employees = $derived(Math.round(10 ** logEmp / (10 ** logEmp > 1000 ? 100 : 10)) * (10 ** logEmp > 1000 ? 100 : 10));
  function loadIndustry(id) {
    industry = id;
    const d = INDUSTRIES.find((x) => x.id === id);
    salary = d.salary;
    knowledge = d.knowledge;
    applicable = d.applicable;
  }
  const params = $derived({ employees, salary, knowledge, applicable, adoption, gain, seatCost, oneOff });
  const r = $derived(computeROI(params));
  const curve = $derived(cumulative(params));
  const breakEven = $derived(curve.find((p) => p.m > 0 && p.v >= 0)?.m ?? null);

  // 英文模式：以元为单位，K / M / B 缩写（输入值 v 的单位为万元）
  const fmt3 = format('.3~s');
  const shortEn = (yuan) => (Math.abs(yuan) < 1000 ? `${Math.round(yuan)}` : fmt3(yuan).replace('k', 'K').replace('G', 'B'));
  const fmtW = (v) =>
    isEn()
      ? `RMB ${shortEn(v * 10000)}`
      : Math.abs(v) >= 10000
        ? `${(v / 10000).toFixed(2)} 亿`
        : `${v.toFixed(Math.abs(v) < 100 ? 1 : 0)} 万`;
  // 表格中的万元数值
  const fmtT = (v) => (isEn() ? shortEn(v * 10000) : v.toFixed(1));

  // ---- 累计净收益曲线 ----
  let cw = $state(520);
  const ch = 260;
  const cm = { top: 18, right: 16, bottom: 30, left: 56 };
  const ciw = $derived(Math.max(10, cw - cm.left - cm.right));
  const cih = ch - cm.top - cm.bottom;
  const cx = $derived(scaleLinear().domain([0, 36]).range([0, ciw]));
  const cy = $derived.by(() => {
    const vs = curve.map((p) => p.v);
    return scaleLinear()
      .domain([Math.min(0, ...vs) * 1.1, Math.max(1, ...vs) * 1.1])
      .range([cih, 0])
      .nice();
  });
  const cArea = $derived(
    area()
      .x((d) => cx(d.m))
      .y0(cy(0))
      .y1((d) => cy(d.v))(curve),
  );
  const cLine = $derived(
    line()
      .x((d) => cx(d.m))
      .y((d) => cy(d.v))(curve),
  );

  // ---- 敏感性：采用率 × 效率提升 → 首年 ROI ----
  const XS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const YS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const heatValue = (a, g) => computeROI({ ...params, adoption: a, gain: g }).roi1;

  // ---- 单位图：100 个小人 = 全体员工 ----
  const covered = $derived(Math.round(adoption));
  const extra = $derived(Math.min(60, Math.round((r.fte / employees) * 100)));
</script>

<PageHeader
  kicker="Enterprise ROI"
  title={tr('效益测算：AI 能为企业创造多少价值？')}
  lead={tr('新质生产力最终要体现在<b>企业的全要素生产率</b>上。输入企业的基本情况，用来自随机对照实验的效率提升证据，测算 AI 带来的<b>年度效率红利、投资回报与回收期</b>。')}
/>

<div class="container">
  <div class="layout">
    <section class="inputs">
      <h2>{tr('企业参数')}</h2>
      <div class="ind" role="group" aria-label={tr('行业')}>
        {#each INDUSTRIES as d}
          <button class:on={industry === d.id} onclick={() => loadIndustry(d.id)}>{tr(d.name)}</button>
        {/each}
      </div>

      <label><span>{@html tr('员工人数 <b>{n}</b> 人', { n: employees.toLocaleString(loc()) })}</span>
        <input type="range" min="1" max="4.3" step="0.01" bind:value={logEmp} style:--p="{((logEmp - 1) / 3.3) * 100}%" /></label>
      <label><span>{@html tr('人均年薪 <b>{x}</b> 万元', { x: isEn() ? salary * 10 : salary })}</span>
        <input type="range" min="5" max="60" step="1" bind:value={salary} style:--p="{((salary - 5) / 55) * 100}%" /></label>
      <label><span>{@html tr('知识型工作占比 <b>{p}%</b>', { p: knowledge })}</span>
        <input type="range" min="5" max="95" step="5" bind:value={knowledge} style:--p="{((knowledge - 5) / 90) * 100}%" /></label>
      <label><span>{@html tr('其中 AI 可覆盖的比例 <b>{p}%</b>', { p: applicable })}</span>
        <input type="range" min="10" max="90" step="5" bind:value={applicable} style:--p="{((applicable - 10) / 80) * 100}%" /></label>
      <label><span>{@html tr('员工 AI 采用率 <b>{p}%</b>', { p: adoption })}</span>
        <input type="range" min="10" max="100" step="5" bind:value={adoption} style:--p="{((adoption - 10) / 90) * 100}%" /></label>

      <div class="scen">
        <span class="lbl">{@html tr('效率提升情景 <b>{p}%</b>', { p: gain })}</span>
        <div class="seg">
          {#each SCENARIOS as s}
            <button class:on={gain === s.gain} onclick={() => (gain = s.gain)} title={tr(s.ref)}>{tr(s.name)} {s.gain}%</button>
          {/each}
        </div>
        <input type="range" min="5" max="50" step="1" bind:value={gain} style:--p="{((gain - 5) / 45) * 100}%" aria-label={tr('自定义效率提升')} />
        <span class="ref">{tr(SCENARIOS.find((s) => s.gain === gain)?.ref ?? '自定义情景')}</span>
      </div>

      <div class="costs">
        <label class="num"><span>{tr('AI 工具费用')}</span><input type="number" min="0" max="2000" step="10" bind:value={seatCost} /><em>{tr('元/人/月')}</em></label>
        <label class="num"><span>{tr('实施与培训')}</span><input type="number" min="0" max="10000" step="5" bind:value={oneOff} /><em>{tr('万元（一次性）')}{#if isEn()} (= {fmtW(oneOff)}){/if}</em></label>
      </div>
    </section>

    <section class="outputs">
      <div class="kpis">
        <div class="kpi big">
          <span>{tr('年度效率价值')}</span>
          <b class="grad-text">{fmtW(r.value)}</b>{#if !isEn()}<em>{tr('元')}</em>{/if}
        </div>
        <div class="kpi">
          <span>{tr('等效新增人力')}</span>
          <b>{r.fte.toFixed(r.fte < 10 ? 1 : 0)}</b><em>{isEn() ? 'FTE' : '人'}</em>
        </div>
        <div class="kpi">
          <span>{tr('年释放工时')}</span>
          <b>{isEn() ? shortEn(r.hours) : (r.hours / 10000).toFixed(r.hours < 100000 ? 2 : 1)}</b><em>{isEn() ? 'hours' : '万小时'}</em>
        </div>
        <div class="kpi" class:neg={r.roi1 < 0}>
          <span>{tr('首年投资回报率')}</span>
          <b>{r.roi1 >= 0 ? '+' : ''}{Math.round(r.roi1 * 100)}%</b>
        </div>
        <div class="kpi" class:neg={!isFinite(r.payback)}>
          <span>{tr('静态回收期')}</span>
          <b>{isFinite(r.payback) ? r.payback.toFixed(1) : '—'}</b><em>{tr(isFinite(r.payback) ? '个月' : '无法回收')}</em>
        </div>
      </div>

      <div class="people">
        <div class="ph">
          <span>{tr('员工（每个小人 = 1%）·')} <b style:color={pal.accent}>{covered}%</b> {tr('使用 AI')}</span>
          <span>＋ <b style:color={pal.series[3]}>{extra}</b> {tr('个「等效新增人力」')}</span>
        </div>
        <div class="icons" aria-label={tr('员工覆盖与等效新增人力单位图')}>
          {#each Array(100) as _, i}
            <svg viewBox="0 0 12 16" class="p" class:on={i < covered}><circle cx="6" cy="3.5" r="3" /><path d="M1 16v-4.5a5 5 0 0 1 10 0V16z" /></svg>
          {/each}
          {#each Array(extra) as _, i}
            <svg viewBox="0 0 12 16" class="p extra" style:animation-delay="{i * 20}ms"
              ><circle cx="6" cy="3.5" r="3" /><path d="M1 16v-4.5a5 5 0 0 1 10 0V16z" /></svg
            >
          {/each}
        </div>
        <p class="pn">{@html tr('AI 并不直接"增加"员工，而是让现有员工在同样时间内完成更多工作——这正是<b>全要素生产率</b>提升的含义。')}</p>
      </div>
    </section>
  </div>

  <div class="grid-2 charts">
    <ChartCard
      title={tr('首年收益瀑布')}
      subtitle={tr('效率价值减去工具订阅与一次性实施成本，得到首年净收益（万元）')}
      table={{
        columns: [tr('项目'), tr('金额（万元）')],
        rows: [
          [tr('年度效率价值'), fmtT(r.value)],
          [tr('AI 工具费用'), fmtT(-r.toolCost)],
          [tr('实施与培训'), fmtT(-r.oneOff)],
          [tr('首年净收益'), fmtT(r.net1)],
        ],
      }}
    >
      <Waterfall
        steps={[
          { label: tr('效率价值'), value: r.value, type: 'pos', note: tr('释放的工时 × 人工成本') },
          { label: tr('工具费用'), value: -r.toolCost, type: 'neg', note: tr('按使用人数订阅') },
          { label: tr('实施培训'), value: -r.oneOff, type: 'neg', note: tr('一次性投入') },
          { label: tr('首年净收益'), value: r.net1, type: 'total' },
        ]}
        unit={isEn() ? 'RMB' : '万元'}
        fmt={(v) => (isEn() ? shortEn(v * 10000) : Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))}
      />
    </ChartCard>

    <ChartCard
      title={tr('36 个月累计净收益')}
      subtitle={tr('考虑学习曲线：前 12 个月实际效果从 30% 逐步爬升到 100%')}
      table={{ columns: [tr('月份'), tr('累计净收益（万元）')], rows: curve.filter((p) => p.m % 3 === 0).map((p) => [p.m, fmtT(p.v)]) }}
    >
      <div bind:clientWidth={cw}>
        <svg width={cw} height={ch} role="img" aria-label={tr('累计净收益曲线')}>
          <defs>
            <clipPath id="roi-pos"><rect x="0" y="0" width={ciw} height={cy(0)} /></clipPath>
            <clipPath id="roi-neg"><rect x="0" y={cy(0)} width={ciw} height={cih - cy(0)} /></clipPath>
          </defs>
          <g transform="translate({cm.left},{cm.top})">
            {#each cy.ticks(4) as t}
              <line x1="0" x2={ciw} y1={cy(t)} y2={cy(t)} stroke={pal.grid} />
              <text x="-8" y={cy(t)} dy="0.32em" text-anchor="end" class="tk">{isEn() ? shortEn(t * 10000) : Math.abs(t) >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</text>
            {/each}
            {#each [0, 6, 12, 18, 24, 30, 36] as t}
              <text x={cx(t)} y={cih + 18} text-anchor="middle" class="tk">{tr('{m}月', { m: t })}</text>
            {/each}
            <path d={cArea} fill={pal.div.pos} opacity="0.22" clip-path="url(#roi-pos)" />
            <path d={cArea} fill={pal.div.neg} opacity="0.22" clip-path="url(#roi-neg)" />
            <line x1="0" x2={ciw} y1={cy(0)} y2={cy(0)} stroke={pal.axis} stroke-width="1.5" />
            <path d={cLine} fill="none" stroke={pal.accent} stroke-width="2.5" />
            {#if breakEven}
              <line x1={cx(breakEven)} x2={cx(breakEven)} y1="0" y2={cih} stroke={pal.text3} stroke-dasharray="4 4" />
              <circle cx={cx(breakEven)} cy={cy(curve[breakEven].v)} r="6" fill={pal.accent} stroke={pal.ring} stroke-width="2" />
              <text x={cx(breakEven) + 8} y="12" class="be">{tr('第 {m} 个月回本', { m: breakEven })}</text>
            {:else}
              <text x={ciw} y="12" text-anchor="end" class="be neg">{tr('36 个月内无法回本')}</text>
            {/if}
            <text x={ciw} y={cy(curve[36].v) - 10} text-anchor="end" class="endv">{fmtW(curve[36].v)}</text>
            <rect
              width={ciw}
              height={cih}
              fill="transparent"
              role="presentation"
              onpointermove={(e) => {
                const rr = e.currentTarget.getBoundingClientRect();
                const mm = Math.max(0, Math.min(36, Math.round(cx.invert(e.clientX - rr.left))));
                showTip(e, { title: tr('第 {m} 个月', { m: mm }), rows: [{ label: tr('累计净收益'), value: isEn() ? fmtW(curve[mm].v) : `${curve[mm].v.toFixed(1)} 万元`, color: curve[mm].v >= 0 ? pal.div.pos : pal.div.neg }] });
                moveTip(e);
              }}
              onpointerleave={hideTip}
            />
          </g>
        </svg>
      </div>
    </ChartCard>

    <ChartCard
      span={2}
      title={tr('敏感性分析：采用率 × 效率提升 → 首年投资回报率')}
      subtitle={tr('其余参数保持当前设置。粗框为当前方案；点击任意格子即可应用该组参数。可以看到：「用得上、用得好」比「买了工具」更重要')}
      source={tr("模型：作者构建；效率提升区间参考 Brynjolfsson 等（2023）、Cui 等（2024）、Dell'Acqua 等（2023）")}
    >
      <SensitivityHeatmap
        xs={XS}
        ys={YS}
        value={heatValue}
        current={{ x: adoption, y: gain }}
        xLabel={tr('员工 AI 采用率')}
        yLabel={tr('效率提升')}
        fmtX={(v) => `${v}%`}
        fmtY={(v) => `${v}%`}
        fmtV={(v) => `${Math.round(v * 100)}%`}
        onPick={(a, g) => ((adoption = a), (gain = g))}
      />
    </ChartCard>
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.1fr);
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
    margin-bottom: 12px;
  }
  .ind {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .ind button {
    padding: 4px 11px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 12.5px;
  }
  .ind button.on {
    color: #fff;
    border-color: transparent;
    background: var(--accent-grad);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
    font-size: 13.5px;
    color: var(--text-2);
  }
  label :global(b),
  .lbl :global(b) {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
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
  .scen {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 14px;
    font-size: 13.5px;
    color: var(--text-2);
  }
  .ref {
    font-size: 11.5px;
    color: var(--text-3);
  }
  .costs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .num input {
    width: 100%;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font: inherit;
  }
  .num em {
    font-style: normal;
    font-size: 11.5px;
    color: var(--text-3);
  }
  .outputs {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .kpis {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .kpi {
    padding: 12px 14px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }
  .kpi.big {
    grid-column: span 2;
    background: var(--accent-wash);
    border-color: rgba(var(--accent-rgb), 0.35);
  }
  .kpi span {
    display: block;
    font-size: 12px;
    color: var(--text-3);
  }
  .kpi b {
    font-size: 28px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }
  .kpi.big b {
    font-size: 46px;
    line-height: 1.1;
  }
  .kpi em {
    font-style: normal;
    font-size: 13px;
    color: var(--text-2);
    margin-left: 4px;
  }
  .kpi.neg b {
    color: var(--warn-text);
  }
  .ph {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 12.5px;
    color: var(--text-2);
    margin-bottom: 8px;
  }
  .icons {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .p {
    width: 12px;
    height: 16px;
    fill: var(--muted-mark);
    transition: fill 0.3s;
  }
  .p.on {
    fill: var(--accent);
  }
  .p.extra {
    fill: none;
    stroke: var(--series-4);
    stroke-width: 1.3;
    animation: pop 0.4s ease both;
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.4);
    }
  }
  .pn {
    margin: 10px 0 0;
    font-size: 12.5px;
    color: var(--text-3);
  }
  .pn :global(b) {
    color: var(--text-1);
  }
  .charts {
    margin-top: 20px;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .be {
    fill: var(--accent);
    font-size: 12.5px;
    font-weight: 700;
  }
  .be.neg {
    fill: var(--warn-text);
  }
  .endv {
    fill: var(--text-1);
    font-size: 12.5px;
    font-weight: 800;
  }
  svg {
    display: block;
    overflow: visible;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
