<script>
  import { scaleLinear, scalePoint, line, curveMonotoneX } from 'd3';
  import { pal } from '../stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr, loc } from '../i18n/lang.svelte.js';

  /**
   * 通用折线图（单 y 轴）
   * series = [{ name, color, points: [{ x: string, y: number }] }]，x 为类别（年份字符串）
   * baseline：可选的参考水平线（如指数 100）
   */
  let { series = [], height = 300, fmt = (v) => v.toLocaleString(loc()), baseline = null, unit = '', ariaLabel = '' } = $props();

  let width = $state(560);
  const m = { top: 20, right: 90, bottom: 30, left: 56 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = $derived(height - m.top - m.bottom);
  const xs = $derived([...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort((a, b) => parseFloat(a) - parseFloat(b)));
  const x = $derived(scalePoint().domain(xs).range([0, iw]).padding(0.3));
  const y = $derived.by(() => {
    const vs = series.flatMap((s) => s.points.map((p) => p.y));
    if (baseline !== null) vs.push(baseline);
    const lo = Math.min(...vs);
    const hi = Math.max(...vs);
    return scaleLinear()
      .domain([Math.min(0, lo), hi * 1.08])
      .range([ih, 0])
      .nice();
  });
  const gen = $derived(
    line()
      .x((p) => x(p.x))
      .y((p) => y(p.y))
      .curve(curveMonotoneX),
  );
  const step = $derived(Math.max(1, Math.ceil(xs.length / Math.max(2, Math.floor(iw / 56)))));

  let hoverX = $state(null);
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    let best = xs[0];
    for (const v of xs) if (Math.abs(x(v) - px) < Math.abs(x(best) - px)) best = v;
    hoverX = best;
    showTip(e, {
      title: best,
      rows: series
        .map((s) => ({ s, p: s.points.find((p) => p.x === best) }))
        .filter((d) => d.p)
        .map((d) => ({ label: d.s.name, value: `${fmt(d.p.y)}${unit ? ' ' + unit : ''}`, color: d.s.color })),
    });
    moveTip(e);
  }
</script>

<div bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    <g transform="translate({m.left},{m.top})">
      {#each y.ticks(5) as t}
        <line x1="0" x2={iw} y1={y(t)} y2={y(t)} stroke={pal.grid} />
        <text x="-8" y={y(t)} dy="0.32em" text-anchor="end" class="tk">{fmt(t)}</text>
      {/each}
      {#if baseline !== null}
        <line x1="0" x2={iw} y1={y(baseline)} y2={y(baseline)} stroke={pal.text3} stroke-dasharray="4 4" />
        <text x={iw + 6} y={y(baseline)} dy="0.32em" class="tk">{tr('基期 {v}', { v: baseline })}</text>
      {/if}
      <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
      {#each xs as v, i}
        {#if i % step === 0 || i === xs.length - 1}
          <text x={x(v)} y={ih + 18} text-anchor="middle" class="tk">{v}</text>
        {/if}
      {/each}
      {#if hoverX}
        <line x1={x(hoverX)} x2={x(hoverX)} y1="0" y2={ih} stroke={pal.text3} stroke-opacity="0.5" />
      {/if}
      {#each series as s}
        {@const last = s.points[s.points.length - 1]}
        <path d={gen(s.points)} fill="none" stroke={s.color} stroke-width="2.4" class="ln" />
        {#each s.points as p}
          <circle cx={x(p.x)} cy={y(p.y)} r={hoverX === p.x ? 5.5 : 3.5} fill={s.color} stroke={pal.ring} stroke-width="1.5" />
        {/each}
        {#if last}
          <text x={x(last.x) + 10} y={y(last.y)} dy="0.35em" class="end">{fmt(last.y)}</text>
        {/if}
      {/each}
      <rect width={iw} height={ih} fill="transparent" role="presentation" onpointermove={onMove} onpointerleave={() => ((hoverX = null), hideTip())} />
    </g>
  </svg>
</div>

<style>
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
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 800;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
</style>
