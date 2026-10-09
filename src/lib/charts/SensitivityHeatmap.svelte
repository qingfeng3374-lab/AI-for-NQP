<script>
  import { scaleBand, scaleDiverging, interpolateRgbBasis } from 'd3';
  import { pal } from '../stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';

  /**
   * 敏感性热力图：xs × ys 网格，value(x, y) 返回数值；发散色以 0 为中性中点
   * current = { x, y } 标出当前参数所在格
   */
  let {
    xs = [],
    ys = [],
    value = () => 0,
    current = null,
    xLabel = '',
    yLabel = '',
    fmtX = (v) => v,
    fmtY = (v) => v,
    fmtV = (v) => v,
    clamp = null,
    onPick = () => {},
  } = $props();

  let width = $state(480);
  const m = { top: 10, right: 10, bottom: 46, left: 56 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const cell = $derived(iw / xs.length);
  const ih = $derived(Math.min(cell * ys.length, 360));
  const height = $derived(ih + m.top + m.bottom);
  const x = $derived(scaleBand().domain(xs).range([0, iw]).padding(0.04));
  const y = $derived(scaleBand().domain([...ys].reverse()).range([0, ih]).padding(0.04));
  const grid = $derived(ys.flatMap((yy) => xs.map((xx) => ({ xx, yy, v: value(xx, yy) }))));
  // 色阶范围：未指定时取网格中绝对值的 90% 分位，保证颜色有层次
  const lim = $derived.by(() => {
    if (clamp) return clamp;
    const abs = grid.map((g) => Math.abs(g.v)).sort((a, b) => a - b);
    return Math.max(0.5, abs[Math.floor(abs.length * 0.9)] ?? 1);
  });
  const color = $derived(
    scaleDiverging(interpolateRgbBasis([pal.div.neg, pal.div.mid, pal.div.pos])).domain([-lim, 0, lim]).clamp(true),
  );
  const near = (arr, v) => arr.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), arr[0]);
  const cur = $derived(current ? { xx: near(xs, current.x), yy: near(ys, current.y) } : null);
</script>

<div bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={tr('投资回报率敏感性热力图')}>
    <g transform="translate({m.left},{m.top})">
      {#each grid as g}
        <rect
          x={x(g.xx)}
          y={y(g.yy)}
          width={x.bandwidth()}
          height={y.bandwidth()}
          rx="3"
          fill={color(g.v)}
          class="cell"
          role="button"
          tabindex="-1"
          aria-label={tr('{xl} {x}，{yl} {y}：{v}', { xl: xLabel, x: fmtX(g.xx), yl: yLabel, y: fmtY(g.yy), v: fmtV(g.v) })}
          onclick={() => onPick(g.xx, g.yy)}
          onkeydown={() => {}}
          onpointerenter={(e) =>
            showTip(e, {
              title: tr('首年 ROI {v}', { v: fmtV(g.v) }),
              rows: [
                { label: xLabel, value: fmtX(g.xx) },
                { label: yLabel, value: fmtY(g.yy) },
              ],
              note: tr('点击可应用该组参数'),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        />
        {#if x.bandwidth() > 34}
          <text x={x(g.xx) + x.bandwidth() / 2} y={y(g.yy) + y.bandwidth() / 2} dy="0.35em" text-anchor="middle" class="cv" class:dark={Math.abs(g.v) > lim * 0.55}>
            {Math.round(g.v * 100)}
          </text>
        {/if}
      {/each}
      {#if cur}
        <rect x={x(cur.xx) - 2} y={y(cur.yy) - 2} width={x.bandwidth() + 4} height={y.bandwidth() + 4} rx="4" fill="none" stroke={pal.text1} stroke-width="2.5" class="cur" />
      {/if}
      {#each xs as xx, i}
        {#if i % Math.ceil(xs.length / 10) === 0}
          <text x={x(xx) + x.bandwidth() / 2} y={ih + 16} text-anchor="middle" class="tk">{fmtX(xx)}</text>
        {/if}
      {/each}
      {#each ys as yy}
        <text x="-8" y={y(yy) + y.bandwidth() / 2} dy="0.35em" text-anchor="end" class="tk">{fmtY(yy)}</text>
      {/each}
      <text x={iw / 2} y={ih + 38} text-anchor="middle" class="at">{xLabel} →</text>
      <text transform="translate({-44},{ih / 2}) rotate(-90)" text-anchor="middle" class="at">{yLabel} →</text>
    </g>
  </svg>
  <div class="leg">
    <span>{tr('亏损')}</span>
    <i style:background="linear-gradient(90deg,{pal.div.neg},{pal.div.mid},{pal.div.pos})"></i>
    <span>{tr('盈利（格内数字为 ROI %，色阶截断于 ±{n}%）', { n: Math.round(lim * 100) })}</span>
  </div>
</div>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .cell {
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .cell:hover {
    opacity: 0.8;
  }
  .cv {
    fill: var(--text-1);
    font-size: 10.5px;
    font-weight: 600;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
  }
  .cv.dark {
    fill: #fff;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
  }
  .at {
    fill: var(--text-2);
    font-size: 12px;
  }
  .cur {
    pointer-events: none;
  }
  .leg {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-3);
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .leg i {
    width: 120px;
    height: 8px;
    border-radius: 4px;
  }
</style>
