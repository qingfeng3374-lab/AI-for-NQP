<script>
  import { pal } from '../stores/theme.svelte.js';
  import { POLICY_TIMELINE } from '../../data/concept.js';
  import Legend from '../components/Legend.svelte';
  import { tr } from '../i18n/lang.svelte.js';

  /** 政策演进时间轴：两条主线（人工智能 / 新质生产力）交汇 */
  const COLOR = $derived({ AI: pal.series[0], 新质: pal.series[2] });
  let active = $state(POLICY_TIMELINE.length - 1);
</script>

<Legend
  items={[
    { label: tr('人工智能战略'), color: COLOR.AI, shape: 'dot' },
    { label: tr('新质生产力论述'), color: COLOR['新质'], shape: 'dot' },
  ]}
/>
<div class="tl">
  <div class="rail" aria-hidden="true"></div>
  {#each POLICY_TIMELINE as ev, i}
    <button
      class="ev"
      class:on={active === i}
      style:--c={COLOR[ev.tag]}
      onmouseenter={() => (active = i)}
      onfocus={() => (active = i)}
      onclick={() => (active = i)}
    >
      <span class="date">{ev.date}</span>
      <span class="dot"></span>
      <span class="title">{tr(ev.title)}</span>
    </button>
  {/each}
</div>
<div class="detail" style:--c={COLOR[POLICY_TIMELINE[active].tag]} aria-live="polite">
  <span class="d-date">{POLICY_TIMELINE[active].date}</span>
  <strong>{tr(POLICY_TIMELINE[active].title)}</strong>
  <p>{tr(POLICY_TIMELINE[active].desc)}</p>
</div>

<style>
  .tl {
    position: relative;
    display: grid;
    grid-template-columns: repeat(8, minmax(118px, 1fr));
    gap: 8px;
    overflow-x: auto;
    padding: 4px 2px 10px;
    scrollbar-width: thin;
  }
  .rail {
    position: absolute;
    left: 0;
    right: 0;
    top: 44px;
    height: 2px;
    background: linear-gradient(90deg, rgba(var(--accent-rgb), 0.2), rgba(var(--accent2-rgb), 0.6), rgba(var(--accent-rgb), 0.85));
    min-width: 1000px;
  }
  .ev {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border: 0;
    background: transparent;
    padding: 8px 4px;
    border-radius: 10px;
    text-align: center;
    color: var(--text-2);
    transition: background 0.2s;
  }
  .ev:hover,
  .ev.on {
    background: var(--hover-wash);
  }
  .date {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .ev.on .date {
    color: var(--text-1);
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--page);
    border: 3px solid var(--c);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ev.on .dot {
    transform: scale(1.35);
    background: var(--c);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent);
  }
  .title {
    font-size: 12.5px;
    line-height: 1.45;
  }
  .detail {
    margin-top: 10px;
    padding: 14px 18px;
    border-left: 3px solid var(--c);
    background: var(--panel-bg);
    border-radius: 0 var(--radius-m) var(--radius-m) 0;
  }
  .d-date {
    font-size: 12px;
    color: var(--text-3);
    margin-right: 10px;
  }
  strong {
    color: var(--text-1);
  }
  p {
    margin: 6px 0 0;
    color: var(--text-2);
    font-size: 14px;
  }
</style>
