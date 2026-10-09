<script>
  import { EXPERIMENTS } from '../../data/efficiency.js';
  import { inview } from '../actions/inview.js';
  import { tr } from '../i18n/lang.svelte.js';

  /** 实验证据：各研究的效率提升幅度（HTML 条形，便于响应式） */
  let shown = $state(false);
  let open = $state('bcg');
  const MAX = 70;
</script>

<div class="list" use:inview={{ onEnter: () => (shown = true) }}>
  <div class="scale" aria-hidden="true">
    <span></span>
    <div class="ticks">
      {#each [0, 20, 40, 60] as t}<span style:left="{(t / MAX) * 100}%">+{t}%</span>{/each}
    </div>
  </div>
  {#each EXPERIMENTS as ex, i}
    <button class="row" class:open={open === ex.id} onclick={() => (open = open === ex.id ? '' : ex.id)} aria-expanded={open === ex.id}>
      <div class="meta">
        <div class="who">{tr(ex.who)}</div>
        <div class="st">{tr(ex.study)}</div>
      </div>
      <div class="bars">
        {#each ex.metrics as mt, j}
          <div class="bar-row">
            <div class="track">
              {#each [20, 40] as g}<span class="grid" style:left="{(g / MAX) * 100}%"></span>{/each}
              <div
                class="bar"
                style:width={shown ? `${(mt.value / MAX) * 100}%` : '0%'}
                style:transition-delay="{i * 120 + j * 80}ms"
              ></div>
              <span class="v" style:left={shown ? `${(mt.value / MAX) * 100}%` : '0%'} style:transition-delay="{i * 120 + j * 80}ms"
                >+{mt.value}%</span
              >
            </div>
            <span class="mn">{tr(mt.name)}</span>
          </div>
        {/each}
      </div>
      {#if open === ex.id}
        <div class="detail">
          <span class="venue">{tr(ex.venue)} · {tr('样本')} {tr(ex.n)}</span>
          {tr(ex.detail)}
        </div>
      {/if}
    </button>
  {/each}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .scale {
    display: grid;
    grid-template-columns: 170px 1fr;
    gap: 14px;
  }
  .ticks {
    position: relative;
    height: 16px;
    margin-right: 96px;
  }
  .ticks span {
    position: absolute;
    transform: translateX(-50%);
    font-size: 11px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .row {
    display: grid;
    grid-template-columns: 170px 1fr;
    gap: 14px;
    align-items: center;
    text-align: left;
    padding: 10px 0;
    border: 0;
    border-top: 1px solid var(--border);
    background: transparent;
    border-radius: 0;
  }
  .row:hover .who {
    color: var(--accent);
  }
  .who {
    font-weight: 650;
    font-size: 14px;
    color: var(--text-1);
    transition: color 0.2s;
  }
  .st {
    font-size: 11.5px;
    color: var(--text-3);
  }
  .bars {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .bar-row {
    display: grid;
    grid-template-columns: 1fr 96px;
    align-items: center;
    gap: 0;
  }
  .track {
    position: relative;
    height: 16px;
  }
  .grid {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 1px;
    background: var(--grid);
  }
  .bar {
    position: relative;
    height: 100%;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(90deg, color-mix(in srgb, var(--series-1) 55%, transparent), var(--series-1));
    transition: width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .v {
    position: absolute;
    top: 50%;
    transform: translate(8px, -50%);
    font-size: 12px;
    font-weight: 700;
    color: var(--text-1);
    font-variant-numeric: tabular-nums;
    transition: left 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    white-space: nowrap;
  }
  .mn {
    font-size: 12px;
    color: var(--text-2);
    padding-left: 52px;
    white-space: nowrap;
  }
  .detail {
    grid-column: 1 / -1;
    font-size: 13px;
    color: var(--text-2);
    padding: 10px 12px;
    border-radius: var(--radius-s);
    background: rgba(var(--accent-rgb), 0.05);
    border-left: 2px solid var(--accent);
  }
  .venue {
    display: block;
    font-size: 11.5px;
    color: var(--accent);
    margin-bottom: 2px;
  }
  @media (max-width: 600px) {
    .row,
    .scale {
      grid-template-columns: 1fr;
    }
    .scale > span {
      display: none;
    }
    .bar-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 2px;
    }
    .mn {
      order: -1;
      padding-left: 0;
      white-space: normal;
    }
    .ticks {
      margin-right: 0;
    }
  }
</style>
