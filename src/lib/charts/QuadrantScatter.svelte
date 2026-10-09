<script>
  import { scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { pal } from '../stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';

  /**
   * 象限散点：x = 自动化潜力，y = 增强潜力
   * points = [{ id, name, x, y }]，me = { x, y } 为用户当前岗位（平滑移动的高亮点）
   */
  let { points = [], me = null, thresh = { auto: 0.3, aug: 0.33 }, quadrants = [], activeId = null, onPick = () => {}, height = 420 } = $props();

  let width = $state(560);
  const m = { top: 24, right: 20, bottom: 44, left: 52 };
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = $derived(height - m.top - m.bottom);
  // 定义域包含所有预设职业与用户当前点
  const x = $derived(scaleLinear().domain([Math.min(0.1, (me?.x ?? 1) - 0.03), Math.max(0.52, (me?.x ?? 0) + 0.04)]).range([0, iw]));
  const y = $derived(scaleLinear().domain([Math.min(0.17, (me?.y ?? 1) - 0.03), Math.max(0.47, (me?.y ?? 0) + 0.03)]).range([ih, 0]));

  // 标签避让：依次尝试 右 / 右下 / 右上 / 左 四个位置
  const labelPos = $derived.by(() => {
    const boxes = [];
    const out = {};
    const tries = [[8, 4, 'start'], [8, 17, 'start'], [8, -9, 'start'], [-8, 4, 'end']];
    for (const p of [...points].sort((a, b) => b.y - a.y)) {
      const px = x(p.x);
      const py = y(p.y);
      const w = isEn() ? tr(p.name).length * 6.5 + 4 : p.name.length * 11 + 4;
      let chosen = tries[0];
      for (const t of tries) {
        const x0 = t[2] === 'start' ? px + t[0] : px + t[0] - w;
        const b = [x0, py + t[1] - 10, x0 + w, py + t[1] + 3];
        if (!boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) {
          chosen = t;
          boxes.push(b);
          break;
        }
      }
      out[p.id] = chosen;
    }
    return out;
  });

  const meT = new Tween({ x: 0.3, y: 0.33 }, { duration: 500, easing: cubicOut });
  $effect(() => {
    if (me) meT.target = { x: me.x, y: me.y };
  });

  const Q = $derived({
    reshape: [x(thresh.auto), 0, iw - x(thresh.auto), y(thresh.aug)],
    risk: [x(thresh.auto), y(thresh.aug), iw - x(thresh.auto), ih - y(thresh.aug)],
    amplify: [0, 0, x(thresh.auto), y(thresh.aug)],
    human: [0, y(thresh.aug), x(thresh.auto), ih - y(thresh.aug)],
  });
  const qColor = $derived({ reshape: pal.accent2, risk: pal.series[1], amplify: pal.series[0], human: pal.series[3] });
</script>

<div bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={tr('职业 AI 影响象限图')}>
    <g transform="translate({m.left},{m.top})">
      {#each quadrants as q}
        {@const r = Q[q.id]}
        <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={qColor[q.id]} opacity={activeId === q.id ? 0.14 : 0.06} />
        <text
          x={q.x === 'high' ? r[0] + r[2] - 8 : r[0] + 8}
          y={q.y === 'high' ? r[1] + 18 : r[1] + r[3] - 10}
          text-anchor={q.x === 'high' ? 'end' : 'start'}
          class="ql"
          fill={qColor[q.id]}>{tr(q.name)}</text
        >
      {/each}
      <line x1={x(thresh.auto)} x2={x(thresh.auto)} y1="0" y2={ih} stroke={pal.axis} stroke-dasharray="4 4" />
      <line x1="0" x2={iw} y1={y(thresh.aug)} y2={y(thresh.aug)} stroke={pal.axis} stroke-dasharray="4 4" />
      <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
      <line x1="0" x2="0" y1="0" y2={ih} stroke={pal.axis} />
      {#each x.ticks(5) as t}
        <text x={x(t)} y={ih + 16} text-anchor="middle" class="tk">{Math.round(t * 100)}%</text>
      {/each}
      {#each y.ticks(4) as t}
        <text x="-8" y={y(t)} dy="0.32em" text-anchor="end" class="tk">{Math.round(t * 100)}%</text>
      {/each}
      <text x={iw / 2} y={ih + 36} text-anchor="middle" class="at">{tr('自动化潜力（可被 AI 替代的工作时间占比）→')}</text>
      <text transform="translate({-40},{ih / 2}) rotate(-90)" text-anchor="middle" class="at">{tr('增强潜力 →')}</text>

      {#each points as p}
        <g
          class="pt"
          transform="translate({x(p.x)},{y(p.y)})"
          role="button"
          tabindex="0"
          aria-label={tr('{name}：自动化 {x}%，增强 {y}%', { name: tr(p.name), x: Math.round(p.x * 100), y: Math.round(p.y * 100) })}
          onclick={() => onPick(p.id)}
          onkeydown={(e) => e.key === 'Enter' && onPick(p.id)}
          onpointerenter={(e) =>
            showTip(e, {
              title: tr(p.name),
              rows: [
                { label: tr('自动化潜力'), value: `${Math.round(p.x * 100)}%`, color: pal.series[1] },
                { label: tr('增强潜力'), value: `${Math.round(p.y * 100)}%`, color: pal.series[0] },
              ],
              note: tr('点击载入该职业的任务构成'),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        >
          <circle r="12" fill="transparent" />
          <circle r="5" fill={pal.text3} stroke={pal.ring} stroke-width="1.5" />
          <text x={labelPos[p.id]?.[0] ?? 8} y={labelPos[p.id]?.[1] ?? 4} text-anchor={labelPos[p.id]?.[2] ?? 'start'} class="pl">{tr(p.name)}</text>
        </g>
      {/each}

      {#if me}
        <g transform="translate({x(meT.current.x)},{y(meT.current.y)})" class="me">
          <circle r="16" fill={pal.accent} opacity="0.18" class="halo" />
          <circle r="8" fill={pal.accent} stroke={pal.ring} stroke-width="2.5" />
          <text y="-16" text-anchor="middle" class="ml">{tr('你的岗位')}</text>
        </g>
      {/if}
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
  }
  .at {
    fill: var(--text-2);
    font-size: 12px;
  }
  .ql {
    font-size: 13px;
    font-weight: 800;
    opacity: 0.9;
  }
  .pt {
    cursor: pointer;
    outline: none;
  }
  .pt:hover .pl,
  .pt:focus-visible .pl {
    fill: var(--accent);
  }
  .pl {
    fill: var(--text-2);
    font-size: 11px;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .ml {
    fill: var(--accent);
    font-size: 12.5px;
    font-weight: 800;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .halo {
    animation: halo 1.8s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes halo {
    50% {
      transform: scale(1.5);
      opacity: 0.05;
    }
  }
</style>
