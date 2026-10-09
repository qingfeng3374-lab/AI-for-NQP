<script>
  import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
  import { inview } from '../actions/inview.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /**
   * 桑基图（d3-sankey 计算布局，Svelte 渲染）
   * nodes: [{ id, name, color }]，links: [{ source, target, value }]
   */
  let { nodes = [], links = [], height = 360, unit = '', fmt = (v) => v.toLocaleString('zh-CN'), ariaLabel = '' } = $props();

  let width = $state(600);
  let shown = $state(false);
  let hoverNode = $state(null);

  const graph = $derived.by(() => {
    const gen = sankey()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(14)
      .nodePadding(22)
      .extent([
        [1, 8],
        [Math.max(200, width) - 1, height - 8],
      ]);
    return gen({ nodes: nodes.map((d) => ({ ...d })), links: links.map((d) => ({ ...d })) });
  });
  const path = sankeyLinkHorizontal();

  function related(l) {
    return !hoverNode || l.source.id === hoverNode || l.target.id === hoverNode;
  }
</script>

<div bind:clientWidth={width} use:inview={{ onEnter: () => (shown = true) }}>
  <svg {width} {height} role="img" aria-label={ariaLabel}>
    <g class="links">
      {#each graph.links as l, i}
        <path
          d={path(l)}
          stroke={l.target.color ?? l.source.color}
          stroke-width={Math.max(1, l.width)}
          fill="none"
          class="lk"
          class:shown
          style:transition-delay="{i * 120}ms"
          opacity={related(l) ? 0.42 : 0.08}
          role="img"
          aria-label="{tr(l.source.name)} → {tr(l.target.name)}{tr('：')}{fmt(l.value)}{unit}"
          onpointerenter={(e) =>
            showTip(e, {
              title: `${tr(l.source.name)} → ${tr(l.target.name)}`,
              rows: [{ label: tr('规模'), value: `${fmt(l.value)} ${unit}`, color: l.target.color ?? l.source.color }],
            })}
          onpointermove={moveTip}
          onpointerleave={hideTip}
        />
      {/each}
    </g>
    {#each graph.nodes as n}
      {@const left = n.x0 < width / 2}
      <g
        role="img"
        aria-label="{tr(n.name)} {fmt(n.value)}{unit}"
        onpointerenter={() => (hoverNode = n.id)}
        onpointerleave={() => (hoverNode = null)}
      >
        <rect x={n.x0} y={n.y0} width={n.x1 - n.x0} height={Math.max(2, n.y1 - n.y0)} rx="3" fill={n.color} />
        <text
          x={left ? n.x1 + 8 : n.x0 - 8}
          y={(n.y0 + n.y1) / 2}
          dy="-0.3em"
          text-anchor={left ? 'start' : 'end'}
          class="nm">{tr(n.name)}</text
        >
        <text
          x={left ? n.x1 + 8 : n.x0 - 8}
          y={(n.y0 + n.y1) / 2}
          dy="1em"
          text-anchor={left ? 'start' : 'end'}
          class="nv">{fmt(n.value)} {unit}</text
        >
      </g>
    {/each}
  </svg>
</div>

<style>
  svg {
    display: block;
    overflow: visible;
  }
  .lk {
    mix-blend-mode: screen;
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    transition:
      stroke-dashoffset 1.6s ease,
      opacity 0.25s;
    cursor: pointer;
  }
  .lk.shown {
    stroke-dashoffset: 0;
  }
  .nm {
    fill: var(--text-1);
    font-size: 12.5px;
    font-weight: 600;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .nv {
    fill: var(--text-2);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
</style>
