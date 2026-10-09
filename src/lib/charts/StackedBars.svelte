<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleBand, scaleLinear, stack } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import Legend from '../components/Legend.svelte';
  import { tr, loc } from '../i18n/lang.svelte.js';

  /**
   * 堆叠柱状图（段间 2px 表面色间隙）
   * data: [{ label, [key]: number }]，keys: [{ key, name, color }]
   * shareOf: 若提供 key，则在柱顶标注该 key 占总量的比例（仅首末与最大值）
   */
  let { data = [], keys = [], unit = '', height = 300, fmt = (v) => v.toLocaleString(loc()), shareOf = null, ariaLabel = '' } =
    $props();

  let width = $state(500);
  const grow = new Tween(0, { duration: 1400, easing: cubicOut });
  const m = { top: 26, right: 12, bottom: 30, left: 50 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = $derived(height - m.top - m.bottom);

  const series = $derived(stack().keys(keys.map((k) => k.key))(data));
  const totals = $derived(data.map((d) => keys.reduce((s, k) => s + (d[k.key] ?? 0), 0)));
  const x = $derived(
    scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, iw])
      .padding(0.3),
  );
  const y = $derived(
    scaleLinear()
      .domain([0, Math.max(...totals) * 1.12])
      .range([ih, 0])
      .nice(),
  );
  const g = $derived(grow.current);

  function tipFor(e, i) {
    const d = data[i];
    showTip(e, {
      title: d.label,
      rows: [
        ...keys.map((k) => ({ label: k.name, value: `${fmt(d[k.key])} ${unit}`, color: k.color })),
        { label: tr('合计'), value: `${fmt(totals[i])} ${unit}` },
      ],
      note: shareOf
        ? tr('{name}占比 {p}%', { name: keys.find((k) => k.key === shareOf).name, p: ((d[shareOf] / totals[i]) * 100).toFixed(1) })
        : d.note ?? '',
    });
  }
</script>

<Legend items={keys.map((k) => ({ label: k.name, color: k.color }))} />
<div bind:clientWidth={width} use:inview={{ onEnter: () => (grow.target = 1) }}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    <g transform="translate({m.left},{m.top})">
      {#each y.ticks(4) as t}
        <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
        <text class="tk" x="-8" y={y(t)} dy="0.32em" text-anchor="end">{fmt(t)}</text>
      {/each}
      {#if unit}<text class="tk" x={-m.left + 2} y="-12">{unit}</text>{/if}

      {#each series as s, si}
        {#each s as seg, i}
          {@const y0 = ih - (ih - y(seg[0])) * g}
          {@const y1 = ih - (ih - y(seg[1])) * g}
          {@const top = si === series.length - 1}
          {@const hgt = Math.max(0, y0 - y1 - (si > 0 ? 2 : 0))}
          <rect
            x={x(data[i].label)}
            y={y1}
            width={x.bandwidth()}
            height={hgt}
            rx={top ? 4 : 0}
            fill={keys[si].color}
            class="seg"
            role="img"
            aria-label="{data[i].label} {keys[si].name} {fmt(data[i][keys[si].key])}"
            onpointerenter={(e) => tipFor(e, i)}
            onpointermove={moveTip}
            onpointerleave={hideTip}
          />
          {#if top && hgt > 4}
            <!-- 顶部段只保留上沿圆角：用矩形覆盖下沿圆角 -->
            <rect x={x(data[i].label)} y={y1 + Math.min(4, hgt / 2)} width={x.bandwidth()} height={Math.max(0, hgt - Math.min(4, hgt / 2))} fill={keys[si].color} pointer-events="none" />
          {/if}
        {/each}
      {/each}

      {#each data as d, i}
        {@const show = i === 0 || i === data.length - 1}
        {#if show && g > 0.95}
          <text class="vl" class:strong={i === data.length - 1} x={x(d.label) + x.bandwidth() / 2} y={y(totals[i]) - 8} text-anchor="middle">
            {fmt(totals[i])}{#if shareOf}<tspan class="share"> · {((d[shareOf] / totals[i]) * 100).toFixed(0)}%</tspan>{/if}
          </text>
        {/if}
        <text class="tk" x={x(d.label) + x.bandwidth() / 2} y={ih + 18} text-anchor="middle">{d.label}</text>
      {/each}
      <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
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
  .seg {
    cursor: pointer;
    transition: filter 0.2s;
  }
  .seg:hover {
    filter: brightness(1.2);
  }
  .vl {
    fill: var(--text-2);
    font-size: 11.5px;
  }
  .vl.strong {
    fill: var(--text-1);
    font-weight: 700;
    font-size: 12.5px;
  }
  .share {
    fill: var(--text-3);
    font-weight: 400;
  }
</style>
