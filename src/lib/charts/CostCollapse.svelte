<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleLinear, scaleLog, line, curveStepAfter } from 'd3';
  import { INFERENCE_COST, CN_PRICE_WAR } from '../../data/engine.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { inview } from '../actions/inview.js';
  import { tr } from '../i18n/lang.svelte.js';

  /** 推理成本坍塌：GPT-3.5 级能力的单价（对数轴阶梯线） */
  let width = $state(400);
  const height = 260;
  const m = { top: 16, right: 18, bottom: 28, left: 46 };
  let drawn = $state(false);

  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const x = $derived(scaleLinear().domain([2022.7, 2025.0]).range([0, iw]));
  const y = scaleLog().domain([0.04, 40]).range([ih, 0]);
  const data = [...INFERENCE_COST, { ...INFERENCE_COST[INFERENCE_COST.length - 1], date: 2025.0, ghost: true }];
  const path = $derived(
    line()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(curveStepAfter)(data),
  );
  // Stanford AI Index 2025 的表述为「超过 280 倍」
  const ratio = 280;
</script>

<div class="hero-num" use:inview={{ onEnter: () => (drawn = true) }}>
  <div class="big grad-text">↓ {ratio}×</div>
  <div class="cap">{@html tr('不到两年，同等能力（GPT-3.5 级）的大模型调用价格从 <b>$20</b> 降至 <b>$0.07</b> / 百万 token')}</div>
</div>

<div bind:clientWidth={width}>
  <svg {width} {height} role="img" aria-label={tr('大模型推理价格下降阶梯图')}>
    <g transform="translate({m.left},{m.top})">
      {#each [0.1, 1, 10] as t}
        <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
        <text class="tk" x="-8" y={y(t)} dy="0.32em" text-anchor="end">${t}</text>
      {/each}
      {#each [2023, 2024, 2025] as t}
        <text class="tk" x={x(t)} y={ih + 18} text-anchor="middle">{t}</text>
      {/each}
      <line x1="0" x2={iw} y1={ih} y2={ih} stroke={pal.axis} />
      <path d={path} class="ln" class:drawn pathLength="1" />
      {#each INFERENCE_COST as d, i}
        <circle
          cx={x(d.date)}
          cy={y(d.price)}
          r="5"
          class="pt"
          role="img"
          aria-label="{d.model} ${d.price}"
          onpointerenter={(e) =>
            showTip(e, {
              title: d.model,
              rows: [{ label: tr('混合单价'), value: tr('${p} / 百万 token', { p: d.price }), color: pal.accent }],
              note:
                i > 0
                  ? tr('较 2022 年 11 月下降 {n} 倍', { n: (INFERENCE_COST[0].price / d.price).toFixed(0) })
                  : tr('基准：2022 年 11 月'),
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        />
      {/each}
      <text x={x(INFERENCE_COST[0].date) + 10} y={y(20) - 8} class="lbl">text-davinci-003 · $20</text>
      <text x={x(2024.8) - 10} y={y(0.07) + 4} class="lbl" text-anchor="end">Gemini 1.5 Flash-8B · $0.07</text>
    </g>
  </svg>
</div>

<div class="cn">
  <div class="cn-h">{tr('中国 · 2024 年 5 月"大模型价格战"')}</div>
  <div class="cn-list">
    {#each CN_PRICE_WAR as c}
      <div class="cn-i"><b>{tr(c.name)}</b><span>{tr(c.note)}</span></div>
    {/each}
  </div>
</div>

<style>
  .hero-num {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
  }
  .big {
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
    white-space: nowrap;
  }
  .cap {
    font-size: 13px;
    color: var(--text-2);
  }
  .cap :global(b) {
    color: var(--text-1);
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
  .ln {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 2s ease;
  }
  .ln.drawn {
    stroke-dashoffset: 0;
  }
  .pt {
    fill: var(--accent);
    stroke: var(--halo);
    stroke-width: 2;
    cursor: pointer;
  }
  .lbl {
    fill: var(--text-2);
    font-size: 11px;
  }
  .cn {
    margin-top: 10px;
    padding: 12px;
    border-radius: var(--radius-m);
    background: var(--warn-bg);
    border: 1px solid var(--warn-border);
  }
  .cn-h {
    font-size: 12.5px;
    color: var(--warn-text);
    margin-bottom: 6px;
    font-weight: 600;
  }
  .cn-list {
    display: grid;
    gap: 4px;
  }
  .cn-i {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 12.5px;
    color: var(--text-2);
  }
  .cn-i b {
    color: var(--text-1);
    font-weight: 600;
  }
</style>
