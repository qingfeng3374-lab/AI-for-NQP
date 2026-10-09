<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { pal } from '../stores/theme.svelte.js';
  import Legend from '../components/Legend.svelte';
  import { isEn } from '../i18n/lang.svelte.js';

  /**
   * 雷达图：axes = [名称]，series = [{ name, color, values: number[0..1] }]
   * 数值变化时多边形平滑过渡
   */
  let { axes = [], series = [], size = 340, levels = 4, fmt = (v) => `${Math.round(v * 100)}%`, ariaLabel = '' } = $props();

  const R = $derived(size / 2 - 70);
  const angle = (i) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
  const pt = (i, v) => [Math.cos(angle(i)) * R * v, Math.sin(angle(i)) * R * v];

  // 每个系列一个 Tween，数值数组平滑插值
  // svelte-ignore state_referenced_locally
  const tweens = series.map((s) => new Tween(s.values.map(() => 0), { duration: 600, easing: cubicOut }));
  $effect(() => {
    series.forEach((s, i) => (tweens[i].target = s.values));
  });
</script>

<Legend items={series.map((s) => ({ label: s.name, color: s.color, shape: 'square' }))} />
<svg viewBox="{-size / 2} {-size / 2} {size} {size}" style:max-width="{size + 40}px" role="img" aria-label={ariaLabel}>
  {#each Array(levels) as _, l}
    {@const v = (l + 1) / levels}
    <polygon points={axes.map((_, i) => pt(i, v).join(',')).join(' ')} fill="none" stroke={pal.grid} stroke-width="1" />
  {/each}
  {#each axes as a, i}
    {@const [x, y] = pt(i, 1)}
    {@const [lx, ly] = pt(i, 1.18)}
    <line x1="0" y1="0" x2={x} y2={y} stroke={pal.grid} />
    <text
      x={lx}
      y={ly}
      dy="0.35em"
      text-anchor={Math.abs(lx) < 8 ? 'middle' : lx > 0 ? 'start' : 'end'}
      class="ax">{a}</text
    >
  {/each}
  {#each series as s, si}
    {@const vals = tweens[si].current}
    <polygon
      points={vals.map((v, i) => pt(i, Math.max(0.02, v)).join(',')).join(' ')}
      fill={s.color}
      fill-opacity="0.16"
      stroke={s.color}
      stroke-width="2.2"
      stroke-linejoin="round"
    />
    {#each vals as v, i}
      {@const [x, y] = pt(i, Math.max(0.02, v))}
      <circle cx={x} cy={y} r="4" fill={s.color} stroke={pal.ring} stroke-width="1.5">
        <title>{s.name} · {axes[i]}{isEn() ? ': ' : '：'}{fmt(s.values[i])}</title>
      </circle>
    {/each}
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 auto;
    overflow: visible;
  }
  .ax {
    fill: var(--text-2);
    font-size: 12px;
    font-weight: 600;
  }
</style>
