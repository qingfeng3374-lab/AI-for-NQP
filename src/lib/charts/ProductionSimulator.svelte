<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { scaleLinear, line, area, curveMonotoneX, range } from 'd3';
  import { SIM_DEFAULTS } from '../../data/efficiency.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /**
   * 生产函数模拟器（增长核算）
   * Y = A · K^α · L^(1-α)
   * AI 通过三条渠道作用于 TFP（A）：渗透率 × 潜在增益 × 人机协同实现度
   */
  let penetration = $state(70); // 2035 年 AI 渗透率 %
  let gainPP = $state(1.5); // 完全渗透时 TFP 额外年增速（百分点）
  let skill = $state(60); // 劳动者技能 / 人机协同程度 %
  let capital = $state(4.0); // 资本（含算力、数据基础设施）年增速 %

  const { alpha, baseTFP, laborGrowth, years } = SIM_DEFAULTS;
  const T = years[1] - years[0];

  // 采纳曲线：前快后慢的饱和增长
  const adopt = (t, P) => (P * (1 - Math.exp(-0.35 * t))) / (1 - Math.exp(-0.35 * T));

  const sim = $derived.by(() => {
    const P = penetration / 100;
    const realize = 0.4 + 0.6 * (skill / 100); // 技能越高，AI 增益兑现度越高（互补性）
    const gK = capital / 100;
    let yb = 100;
    let ya = 100;
    let lnA = 0;
    let lnAai = 0;
    let lnK = 0;
    let lnL = 0;
    const rows = [{ year: years[0], base: 100, ai: 100, gA: baseTFP }];
    for (let t = 1; t <= T; t++) {
      const gAI = adopt(t, P) * (gainPP / 100) * realize;
      const factor = (1 + gK) ** alpha * (1 + laborGrowth) ** (1 - alpha);
      yb *= (1 + baseTFP) * factor;
      ya *= (1 + baseTFP + gAI) * factor;
      lnA += Math.log(1 + baseTFP);
      lnAai += Math.log(1 + baseTFP + gAI) - Math.log(1 + baseTFP);
      lnK += alpha * Math.log(1 + gK);
      lnL += (1 - alpha) * Math.log(1 + laborGrowth);
      rows.push({ year: years[0] + t, base: yb, ai: ya, gA: baseTFP + gAI });
    }
    const total = lnA + lnAai + lnK + lnL;
    return {
      rows,
      end: rows[rows.length - 1],
      cagrBase: (yb / 100) ** (1 / T) - 1,
      cagrAI: (ya / 100) ** (1 / T) - 1,
      decomp: [
        { key: '资本深化', v: lnK, color: pal.series[6] },
        { key: '劳动投入', v: lnL, color: pal.series[4] },
        { key: '基础 TFP', v: lnA, color: pal.series[2] },
        { key: 'AI 带来的 TFP', v: lnAai, color: pal.accent },
      ],
      total,
      tfpShare: (lnA + lnAai) / total,
    };
  });

  let width = $state(520);
  const height = 300;
  const m = { top: 20, right: 64, bottom: 28, left: 44 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const x = $derived(scaleLinear().domain(years).range([0, iw]));
  const y = $derived(
    scaleLinear()
      .domain([95, Math.max(135, sim.end.ai * 1.06)])
      .range([ih, 0]),
  );
  const pBase = $derived(line().x((d) => x(d.year)).y((d) => y(d.base)).curve(curveMonotoneX)(sim.rows));
  const pAI = $derived(line().x((d) => x(d.year)).y((d) => y(d.ai)).curve(curveMonotoneX)(sim.rows));
  const pGap = $derived(
    area()
      .x((d) => x(d.year))
      .y0((d) => y(d.base))
      .y1((d) => y(d.ai))
      .curve(curveMonotoneX)(sim.rows),
  );

  // 增长分解条（对数增长贡献，可为负）
  const posTotal = $derived(sim.decomp.filter((d) => d.v > 0).reduce((s, d) => s + d.v, 0));

  let hoverYear = $state(null);
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const yr = Math.round(x.invert(e.clientX - r.left));
    const d = sim.rows.find((row) => row.year === yr);
    if (!d) return;
    hoverYear = yr;
    showTip(e, {
      title: tr('{y} 年 · 产出指数（2025 = 100）', { y: yr }),
      rows: [
        { label: tr('AI 赋能情景'), value: d.ai.toFixed(1), color: pal.accent },
        { label: tr('基准情景'), value: d.base.toFixed(1), color: pal.text3 },
        { label: tr('当年 TFP 增速'), value: `${(d.gA * 100).toFixed(2)}%` },
      ],
      note: tr('AI 红利：+{v} 点', { v: (d.ai - d.base).toFixed(1) }),
    });
    moveTip(e);
  }
</script>

