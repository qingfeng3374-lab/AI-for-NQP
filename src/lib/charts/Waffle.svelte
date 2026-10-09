<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';
  import { Tween } from 'svelte/motion';
  import { linear } from 'svelte/easing';
  import { inview } from '../actions/inview.js';

  /**
   * 单位图（华夫图）：每个方块代表一个单位
   * total: 方块总数；segments: [{ count, color, label }]（依次着色），其余为灰
   */
  let { total = 100, segments = [], cols = 10, cell = 12, gap = 3, title = '', caption = '', restLabel = '' } = $props();

  const fill = new Tween(0, { duration: 1600, easing: linear });
  const colorAt = $derived.by(() => {
    const arr = [];
    for (const s of segments) for (let i = 0; i < s.count; i++) arr.push(s.color);
    return arr;
  });
  const rows = $derived(Math.ceil(total / cols));
  const W = $derived(cols * (cell + gap) - gap);
  const H = $derived(rows * (cell + gap) - gap);
</script>

<div class="waffle" use:inview={{ onEnter: () => (fill.target = total) }}>
  {#if title}<div class="t">{title}</div>{/if}
  <svg viewBox="0 0 {W} {H}" style:max-width="{W}px" role="img" aria-label={tr('{segs}，共 {n}', { segs: `${title} ${segments.map((s) => `${s.label}${isEn() ? ' ' : ''}${s.count}`).join(isEn() ? ', ' : '，')}`, n: total })}>
    {#each Array(total) as _, i}
      {@const c = i < colorAt.length && i < fill.current ? colorAt[i] : null}
      <rect
        x={(i % cols) * (cell + gap)}
        y={Math.floor(i / cols) * (cell + gap)}
        width={cell}
        height={cell}
        rx="2.5"
        fill={c ?? pal.empty}
      />
    {/each}
  </svg>
  {#if caption}<div class="cap">{@html caption}</div>{/if}
</div>

<style>
  .waffle {
    min-width: 0;
  }
  .t {
    font-size: 13px;
    color: var(--text-2);
    margin-bottom: 8px;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .cap {
    margin-top: 8px;
    font-size: 12.5px;
    color: var(--text-3);
  }
  .cap :global(b) {
    color: var(--text-1);
    font-size: 20px;
  }
</style>
