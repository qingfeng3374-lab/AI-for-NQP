<script>
  import { scaleBand, scaleLinear } from 'd3';
  import { pal } from '../stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';

  /**
   * 瀑布图：steps = [{ label, value, type: 'pos'|'neg'|'total' }]
   * 正项向上累加，负项向下扣减，合计从 0 起画
   */
  let { steps = [], unit = '', fmt = (v) => v.toFixed(0), height = 280 } = $props();

  let width = $state(480);
  const m = { top: 26, right: 12, bottom: 34, left: 52 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = $derived(height - m.top - m.bottom);

  const bars = $derived.by(() => {
    let acc = 0;
    return steps.map((s) => {
      if (s.type === 'total') return { ...s, y0: 0, y1: s.value };
      const y0 = acc;
      acc += s.value;
      return { ...s, y0, y1: acc };
    });
  });
  const ext = $derived.by(() => {
    const vals = bars.flatMap((b) => [b.y0, b.y1, 0]);
    return [Math.min(...vals), Math.max(...vals)];
  });
  const x = $derived(
    scaleBand()
      .domain(steps.map((s) => s.label))
      .range([0, iw])
      .padding(0.35),
  );
  const y = $derived(
    scaleLinear()
      .domain([Math.min(0, ext[0]) * 1.1, Math.max(1, ext[1]) * 1.12])
      .range([ih, 0])
      .nice(),
  );
  const color = (b) => (b.type === 'total' ? (b.value >= 0 ? pal.accent : pal.div.neg) : b.type === 'pos' ? pal.div.pos : pal.div.neg);
</script>

<div bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={tr('首年收益瀑布图')}>
    <g transform="translate({m.left},{m.top})">
      {#each y.ticks(4) as t}
        <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} stroke={pal.grid} />
        <text x="-8" y={y(t)} dy="0.32em" text-anchor="end" class="tk">{fmt(t)}</text>
      {/each}
      <text x={-m.left + 2} y="-12" class="tk">{unit}</text>
      <line x1="0" x2={iw} y1={y(0)} y2={y(0)} stroke={pal.axis} stroke-width="1.5" />
      {#each bars as b, i}
        {@const top = y(Math.max(b.y0, b.y1))}
        {@const h = Math.max(1, Math.abs(y(b.y0) - y(b.y1)))}
        <rect
          x={x(b.label)}
          y={top}
          width={x.bandwidth()}
          height={h}
          rx="4"
          fill={color(b)}
          class="bar"
          role="img"
          aria-label="{b.label} {fmt(b.value)}{isEn() ? ' ' : ''}{unit}"
          onpointerenter={(e) => showTip(e, { title: b.label, rows: [{ label: tr('金额'), value: `${b.value >= 0 && b.type !== 'total' ? '+' : ''}${fmt(b.value)} ${unit}`, color: color(b) }], note: b.note ?? '' })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        />
        {#if i < bars.length - 1 && b.type !== 'total'}
          <line x1={x(b.label) + x.bandwidth()} x2={x(bars[i + 1].label)} y1={y(b.y1)} y2={y(b.y1)} stroke={pal.text3} stroke-dasharray="3 3" />
        {/if}
        <text x={x(b.label) + x.bandwidth() / 2} y={top - 7} text-anchor="middle" class="vl" class:strong={b.type === 'total'}>
          {b.type === 'pos' ? '+' : ''}{fmt(b.value)}
        </text>
        <text x={x(b.label) + x.bandwidth() / 2} y={ih + 18} text-anchor="middle" class="tk lb">{b.label}</text>
      {/each}
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
  .lb {
    fill: var(--text-2);
    font-size: 12px;
  }
  .bar {
    transition:
      y 0.4s,
      height 0.4s;
    cursor: pointer;
  }
  .vl {
    fill: var(--text-2);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .vl.strong {
    fill: var(--text-1);
    font-weight: 800;
    font-size: 13.5px;
  }
</style>
