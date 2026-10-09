<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr, loc } from '../i18n/lang.svelte.js';

  /**
   * 横向排名条形图：一个系列一种颜色，高亮对象用强调色、其余降为灰调
   * data: [{ name, value, note? }]
   */
  let {
    data = [],
    highlight = [],
    color = null,
    muted = null,
    unit = '',
    fmt = (v) => v.toLocaleString(loc()),
    rowH = 28,
    labelW = 92,
    ariaLabel = '',
  } = $props();

  const c = $derived(color ?? pal.series[0]);
  const mc = $derived(muted ?? pal.muted);
  let width = $state(400);
  const grow = new Tween(0, { duration: 1300, easing: cubicOut });
  const height = $derived(data.length * rowH + 8);
  const iw = $derived(Math.max(10, width - labelW - 70));
  const x = $derived(
    scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.value))])
      .range([0, iw]),
  );
</script>

<div bind:clientWidth={width} use:inview={{ onEnter: () => (grow.target = 1) }}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    {#each data as d, i}
      {@const hl = highlight.length === 0 || highlight.includes(d.name)}
      {@const w = Math.max(2, x(d.value) * grow.current)}
      <g
        transform="translate(0,{i * rowH + 4})"
        class="row"
        role="img"
        aria-label="{d.name} {fmt(d.value)}{unit}"
        onpointerenter={(e) =>
          showTip(e, { title: d.name, rows: [{ label: tr('数值'), value: `${fmt(d.value)} ${unit}`, color: hl ? c : mc }], note: d.note ?? '' })}
        onpointermove={moveTip}
        onpointerleave={hideTip}
      >
        <rect x="0" y="0" width={width} height={rowH - 4} fill="transparent" />
        <text x={labelW - 10} y={(rowH - 4) / 2} dy="0.35em" text-anchor="end" class="nm" class:hl>{d.name}</text>
        <rect x={labelW} y="3" height={rowH - 10} width={w} rx="4" fill={hl ? c : mc} />
        <text x={labelW + w + 8} y={(rowH - 4) / 2} dy="0.35em" class="vl" class:hl>{fmt(d.value)}</text>
      </g>
    {/each}
  </svg>
</div>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .row {
    cursor: pointer;
  }
  .row:hover .nm {
    fill: var(--text-1);
  }
  .nm {
    fill: var(--text-2);
    font-size: 12.5px;
  }
  .nm.hl {
    fill: var(--text-1);
    font-weight: 600;
  }
  .vl {
    fill: var(--text-3);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .vl.hl {
    fill: var(--text-1);
    font-weight: 600;
  }
</style>
