<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /** 区间哑铃图：data = [{ name, low, high }]，按上限排序 */
  let { data = [], unit = '', color = null, labelW = 112, rowH = 30, ariaLabel = '' } = $props();

  const c = $derived(color ?? pal.series[0]);
  let width = $state(480);
  const grow = new Tween(0, { duration: 1400, easing: cubicOut });
  const sorted = $derived([...data].sort((a, b) => b.high - a.high));
  const height = $derived(sorted.length * rowH + 30);
  const iw = $derived(Math.max(10, width - labelW - 20));
  const x = $derived(
    scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.high)) * 1.05])
      .range([0, iw])
      .nice(),
  );
</script>

<div bind:clientWidth={width} use:inview={{ onEnter: () => (grow.target = 1) }}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    <g transform="translate({labelW},4)">
      {#each x.ticks(5) as t}
        <line class="gridline" x1={x(t)} x2={x(t)} y1="0" y2={sorted.length * rowH} />
        <text class="tk" x={x(t)} y={sorted.length * rowH + 16} text-anchor="middle">{t}</text>
      {/each}
      {#each sorted as d, i}
        {@const g = grow.current}
        {@const cy = i * rowH + rowH / 2}
        {@const x0 = x(d.low) * g}
        {@const x1 = x(d.high) * g}
        <g
          class="row"
          role="img"
          aria-label="{tr(d.name)} {d.low}–{d.high}{unit}"
          onpointerenter={(e) =>
            showTip(e, {
              title: tr(d.name),
              rows: [
                { label: tr('下限'), value: `${d.low} ${unit}`, color: c },
                { label: tr('上限'), value: `${d.high} ${unit}`, color: c },
              ],
              note: tr('中值约 {v}', { v: `${Math.round((d.low + d.high) / 2)} ${unit}` }),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        >
          <rect x={-labelW} y={cy - rowH / 2} width={labelW + iw} height={rowH} fill="transparent" />
          <text x="-10" y={cy} dy="0.35em" text-anchor="end" class="nm">{tr(d.name)}</text>
          <line x1={x0} x2={x1} y1={cy} y2={cy} stroke={c} stroke-width="6" stroke-linecap="round" opacity="0.4" />
          <circle cx={x0} cy={cy} r="5" fill={pal.ring} stroke={c} stroke-width="2" />
          <circle cx={x1} cy={cy} r="5.5" fill={c} stroke={pal.ring} stroke-width="2" />
          {#if i < 3}
            <text x={x1 + 10} y={cy} dy="0.35em" class="vl">{d.low}–{d.high}</text>
          {/if}
        </g>
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
  .nm {
    fill: var(--text-2);
    font-size: 12.5px;
  }
  .row {
    cursor: pointer;
  }
  .row:hover .nm {
    fill: var(--text-1);
  }
  .vl {
    fill: var(--text-1);
    font-size: 11.5px;
    font-weight: 600;
  }
</style>
