<script>
  import { pal, slotColor } from '../stores/theme.svelte.js';
  import { scaleLinear, scaleLog, line, area, curveMonotoneX, bisector, range } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { scrollSteps } from '../actions/scrollSteps.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { WORLD_GDP_PC, REVOLUTIONS, AI_SCENARIO, STEPS } from '../../data/history.js';
  import { fmtInt } from '../utils/format.js';
  import { tr } from '../i18n/lang.svelte.js';

  /** 滚动叙事：世界人均 GDP 千年曲线 + 四次技术革命 */
  let step = $state(0);
  let useLog = $state(false);
  let width = $state(700);
  const height = 460;
  const m = { top: 28, right: 24, bottom: 34, left: 56 };

  const dom = new Tween(STEPS[0].domain, { duration: 1100, easing: cubicInOut });
  $effect(() => {
    dom.target = STEPS[step].domain;
  });

  const data = WORLD_GDP_PC.map(([year, v, est]) => ({ year, v, est: !!est }));
  const firstReal = data.findIndex((d) => !d.est);

  // AI 情景：基准 vs AI 提升（PwC 2030 年 +14%）
  const last = data[data.length - 1];
  const scen = range(AI_SCENARIO.from, AI_SCENARIO.to + 1).map((y) => {
    const t = (y - AI_SCENARIO.from) / (AI_SCENARIO.to - AI_SCENARIO.from);
    const base = last.v * (1 + AI_SCENARIO.baseGrowth) ** (y - AI_SCENARIO.from);
    return { year: y, base, ai: base * (1 + AI_SCENARIO.uplift2030 * t ** 1.6) };
  });

  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const x = $derived(scaleLinear().domain(dom.current).range([0, iw]));
  const yMax = $derived.by(() => {
    const [a, b] = dom.current;
    const vis = data.filter((d) => d.year >= a && d.year <= b);
    const mx = Math.max(...vis.map((d) => d.v), ...(b >= 2022 ? scen.map((d) => d.ai) : [0]));
    return mx * 1.08;
  });
  const y = $derived(
    useLog ? scaleLog().domain([300, 30000]).range([ih, 0]) : scaleLinear().domain([0, yMax]).range([ih, 0]).nice(),
  );

  const clipped = $derived(data.filter((d, i) => {
    const prev = data[i - 1];
    const next = data[i + 1];
    return (next ? next.year : d.year) >= dom.current[0] && (prev ? prev.year : d.year) <= dom.current[1];
  }));

  // 实线：MPD2023 实测序列；虚线：1820 年以前的早期估算
  const lineGen = $derived(
    line()
      .x((d) => x(d.year))
      .y((d) => y(d.v))
      .curve(curveMonotoneX),
  );
  const linePath = $derived(lineGen(clipped.filter((d) => !d.est)));
  const estPath = $derived(lineGen(clipped.filter((d, i) => d.est || d === data[firstReal])));
  const areaPath = $derived(
    area()
      .x((d) => x(d.year))
      .y0(ih)
      .y1((d) => y(d.v))
      .curve(curveMonotoneX)(clipped),
  );
  const scenBase = $derived(line().x((d) => x(d.year)).y((d) => y(d.base))(scen));
  const scenAI = $derived(line().x((d) => x(d.year)).y((d) => y(d.ai))(scen));
  const scenBand = $derived(
    area()
      .x((d) => x(d.year))
      .y0((d) => y(d.base))
      .y1((d) => y(d.ai))(scen),
  );

  const xTicks = $derived(x.ticks(width < 500 ? 4 : 8).filter((t) => t % 1 === 0));
  const yTicks = $derived(useLog ? [500, 1000, 2000, 5000, 10000, 20000] : y.ticks(5));

  const focus = $derived(STEPS[step].focus);

  // 悬停：最近年份
  let hover = $state.raw(null);
  const bis = bisector((d) => d.year).center;
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const yr = x.invert(e.clientX - r.left - m.left);
    const d = data[bis(data, yr)];
    if (!d || d.year < dom.current[0] || d.year > dom.current[1]) {
      hover = null;
      hideTip();
      return;
    }
    hover = d;
    const rev = REVOLUTIONS.find((rv) => d.year >= rv.start && d.year <= rv.end);
    showTip(e, {
      title: tr('{y} 年', { y: d.year }),
      rows: [{ label: tr('世界人均 GDP'), value: tr('{v} 国际元', { v: fmtInt(d.v) }), color: pal.accent }],
      note: d.est ? tr('早期估算（Maddison 2010 换算，示意）') : rev ? `${rev.icon} ${tr('{name}时期', { name: tr(rev.name) })}` : '',
    });
    moveTip(e);
  }
