<script>
  import { pal } from '../stores/theme.svelte.js';
  import { scaleLinear } from 'd3';
  import { SKILL_GAP } from '../../data/efficiency.js';
  import Legend from '../components/Legend.svelte';
  import { inview } from '../actions/inview.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  /** 斜率图：AI 对低技能劳动者的提升更大 —— "技能差距压缩" */
  let width = $state(360);
  const height = 250;
  const m = { top: 24, right: 70, bottom: 30, left: 70 };
  const g = new Tween(0, { duration: 1400, easing: cubicOut });
  const iw = $derived(Math.max(10, width - m.left - m.right));
  const ih = height - m.top - m.bottom;
  const y = scaleLinear().domain([0, 50]).range([ih, 0]);
  const colors = $derived([pal.series[0], pal.series[1]]);
</script>

<Legend items={SKILL_GAP.map((s, i) => ({ label: tr(s.study), color: colors[i], shape: 'line' }))} />
<div bind:clientWidth={width} use:inview={{ onEnter: () => (g.target = 1) }}>
  <svg {width} {height} role="img" aria-label={tr('不同技能劳动者使用 AI 后的生产率提升斜率图')}>
    <g transform="translate({m.left},{m.top})">
      {#each [0, 25, 50] as t}
        <line class="gridline" x1="0" x2={iw} y1={y(t)} y2={y(t)} />
        <text class="tk" x={-10} y={y(t)} dy="0.32em" text-anchor="end">+{t}%</text>
      {/each}
      <line x1="0" x2="0" y1="0" y2={ih} stroke={pal.axis} />
      <line x1={iw} x2={iw} y1="0" y2={ih} stroke={pal.axis} />
      <text class="col" x="0" y={ih + 20} text-anchor="middle">{tr('低技能 / 新手')}</text>
      <text class="col" x={iw} y={ih + 20} text-anchor="middle">{tr('高技能 / 资深')}</text>

      {#each SKILL_GAP as s, i}
        {@const y0 = y(s.low * g.current)}
        {@const y1 = y(s.high * g.current)}
        <line x1="0" y1={y0} x2={iw} y2={y1} stroke={colors[i]} stroke-width="2.5" />
        <circle cx="0" cy={y0} r="6" fill={colors[i]} stroke={pal.ring} stroke-width="2" />
        <circle cx={iw} cy={y1} r="6" fill={colors[i]} stroke={pal.ring} stroke-width="2" />
        <text x="12" y={y0 - 10} class="v">+{s.low}%</text>
        <text x={iw + 12} y={y1} dy="0.35em" class="v">+{s.high}%</text>
      {/each}
    </g>
  </svg>
</div>
<p class="note">
  {@html tr('AI 把高绩效员工的隐性经验"编码"进模型，再传递给新手——这意味着<b>人力资本的积累被加速</b>，这正是新质生产力中"劳动者跃升"的微观证据。')}
</p>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
  }
  .col {
    fill: var(--text-2);
    font-size: 12px;
  }
  .v {
    fill: var(--text-1);
    font-size: 13px;
    font-weight: 700;
  }
  .note {
    font-size: 13px;
    color: var(--text-2);
    margin: 8px 0 0;
  }
  .note :global(b) {
    color: var(--text-1);
  }
</style>
