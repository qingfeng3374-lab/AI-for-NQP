<script>
  import { tip } from '../stores/tooltip.svelte.js';

  let el = $state();
  let w = $state(200);
  let h = $state(80);

  // 靠近视口边缘时自动翻转，避免溢出
  const pos = $derived.by(() => {
    const pad = 14;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    let left = tip.x + pad;
    let top = tip.y + pad;
    if (left + w > vw - 8) left = tip.x - w - pad;
    if (top + h > vh - 8) top = tip.y - h - pad;
    return { left: Math.max(8, left), top: Math.max(8, top) };
  });
</script>

<div
  class="tooltip"
  class:show={tip.visible}
  bind:this={el}
  bind:offsetWidth={w}
  bind:offsetHeight={h}
  style:left="{pos.left}px"
  style:top="{pos.top}px"
  role="tooltip"
  aria-hidden={!tip.visible}
>
  {#if tip.title}<div class="t">{tip.title}</div>{/if}
  {#each tip.rows as r}
    <div class="row">
      {#if r.color}<span class="sw" style:background={r.color}></span>{/if}
      <span class="lbl">{r.label}</span>
      <span class="val">{r.value}</span>
    </div>
  {/each}
  {#if tip.note}<div class="note">{tip.note}</div>{/if}
</div>

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    min-width: 140px;
    max-width: 300px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--tooltip-bg);
    border: 1px solid var(--border-strong);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(8px);
    font-size: 12.5px;
    line-height: 1.5;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.12s, transform 0.12s;
  }
  .tooltip.show {
    opacity: 1;
    transform: none;
  }
  .t {
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 4px;
    font-size: 13px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-2);
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex: none;
  }
  .lbl {
    flex: 1;
  }
  .val {
    color: var(--text-1);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .note {
    margin-top: 6px;
    color: var(--text-3);
    font-size: 11.5px;
  }
</style>
