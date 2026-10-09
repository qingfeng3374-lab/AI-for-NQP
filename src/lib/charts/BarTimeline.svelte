<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleBand, scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr, loc } from '../i18n/lang.svelte.js';

  /**
   * 通用时间柱状图
   * data:    [{ label, value, note?, estimate? }]
   * targets: [{ label, value, text }]   —— 规划目标标记（横线 + 文字）
   * subRow:  { name, values: string[] } —— 柱下附加一行（如"占 GDP 比重"），避免双轴
   */
  let {
    data = [],
    unit = '',
    color = null,
    highlightLast = true,
    targets = [],
    subRow = null,
    height = 300,
    fmt = (v) => v.toLocaleString(loc()),
    yMax = null,
    seriesName = '',
  } = $props();

  const c = $derived(color ?? pal.series[0]);
  let width = $state(500);
  const grow = new Tween(0, { duration: 1500, easing: cubicOut });
  const grown = $derived(grow.current > 0.98);
  const STAG = 0.08;
  // 逐根错峰生长
  const prog = (i) => Math.max(0, Math.min(1, grow.current * (1 + STAG * (data.length - 1)) - STAG * i));
  const m = $derived({ top: 26, right: 12, bottom: subRow ? 50 : 30, left: 46 });
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = $derived(height - m.top - m.bottom);

  const x = $derived(
    scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, iw])
      .padding(0.32),
  );
  const top = $derived(yMax ?? Math.max(...data.map((d) => d.value), ...targets.map((t) => t.value)) * 1.12);
  const y = $derived(scaleLinear().domain([0, top]).range([ih, 0]).nice());
  const ticks = $derived(y.ticks(4));
  const maxIdx = $derived(data.reduce((bi, d, i) => (d.value > data[bi].value ? i : bi), 0));

  // 4px 圆角数据端，锚定在基线上
  function barPath(x0, y0, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x0},${y0 + h}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + w - r}Q${x0 + w},${y0} ${x0 + w},${y0 + r}V${y0 + h}Z`;
  }
</script>

<div bind:clientWidth={width} use:inview={{ onEnter: () => (grow.target = 1) }}>
  <svg {width} {height} role="img" aria-label={seriesName}>
    <g transform="translate({m.left},{m.top})">
      {#each ticks as t}
        <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
        <text class="tk" x="-8" y={y(t)} dy="0.32em" text-anchor="end">{fmt(t)}</text>
      {/each}
      {#if unit}<text class="unit" x={-m.left + 2} y="-12">{unit}</text>{/if}

      {#each data as d, i}
        {@const h = (ih - y(d.value)) * prog(i)}
        {@const isLast = i === data.length - 1}
        <path
          d={barPath(x(d.label), ih - h, x.bandwidth(), Math.max(0, h))}
          fill={c}
          opacity={highlightLast && !isLast ? 0.62 : 1}
          class="bar"
          class:est={d.estimate}
          style:color={c}
          role="img"
          aria-label={tr('{label}：{value}', { label: d.label, value: `${fmt(d.value)} ${unit}` })}
          onpointerenter={(e) =>
            showTip(e, {
              title: d.label,
              rows: [{ label: seriesName || tr('数值'), value: `${fmt(d.value)} ${unit}`, color: c }],
              note: d.note ?? (d.estimate ? tr('估算值') : ''),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        />
        <!-- 选择性直接标注：最后一根与最大值 -->
        {#if (isLast || i === maxIdx || i === 0) && grown}
          <text class="vl" class:strong={isLast} x={x(d.label) + x.bandwidth() / 2} y={y(d.value) - 7} text-anchor="middle"
            >{fmt(d.value)}</text
          >
        {/if}
        <text class="tk" x={x(d.label) + x.bandwidth() / 2} y={ih + 18} text-anchor="middle">{d.label}</text>
        {#if subRow}
          <text class="sub" x={x(d.label) + x.bandwidth() / 2} y={ih + 38} text-anchor="middle">{subRow.values[i]}</text>
        {/if}
      {/each}
      {#if subRow}
        <text class="sub-n" x={-m.left + 2} y={ih + 38}>{subRow.name}</text>
      {/if}

      {#each targets as t}
        {@const tx = x(t.label)}
        {#if tx !== undefined}
          <g class="target">
            <line x1={tx - 6} x2={tx + x.bandwidth() + 6} y1={y(t.value)} y2={y(t.value)} />
            <text x={tx + x.bandwidth() / 2} y={y(t.value) - 6} text-anchor="middle">{t.text}</text>
          </g>
        {/if}
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
  .unit {
    fill: var(--text-3);
    font-size: 11px;
  }
  .bar {
    transition: opacity 0.2s;
    cursor: pointer;
  }
  .bar:hover {
    opacity: 1 !important;
    filter: brightness(1.15);
  }
  .bar.est {
    fill-opacity: 0.35;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }
  .vl {
    fill: var(--text-2);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }
  .vl.strong {
    fill: var(--text-1);
    font-weight: 700;
    font-size: 13px;
  }
  .sub {
    fill: var(--text-2);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .sub-n {
    fill: var(--text-3);
    font-size: 10.5px;
  }
  .target line {
    stroke: var(--series-2);
    stroke-width: 2;
    stroke-dasharray: 4 3;
  }
  .target text {
    fill: var(--warn-text);
    font-size: 11px;
    font-weight: 600;
  }
</style>
