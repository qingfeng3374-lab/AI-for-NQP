<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /**
   * 发散条形图：正值（增长）向右，负值（收缩）向左，中点为 0
   * data: [{ name, value, note? }]
   */
  let { data = [], unit = '%', rowH = 24, ariaLabel = '', posLabel = '增长', negLabel = '收缩' } = $props();

  let width = $state(520);
  const grow = new Tween(0, { duration: 1300, easing: cubicOut });
  const sorted = $derived([...data].sort((a, b) => b.value - a.value));
  const maxAbs = $derived(Math.max(...data.map((d) => Math.abs(d.value))));
  const height = $derived(sorted.length * rowH + 30);
  const mid = $derived(width / 2);
  const x = $derived(
    scaleLinear()
      .domain([-maxAbs, maxAbs])
      .range([10, width - 10]),
  );
</script>

<div bind:clientWidth={width} use:inview={{ onEnter: () => (grow.target = 1) }}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    <text x={mid + 8} y="12" class="hd pos">{tr(posLabel)} →</text>
    <text x={mid - 8} y="12" class="hd neg" text-anchor="end">← {tr(negLabel)}</text>
    <g transform="translate(0,24)">
      {#each sorted as d, i}
        {@const pos = d.value >= 0}
        {@const w = Math.abs(x(d.value) - x(0)) * grow.current}
        {@const cy = i * rowH}
        <g
          class="row"
          role="img"
          aria-label="{tr(d.name)} {d.value}{unit}"
          onpointerenter={(e) =>
            showTip(e, {
              title: tr(d.name),
              rows: [{ label: tr(pos ? '预计净增长' : '预计净下降'), value: `${d.value > 0 ? '+' : ''}${d.value}${unit}`, color: pos ? pal.div.pos : pal.div.neg }],
              note: tr(d.note ?? ''),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        >
          <rect x="0" y={cy} {width} height={rowH} fill="transparent" />
          <rect
            x={pos ? x(0) : x(0) - w}
            y={cy + 4}
            width={w}
            height={rowH - 8}
            rx="3"
            fill={pos ? pal.div.pos : pal.div.neg}
          />
          <!-- 标签放在条形的另一侧，避免与条形重叠 -->
          <text x={pos ? x(0) - 8 : x(0) + 8} y={cy + rowH / 2} dy="0.35em" text-anchor={pos ? 'end' : 'start'} class="nm">{tr(d.name)}</text>
          <text
            x={pos ? x(0) + w + 6 : x(0) - w - 6}
            y={cy + rowH / 2}
            dy="0.35em"
            text-anchor={pos ? 'start' : 'end'}
            class="vl">{d.value > 0 ? '+' : ''}{d.value}{unit}</text
          >
        </g>
      {/each}
      <line x1={x(0)} x2={x(0)} y1="-4" y2={sorted.length * rowH + 4} stroke={pal.div.mid} stroke-width="1.5" />
    </g>
  </svg>
</div>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .hd {
    font-size: 11.5px;
    font-weight: 600;
  }
  .hd.pos {
    fill: var(--pos-text);
  }
  .hd.neg {
    fill: var(--warn-text);
  }
  .row {
    cursor: pointer;
  }
  .row:hover .nm {
    fill: var(--text-1);
  }
  .nm {
    fill: var(--text-2);
    font-size: 12px;
  }
  .vl {
    fill: var(--text-1);
    font-size: 11.5px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
</style>
