<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { scaleLinear } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { DC_ELECTRICITY } from '../../data/green.js';
  import { inview } from '../actions/inview.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import Legend from '../components/Legend.svelte';

  /** 数据中心用电：2024 年按区域堆叠 + 2030 / 2035 基准情景 */
  let width = $state(500);
  const g = new Tween(0, { duration: 1400, easing: cubicOut });
  const COLORS = $derived({ us: pal.series[0], cn: pal.series[1], eu: pal.series[2], ot: pal.series[3] });
  const rowH = 46;
  const labelW = 64;
  const iw = $derived(Math.max(10, width - labelW - 70));
  const x = $derived(scaleLinear().domain([0, 1250]).range([0, iw]));
  const rows = [
    { label: '2024', total: DC_ELECTRICITY.total2024, stack: DC_ELECTRICITY.y2024 },
    { label: '2030', total: DC_ELECTRICITY.total2030, proj: true },
    { label: '2035', total: DC_ELECTRICITY.total2035, proj: true },
  ];
</script>

<Legend
  items={[
    ...DC_ELECTRICITY.y2024.map((d) => ({ label: tr('{n}（2024）', { n: tr(d.name) }), color: COLORS[d.key] })),
    { label: tr('基准情景预测'), color: pal.muted },
  ]}
/>
<div bind:clientWidth={width} use:inview={{ onEnter: () => (g.target = 1) }}>
  <svg {width} height={rows.length * rowH + 26} role="img" aria-label={tr('全球数据中心用电量')}>
    <g transform="translate({labelW},0)">
      {#each [0, 400, 800, 1200] as t}
        <line class="gridline" x1={x(t)} x2={x(t)} y1="0" y2={rows.length * rowH} />
        <text class="tk" x={x(t)} y={rows.length * rowH + 16} text-anchor="middle">{t}</text>
      {/each}
      {#each rows as r, i}
        {@const y = i * rowH + 8}
        <text x="-10" y={y + 15} dy="0.35em" text-anchor="end" class="yl">{r.label}{r.proj ? '*' : ''}</text>
        {#if r.stack}
          {@const acc = r.stack.reduce((a, d) => (a.push((a.at(-1) ?? 0) + d.value), a), [])}
          {#each r.stack as d, j}
            {@const x0 = x((acc[j] - d.value) * g.current)}
            {@const x1 = x(acc[j] * g.current)}
            <rect
              x={x0 + (j > 0 ? 1 : 0)}
              {y}
              width={Math.max(0, x1 - x0 - (j > 0 ? 2 : 0))}
              height="30"
              rx={j === r.stack.length - 1 ? 4 : 0}
              fill={COLORS[d.key]}
              role="img"
              aria-label={tr('{n} {v} 太瓦时', { n: tr(d.name), v: d.value })}
              onpointerenter={(e) => showTip(e, { title: tr('2024 年 · {n}', { n: tr(d.name) }), rows: [{ label: tr('数据中心用电'), value: tr('约 {v} TWh', { v: d.value }), color: COLORS[d.key] }], note: tr('占全球数据中心用电 {p}%', { p: Math.round((d.value / 415) * 100) }) })}
              onpointermove={moveTip}
              onpointerleave={hideTip}
            />
          {/each}
        {:else}
          <rect {y} width={x(r.total * g.current)} height="30" rx="4" fill={pal.muted} stroke={pal.text3} stroke-width="1.2" stroke-dasharray="4 3" />
        {/if}
        <text x={x(r.total * g.current) + 8} y={y + 15} dy="0.35em" class="vl">{r.total} TWh</text>
      {/each}
    </g>
  </svg>
</div>
<p class="fn">{tr('* IEA 基准情景预测。2024 年数据中心用电约占全球用电的 {s}%，到 2030 年将增长约 1.3 倍。', { s: DC_ELECTRICITY.share2024 })}</p>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
  }
  .yl {
    fill: var(--text-2);
    font-size: 13px;
    font-weight: 600;
  }
  .vl {
    fill: var(--text-1);
    font-size: 12.5px;
    font-weight: 700;
  }
  rect[role='img'] {
    cursor: pointer;
  }
  .fn {
    font-size: 12px;
    color: var(--text-3);
    margin: 6px 0 0;
  }
</style>
