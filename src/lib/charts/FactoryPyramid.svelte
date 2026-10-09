<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { scaleLog } from 'd3';
  import { SMART_FACTORY } from '../../data/industry.js';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /** 智能工厂梯度培育金字塔：层宽按数量的对数刻度，颜色为有序单色阶 */
  let shown = $state(false);
  // 有序色阶（深色背景：越高阶越亮）
  // 有序色阶：深色主题高阶更亮，日间主题高阶更深
  const RAMP = $derived(pal.ordinal);
  const w = scaleLog().domain([10, 40000]).range([22, 100]);
</script>

<div class="pyr" use:inview={{ onEnter: () => (shown = true) }}>
  {#each SMART_FACTORY as t, i}
    <div class="tier">
      <div
        class="block"
        role="img"
        aria-label="{tr('{tier}智能工厂', { tier: tr(t.tier) })} {tr(t.text)}"
        style:width={shown ? `${w(t.count)}%` : '0%'}
        style:background={RAMP[i]}
        style:transition-delay="{(SMART_FACTORY.length - i) * 150}ms"
        onpointerenter={(e) => showTip(e, { title: tr('{tier}智能工厂', { tier: tr(t.tier) }), rows: [{ label: tr('数量'), value: tr(t.text), color: RAMP[i] }] })}
        onpointermove={moveTip}
        onpointerleave={hideTip}
      >
        <span class="tn" class:dark={pal.mode === 'dark' ? i < 2 : i >= 2}>{tr(t.tier)}</span>
      </div>
      <span class="tc">{tr(t.text)}</span>
    </div>
  {/each}
  <div class="axis-note">{tr('层宽按数量的对数刻度绘制')}</div>
</div>

<style>
  .pyr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0;
  }
  .tier {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 84px;
    align-items: center;
    gap: 10px;
  }
  .tier > .block {
    justify-self: center;
  }
  .block {
    height: 40px;
    border-radius: 4px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1);
    overflow: hidden;
    max-width: 100%;
  }
  .block:hover {
    filter: brightness(1.12);
  }
  .tn {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-1);
    white-space: nowrap;
  }
  .tn.dark {
    color: #0a0f1f;
  }
  .tc {
    font-size: 12.5px;
    color: var(--text-1);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .axis-note {
    margin-top: 6px;
    margin-right: 94px;
    font-size: 11px;
    color: var(--text-3);
  }
</style>
