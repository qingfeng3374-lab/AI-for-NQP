<script>
  import { pal, slotColor } from '../stores/theme.svelte.js';
  import { scaleLinear, scaleLog, Delaunay } from 'd3';
  import { MODELS, REGIONS } from '../../data/engine.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { fmtSci, fmtPow10 } from '../utils/format.js';
  import { tr } from '../i18n/lang.svelte.js';

  /** 训练算力散点（对数轴）+ 实时回归：每年增长倍数 */
  let width = $state(640);
  const height = 400;
  const m = { top: 20, right: 20, bottom: 34, left: 52 };

  let enabled = $state(Object.fromEntries(REGIONS.map((r) => [r.id, true])));
  let hovered = $state.raw(null);

  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const x = $derived(scaleLinear().domain([2012, 2026.6]).range([0, iw]));
  const y = $derived(scaleLog().domain([1e17, 1e27]).range([ih, 0]));
  const color = $derived(Object.fromEntries(REGIONS.map((r) => [r.id, slotColor(r.slot)])));

  const visible = $derived(MODELS.filter((d) => enabled[d.region]));

  // 最小二乘回归：log10(FLOP) ~ year
  const fit = $derived.by(() => {
    const pts = visible;
    if (pts.length < 3) return null;
    const n = pts.length;
    const mx = pts.reduce((s, d) => s + d.date, 0) / n;
    const my = pts.reduce((s, d) => s + Math.log10(d.flop), 0) / n;
    let num = 0;
    let den = 0;
    for (const d of pts) {
      num += (d.date - mx) * (Math.log10(d.flop) - my);
      den += (d.date - mx) ** 2;
    }
    const slope = num / den;
    const b = my - slope * mx;
    const f = (t) => 10 ** (b + slope * t);
    return {
      perYear: 10 ** slope,
      doubling: (Math.log10(2) / slope) * 12,
      x0: 2012,
      y0: f(2012),
      x1: 2026.6,
      y1: f(2026.6),
    };
  });

  const delaunay = $derived(Delaunay.from(visible, (d) => x(d.date), (d) => y(d.flop)));

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const i = delaunay.find(px, py);
    const d = visible[i];
    if (!d) return;
    const dist = Math.hypot(x(d.date) - px, y(d.flop) - py);
    if (dist > 40) {
      hovered = null;
      hideTip();
      return;
    }
    hovered = d;
    showTip(e, {
      title: d.name,
      rows: [
        { label: tr('训练算力'), value: `${fmtSci(d.flop)} FLOP`, color: color[d.region] },
        { label: tr('机构'), value: tr(d.org) },
        { label: tr('发布时间'), value: tr('{y} 年', { y: Math.floor(d.date) }) },
      ],
    });
    moveTip(e);
  }

  const yTicks = [17, 19, 21, 23, 25, 27];
</script>

<div class="toolbar">
  {#each REGIONS as r}
    <button
      class="chip"
      class:off={!enabled[r.id]}
      style:--c={slotColor(r.slot)}
      aria-pressed={enabled[r.id]}
      onclick={() => (enabled[r.id] = !enabled[r.id])}
    >
      <span class="dot"></span>{tr(r.name)}
    </button>
  {/each}
  {#if fit}
    <span class="fit">
      {@html tr('回归斜率：约 <b>{x} 倍 / 年</b> · 每 <b>{m}</b> 个月翻一番', {
        x: fit.perYear.toFixed(1),
        m: fit.doubling.toFixed(1),
      })}
    </span>
  {/if}
</div>

<div class="plot" bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={tr('代表性 AI 模型训练算力随时间变化散点图')}>
    <g transform="translate({m.left},{m.top})">
      {#each yTicks as e}
        <line class="gridline" x1="0" x2={iw} y1={y(10 ** e)} y2={y(10 ** e)} />
        <text class="tk" x="-8" y={y(10 ** e)} dy="0.32em" text-anchor="end">{fmtPow10(e)}</text>
      {/each}
      {#each [2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026] as t}
        <text class="tk" x={x(t)} y={ih + 20} text-anchor="middle">{t}</text>
      {/each}
      <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
      <text class="axis-t" x={-m.left + 4} y={-6}>{tr('FLOP（对数）')}</text>

      <clipPath id="cs-clip"><rect width={iw} height={ih} /></clipPath>
      {#if fit}
        <line
          clip-path="url(#cs-clip)"
          x1={x(fit.x0)}
          y1={y(fit.y0)}
          x2={x(fit.x1)}
          y2={y(fit.y1)}
          stroke={pal.accent}
          stroke-width="1.5"
          stroke-dasharray="6 5"
          opacity="0.75"
        />
      {/if}

      {#each MODELS as d (d.name)}
        {@const on = enabled[d.region]}
        <circle
          cx={x(d.date)}
          cy={y(d.flop)}
          r={hovered === d ? 8 : 6}
          fill={color[d.region]}
          stroke={pal.ring}
          stroke-width="2"
          opacity={on ? 1 : 0.08}
          class="pt"
        />
        {#if on && (d.label || hovered === d)}
          <text
            class="lbl"
            x={x(d.date) + (d.date > 2024.5 ? -10 : 10)}
            y={y(d.flop) - 8}
            text-anchor={d.date > 2024.5 ? 'end' : 'start'}>{d.name}</text
          >
        {/if}
      {/each}

      <rect
        width={iw}
        height={ih}
        fill="transparent"
        role="presentation"
        onpointermove={onMove}
        onpointerleave={() => {
          hovered = null;
          hideTip();
        }}
      />
    </g>
  </svg>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: 12.5px;
    transition: opacity 0.2s;
  }
  .chip.off {
    opacity: 0.4;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--c);
  }
  .fit {
    margin-left: auto;
    font-size: 12.5px;
    color: var(--text-2);
  }
  .fit :global(b) {
    color: var(--accent);
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
  .axis-t {
    fill: var(--text-3);
    font-size: 11px;
  }
  .pt {
    transition: opacity 0.3s, r 0.15s;
  }
  .lbl {
    fill: var(--text-1);
    font-size: 11.5px;
    font-weight: 600;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
</style>
