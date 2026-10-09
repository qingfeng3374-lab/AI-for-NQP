<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleLinear, line, curveMonotoneX } from 'd3';
  import { BENCHMARKS } from '../../data/engine.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { inview } from '../actions/inview.js';
  import { tr } from '../i18n/lang.svelte.js';

  /** 小多图：四项基准测试中顶尖模型得分 vs 人类基线 */
  let width = $state(300);
  const height = 190;
  const m = { top: 14, right: 14, bottom: 24, left: 34 };
  let drawn = $state(false);

  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const x = $derived(scaleLinear().domain([2020, 2026]).range([0, iw]));
  const y = scaleLinear().domain([0, 100]).range([ih, 0]);
  const pathOf = $derived(
    line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(curveMonotoneX),
  );

  // 首次超越人类基线的时间点
  function crossing(b) {
    if (!b.human) return null;
    return b.points.find((p) => p[1] >= b.human) ?? null;
  }
</script>

<div class="grid" use:inview={{ onEnter: () => (drawn = true) }}>
  {#each BENCHMARKS as b, bi}
    {@const cross = crossing(b)}
    {@const lastPt = b.points[b.points.length - 1]}
    <div class="panel">
      <div class="ph">
        <span class="pn">{b.name}</span>
        <span class="pd">{tr(b.desc)}</span>
      </div>
      <div bind:clientWidth={width}>
        <svg {width} {height} role="img" aria-label={tr('{name} 得分变化', { name: b.name })}>
          <g transform="translate({m.left},{m.top})">
            {#each [0, 50, 100] as t}
              <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
              <text class="tk" x="-6" y={y(t)} dy="0.32em" text-anchor="end">{t}</text>
            {/each}
            {#each [2020, 2022, 2024, 2026] as t}
              <text class="tk" x={x(t)} y={ih + 16} text-anchor="middle">{t}</text>
            {/each}

            {#if b.human}
              <line x1="0" x2={iw} y1={y(b.human)} y2={y(b.human)} class="human" />
              <text x="4" y={y(b.human) + 13} class="human-t">{tr(b.humanLabel)}</text>
            {:else}
              <text x="4" y={y(8)} class="human-t muted">{tr('无人类基线（任务均经人工验证可解）')}</text>
            {/if}

            <path
              d={pathOf(b.points)}
              class="ln"
              class:drawn
              style:transition-delay="{bi * 0.15}s"
              pathLength="1"
            />
            {#each b.points as p, i}
              <circle
                cx={x(p[0])}
                cy={y(p[1])}
                r="4.5"
                class="pt"
                class:above={b.human && p[1] >= b.human}
                role="img"
                aria-label="{p[2]} {p[1]}%"
                onpointerenter={(e) =>
                  showTip(e, {
                    title: `${b.name} · ${p[2]}`,
                    rows: [
                      { label: tr('得分'), value: `${p[1]}%`, color: pal.accent },
                      { label: tr('时间'), value: tr('{y} 年', { y: Math.floor(p[0]) }) },
                    ],
                    note: b.human
                      ? p[1] >= b.human
                        ? tr('已超过人类基线')
                        : tr('距人类基线 {d} 个百分点', { d: (b.human - p[1]).toFixed(1) })
                      : '',
                  })}
                onpointermove={moveTip}
                onpointerleave={hideTip}
              />
            {/each}
            <text x={x(lastPt[0]) - 9} y={y(lastPt[1]) - 8} text-anchor="end" class="last">
              {lastPt[2]} {lastPt[1]}%
            </text>
            {#if cross}
              <g transform="translate({x(cross[0])},{y(cross[1])})">
                <circle r="9" class="ring" />
              </g>
            {/if}
          </g>
        </svg>
      </div>
      <div class="pf">
        {#if cross}
          <span class="badge">✓ {tr('{y} 年超越人类基线', { y: Math.floor(cross[0]) })}</span>
        {:else if b.human}
          <span class="badge pending">{tr('尚未超越')}</span>
        {:else}
          <span class="badge pending"
            >{tr('{m} 个月提升 {d} 个百分点', {
              m: Math.round((lastPt[0] - b.points[0][0]) * 12),
              d: (lastPt[1] - b.points[0][1]).toFixed(0),
            })}</span
          >
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .panel {
    padding: 12px 12px 10px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
    min-width: 0;
  }
  .ph {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pn {
    font-weight: 700;
    font-size: 14px;
  }
  .pd {
    font-size: 12px;
    color: var(--text-3);
  }
  svg {
    display: block;
    overflow: visible;
  }
  .tk {
    fill: var(--text-3);
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
  }
  .human {
    stroke: var(--series-2);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
  }
  .human-t {
    fill: var(--warn-text);
    font-size: 11px;
  }
  .human-t.muted {
    fill: var(--text-3);
  }
  .ln {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 1.6s ease;
  }
  .ln.drawn {
    stroke-dashoffset: 0;
  }
  .pt {
    fill: var(--halo);
    stroke: var(--accent);
    stroke-width: 2;
    cursor: pointer;
  }
  .pt.above {
    fill: var(--accent);
  }
  .pt:hover {
    r: 6.5;
  }
  .ring {
    fill: none;
    stroke: var(--accent);
    stroke-opacity: 0.5;
    stroke-width: 1.5;
    animation: ping 2s infinite;
  }
  @keyframes ping {
    from {
      r: 6;
      stroke-opacity: 0.8;
    }
    to {
      r: 16;
      stroke-opacity: 0;
    }
  }
  .last {
    fill: var(--text-1);
    font-size: 11px;
    font-weight: 600;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .pf {
    margin-top: 4px;
  }
  .badge {
    font-size: 11.5px;
    color: var(--accent);
    background: rgba(var(--accent-rgb), 0.1);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .badge.pending {
    color: var(--text-2);
    background: var(--surface-3);
  }
  @media (max-width: 560px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