</script>

<div class="scrolly" use:scrollSteps={{ onStep: (i) => (step = i) }}>
  <div class="sticky">
    <div class="chart-card">
      <div class="chart-head">
        <div>
          <div class="ct">{tr('世界人均 GDP（2011 年国际元）')}</div>
          <div class="cs">{tr('公元 1000—2030 年 · 色带为技术革命时期 · 虚线：1820 年前为早期估算，2022 年后为情景推算')}</div>
        </div>
        <div class="seg" role="group" aria-label={tr('纵轴刻度')}>
          <button class:on={!useLog} onclick={() => (useLog = false)}>{tr('线性')}</button>
          <button class:on={useLog} onclick={() => (useLog = true)}>{tr('对数')}</button>
        </div>
      </div>
      <div class="plot" bind:clientWidth={width}>
        <svg {width} {height} role="img" aria-label={tr('世界人均 GDP 长期变化曲线')}>
          <defs>
            <linearGradient id="lr-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color={pal.accent} stop-opacity="0.28" />
              <stop offset="1" stop-color={pal.accent} stop-opacity="0" />
            </linearGradient>
            <clipPath id="lr-clip"><rect width={iw} height={ih + 2} y="-2" /></clipPath>
          </defs>
          <g transform="translate({m.left},{m.top})">
            {#each yTicks as t}
              <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
              <text class="tick-l" x="-8" y={y(t)} dy="0.32em" text-anchor="end">{fmtInt(t)}</text>
            {/each}

            <g clip-path="url(#lr-clip)">
              <!-- 技术革命色带 -->
              {#each REVOLUTIONS as rv}
                {@const x0 = x(rv.start)}
                {@const x1 = x(Math.min(rv.end, 2030))}
                <rect
                  class="band"
                  x={x0}
                  y="0"
                  width={Math.max(0, x1 - x0)}
                  height={ih}
                  fill={slotColor(rv.slot)}
                  opacity={focus === rv.id ? 0.2 : focus ? 0.05 : 0.08}
                />
                <line x1={x0} x2={x0} y1="0" y2={ih} stroke={slotColor(rv.slot)} stroke-opacity={focus === rv.id ? 0.7 : 0.18} />
              {/each}

              <path d={areaPath} fill="url(#lr-area)" />
              <path d={estPath} fill="none" stroke={pal.accent} stroke-width="2" stroke-dasharray="5 5" opacity="0.7" />
              <path d={linePath} fill="none" stroke={pal.accent} stroke-width="2.4" />

              {#if dom.current[1] >= 2022}
                <path d={scenBand} fill={pal.accent2} opacity={focus === 'ai' ? 0.3 : 0.12} />
                <path d={scenBase} fill="none" stroke={pal.text3} stroke-width="1.5" stroke-dasharray="4 4" />
                <path d={scenAI} fill="none" stroke={pal.accent2} stroke-width="2" stroke-dasharray="4 4" />
              {/if}

              {#if hover}
                <line x1={x(hover.year)} x2={x(hover.year)} y1="0" y2={ih} stroke={pal.text2} stroke-opacity="0.4" />
                <circle cx={x(hover.year)} cy={y(hover.v)} r="5" fill={pal.accent} stroke={pal.ring} stroke-width="2" />
              {/if}
            </g>

            <!-- 革命标签 -->
            {#each REVOLUTIONS as rv, i}
              {@const cx = (x(Math.max(rv.start, dom.current[0])) + x(Math.min(rv.end, 2030))) / 2}
              {@const bw = x(Math.min(rv.end, 2030)) - x(Math.max(rv.start, dom.current[0]))}
              {#if rv.end > dom.current[0] && cx > 10 && cx < iw - 10 && (bw > 46 || focus === rv.id)}
                <g transform="translate({cx},{12 + (i % 2) * 18})" class="rv-label" class:on={focus === rv.id}>
                  <text text-anchor="middle">{rv.icon} {tr(rv.name)}</text>
                </g>
              {/if}
            {/each}

            {#if focus === 'ai'}
              {@const e = scen[scen.length - 1]}
              <!-- 注释放在情景扇形左侧的空白处，颜色与对应线条一致 -->
              <text x={x(2021) - 6} y={y(e.ai)} dy="0.35em" text-anchor="end" class="anno">{tr('AI 情景：2030 年 +14% →')}</text>
              <text x={x(2021) - 6} y={y(e.base)} dy="0.35em" text-anchor="end" class="anno muted">{tr('基准情景 →')}</text>
            {/if}

            <!-- x 轴 -->
            <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
            {#each xTicks as t}
              <text class="tick-l" x={x(t)} y={ih + 20} text-anchor="middle">{t}</text>
            {/each}

            <rect
              width={iw}
              height={ih}
              fill="transparent"
              role="presentation"
              onpointermove={onMove}
              onpointerleave={() => {
                hover = null;
                hideTip();
              }}
            />
          </g>
        </svg>
      </div>
      <div class="progress" aria-hidden="true">
        {#each STEPS as s, i}
          <span class:on={i <= step}></span>
        {/each}
      </div>
    </div>
  </div>

  <div class="steps">
    {#each STEPS as s, i}
      <div class="step" class:on={step === i} data-step={i}>
        <div class="step-inner">
          <div class="sn">0{i + 1} / 0{STEPS.length}</div>
          <h4>{tr(s.title)}</h4>
          <p>{@html tr(s.text)}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .scrolly {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
    gap: 40px;
  }
  .sticky {
    position: sticky;
    top: 80px;
    align-self: start;
    height: fit-content;
  }
  .chart-card {
    padding: 20px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
  }
  .chart-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .ct {
    font-weight: 650;
  }
  .cs {
    font-size: 12.5px;
    color: var(--text-3);
  }
  svg {
    display: block;
    overflow: visible;
  }
  .tick-l {
    fill: var(--text-3);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .band {
    transition: opacity 0.6s;
  }
  .rv-label text {
    fill: var(--text-3);
    font-size: 12px;
    transition: fill 0.4s;
  }
  .rv-label.on text {
    fill: var(--text-1);
    font-weight: 700;
    font-size: 13px;
  }
  .anno {
    fill: var(--violet-text);
    font-size: 12.5px;
    font-weight: 600;
  }
  .anno.muted {
    fill: var(--text-3);
    font-weight: 400;
  }
  .progress {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }
  .progress span {
    flex: 1;
    height: 3px;
    border-radius: 3px;
    background: var(--surface-3);
    transition: background 0.4s;
  }
  .progress span.on {
    background: var(--accent);
  }
  .steps {
    padding: 20vh 0 30vh;
  }
  .step {
    min-height: 70vh;
    display: flex;
    align-items: center;
  }
  .step-inner {
    padding: 22px 24px;
    border-radius: var(--radius-l);
    background: var(--glass);
    border: 1px solid var(--border);
    opacity: 0.35;
    transform: scale(0.97);
    transition: opacity 0.5s, transform 0.5s, border-color 0.5s;
    backdrop-filter: blur(6px);
  }
  .step.on .step-inner {
    opacity: 1;
    transform: none;
    border-color: rgba(var(--accent-rgb), 0.35);
  }
  .sn {
    font-size: 12px;
    color: var(--accent);
    letter-spacing: 0.2em;
  }
  h4 {
    font-size: 21px;
    margin: 6px 0 10px;
  }
  p {
    color: var(--text-2);
    margin: 0;
    font-size: 15px;
  }
  p :global(b) {
    color: var(--text-1);
  }
  @media (max-width: 900px) {
    .scrolly {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .sticky {
      top: 60px;
      z-index: 1;
    }
    .steps {
      position: relative;
      z-index: 2;
      padding-top: 10vh;
    }
    .step {
      min-height: 80vh;
      align-items: flex-end;
    }
  }
</style>