<div class="sim">
  <div class="controls">
    <label>
      <span class="lab">{tr('2035 年 AI 渗透率')} <b>{penetration}%</b></span>
      <input type="range" min="0" max="100" step="5" bind:value={penetration} />
      <span class="desc">{tr('企业与行业中 AI 的应用覆盖程度（"人工智能+"行动目标：2030 年智能体等应用普及率超 90%）')}</span>
    </label>
    <label>
      <span class="lab">{tr('完全渗透时的 TFP 增益')} <b>{tr('{v} 个百分点 / 年', { v: gainPP.toFixed(1) })}</b></span>
      <input type="range" min="0.2" max="3.4" step="0.1" bind:value={gainPP} />
      <span class="desc">{tr('麦肯锡估计：生成式 AI 与其他自动化技术合计可带来 0.5–3.4 个百分点的年生产率增长')}</span>
    </label>
    <label>
      <span class="lab">{tr('劳动者技能 / 人机协同')} <b>{skill}%</b></span>
      <input type="range" min="0" max="100" step="5" bind:value={skill} />
      <span class="desc">{tr('技能与 AI 互补：协同程度越高，AI 增益兑现越充分（兑现度 40%–100%）')}</span>
    </label>
    <label>
      <span class="lab">{tr('资本（含算力 / 数据基础设施）年增速')} <b>{capital.toFixed(1)}%</b></span>
      <input type="range" min="1" max="8" step="0.5" bind:value={capital} />
      <span class="desc">{tr('劳动力年增速固定为 −0.3%（人口老龄化），资本产出弹性 α = 0.4')}</span>
    </label>
  </div>

  <div class="out">
    <div class="kpis">
      <div class="kpi">
        <div class="kl">{tr('2035 年产出指数')}</div>
        <div class="kv"><span class="ai">{sim.end.ai.toFixed(0)}</span> <span class="vs">{tr('vs 基准 {v}', { v: sim.end.base.toFixed(0) })}</span></div>
      </div>
      <div class="kpi">
        <div class="kl">{tr('年均增速')}</div>
        <div class="kv"><span class="ai">{(sim.cagrAI * 100).toFixed(2)}%</span> <span class="vs">vs {(sim.cagrBase * 100).toFixed(2)}%</span></div>
      </div>
      <div class="kpi">
        <div class="kl">{tr('TFP 对增长的贡献')}</div>
        <div class="kv"><span class="ai">{(sim.tfpShare * 100).toFixed(0)}%</span></div>
      </div>
    </div>

    <div bind:clientWidth={width}>
      <svg {width} {height} role="img" aria-label={tr('产出指数情景对比')}>
        <g transform="translate({m.left},{m.top})">
          {#each y.ticks(5) as t}
            <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
            <text class="tk" x="-8" y={y(t)} dy="0.32em" text-anchor="end">{t}</text>
          {/each}
          {#each range(years[0], years[1] + 1, 2) as t}
            <text class="tk" x={x(t)} y={ih + 18} text-anchor="middle">{t}</text>
          {/each}
          <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
          <path d={pGap} fill={pal.accent} opacity="0.16" />
          <path d={pBase} fill="none" stroke={pal.text3} stroke-width="2" />
          <path d={pAI} fill="none" stroke={pal.accent} stroke-width="2.5" />
          <text x={iw + 6} y={y(sim.end.ai)} dy="0.35em" class="end ai-t">{tr('AI 赋能')}</text>
          <text x={iw + 6} y={y(sim.end.base)} dy="0.35em" class="end">{tr('基准')}</text>
          {#if sim.end.ai - sim.end.base > 6}
            <text x={x(2033)} y={(y(sim.rows[8].ai) + y(sim.rows[8].base)) / 2} dy="0.35em" text-anchor="middle" class="gap-t">{tr('AI 红利')}</text>
          {/if}
          {#if hoverYear}
            <line x1={x(hoverYear)} x2={x(hoverYear)} y1="0" y2={ih} stroke={pal.text2} stroke-opacity="0.35" />
          {/if}
          <rect
            width={iw}
            height={ih}
            fill="transparent"
            role="presentation"
            onpointermove={onMove}
            onpointerleave={() => {
              hoverYear = null;
              hideTip();
            }}
          />
        </g>
      </svg>
    </div>

    <div class="decomp">
      <div class="dt">{tr('2025—2035 年产出增长来源分解')}</div>
      <div class="dbar">
        {#each sim.decomp.filter((d) => d.v > 0) as d}
          <div class="dseg" style:flex-grow={d.v / posTotal} style:background={d.color} title="{tr(d.key)} {((d.v / sim.total) * 100).toFixed(0)}%"></div>
        {/each}
      </div>
      <div class="dleg">
        {#each sim.decomp as d}
          <span><i style:background={d.color}></i>{tr(d.key)} <b>{((d.v / sim.total) * 100).toFixed(0)}%</b></span>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .sim {
    display: grid;
    grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.6fr);
    gap: 28px;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .lab {
    font-size: 13.5px;
    color: var(--text-2);
  }
  .lab b {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .desc {
    font-size: 11.5px;
    color: var(--text-3);
    line-height: 1.5;
  }
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background: var(--surface-3);
    outline: none;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    border: 3px solid var(--halo);
    box-shadow: 0 0 0 1px var(--accent), 0 0 12px rgba(var(--accent-rgb), 0.6);
    cursor: pointer;
  }
  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    border: 3px solid var(--halo);
    cursor: pointer;
  }
  .out {
    min-width: 0;
  }
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
  }
  .kpi {
    padding: 10px 12px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }
  .kl {
    font-size: 12px;
    color: var(--text-3);
  }
  .kv {
    font-size: 13px;
    color: var(--text-3);
  }
  .kv .ai {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-1);
  }
  .vs {
    white-space: nowrap;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .end {
    fill: var(--text-3);
    font-size: 12px;
  }
  .end.ai-t {
    fill: var(--accent);
    font-weight: 700;
  }
  .gap-t {
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 600;
  }
  .decomp {
    margin-top: 8px;
  }
  .dt {
    font-size: 12.5px;
    color: var(--text-2);
    margin-bottom: 6px;
  }
  .dbar {
    display: flex;
    gap: 2px;
    height: 14px;
    border-radius: 4px;
    overflow: hidden;
  }
  .dseg {
    flex-basis: 0;
    transition: flex-grow 0.4s ease;
  }
  .dleg {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-2);
  }
  .dleg i {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 2px;
    margin-right: 5px;
  }
  .dleg b {
    color: var(--text-1);
  }
  @media (max-width: 860px) {
    .sim {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
