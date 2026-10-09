<script>
  import { onMount } from 'svelte';
  import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY, zoom, zoomIdentity, select } from 'd3';
  import { pal, slotColor } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';

  /**
   * 力导向知识图谱（d3-force 计算布局，Svelte 声明式渲染）
   * - 拖拽节点、滚轮缩放 / 拖拽平移
   * - 悬停高亮一阶邻居；选中节点后高亮其通往"新质生产力"的最短路径
   */
  let {
    nodes: rawNodes = [],
    links: rawLinks = [],
    groups = [],
    hidden = new Set(),
    selected = $bindable(null),
    path = [],
    height = 640,
  } = $props();

  let width = $state(900);
  let svgEl;
  let hover = $state(null);
  let tf = $state({ x: 0, y: 0, k: 1 });
  let pos = $state.raw([]); // 每次 tick 重新赋值 → 驱动重绘

  // 图谱数据在挂载时一次性读取（静态），无需响应式
  // svelte-ignore state_referenced_locally
  const groupOf = Object.fromEntries(groups.map((g) => [g.id, g]));
  // svelte-ignore state_referenced_locally
  const nodes = rawNodes.map((n) => ({ ...n }));
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  // svelte-ignore state_referenced_locally
  const links = rawLinks.map(([s, t, label]) => ({ source: s, target: t, label, si: index.get(s), ti: index.get(t) }));
  const radius = (n) => 6 + n.size * 5;

  // 邻接表（无向）
  const nbr = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const l of links) {
    nbr.get(l.source).add(l.target);
    nbr.get(l.target).add(l.source);
  }

  // 分组锚点（相对画布半宽 / 半高）：让同组节点聚拢，结构更易读
  const ANCHOR = {
    core: [0, 0.02],
    element: [-0.05, -0.12],
    tech: [-0.58, -0.2],
    infra: [-0.5, 0.5],
    industry: [0.55, -0.05],
    outcome: [0.3, 0.58],
    policy: [0.05, -0.68],
  };

  let sim;
  onMount(() => {
    const w = width;
    const h = height;
    nodes.forEach((n) => {
      const a = ANCHOR[n.group];
      n.x = w / 2 + a[0] * w * 0.45 + (Math.random() - 0.5) * 40;
      n.y = h / 2 + a[1] * h * 0.45 + (Math.random() - 0.5) * 40;
    });
    sim = forceSimulation(nodes)
      .force('link', forceLink(links.map((l) => ({ source: l.si, target: l.ti }))).distance(70).strength(0.35))
      .force('charge', forceManyBody().strength(-320))
      .force('collide', forceCollide((n) => radius(n) + 14))
      .force('x', forceX((n) => width / 2 + ANCHOR[n.group][0] * width * 0.42).strength(0.09))
      .force('y', forceY((n) => height / 2 + ANCHOR[n.group][1] * height * 0.42).strength(0.12))
      .on('tick', () => {
        pos = nodes.map((n) => [n.x, n.y]);
      });

    const z = zoom()
      .scaleExtent([0.4, 3])
      .filter((e) => !e.target.closest?.('.node') && (!e.button || e.type === 'wheel'))
      .on('zoom', (e) => (tf = { x: e.transform.x, y: e.transform.y, k: e.transform.k }));
    const svg = select(svgEl).call(z);
    svg.on('dblclick.zoom', null);
    zoomTo = (n) => {
      const k = Math.max(1.2, tf.k);
      svg.transition().duration(700).call(z.transform, zoomIdentity.translate(width / 2 - n.x * k, height / 2 - n.y * k).scale(k));
    };
    resetZoom = () => svg.transition().duration(600).call(z.transform, zoomIdentity);
    return () => sim.stop();
  });

  // 外部可调用：聚焦某节点 / 重置视图
  let zoomTo = () => {};
  let resetZoom = () => {};
  export function focusNode(id) {
    const n = nodes[index.get(id)];
    if (n) zoomTo(n);
  }
  export function reset() {
    resetZoom();
  }

  // 拖拽（指针事件 + 指针捕获）
  let drag = null;
  function down(e, i) {
    e.stopPropagation();
    const n = nodes[i];
    drag = { i, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    n.fx = n.x;
    n.fy = n.y;
    sim.alphaTarget(0.25).restart();
  }
  function move(e) {
    if (!drag) return;
    const r = svgEl.getBoundingClientRect();
    const n = nodes[drag.i];
    n.fx = (e.clientX - r.left - tf.x) / tf.k;
    n.fy = (e.clientY - r.top - tf.y) / tf.k;
    drag.moved = true;
  }
  function up(i) {
    if (!drag) return;
    const n = nodes[i];
    if (!drag.moved) selected = selected === n.id ? null : n.id;
    n.fx = null;
    n.fy = null;
    sim.alphaTarget(0);
    drag = null;
  }

  // 高亮逻辑
  const focusId = $derived(hover ?? selected);
  const pathSet = $derived(new Set(path));
  const pathEdges = $derived.by(() => {
    const s = new Set();
    for (let i = 0; i < path.length - 1; i++) s.add([path[i], path[i + 1]].sort().join('|'));
    return s;
  });
  function nodeOpacity(n) {
    if (hidden.has(n.group)) return 0.06;
    if (!focusId) return 1;
    if (n.id === focusId || nbr.get(focusId)?.has(n.id) || pathSet.has(n.id)) return 1;
    return 0.28;
  }
  function linkState(l) {
    const a = rawNodes[l.si];
    const b = rawNodes[l.ti];
    if (hidden.has(a.group) || hidden.has(b.group)) return 'off';
    if (pathEdges.has([l.source, l.target].sort().join('|'))) return 'path';
    if (!focusId) return 'idle';
    return l.source === focusId || l.target === focusId ? 'on' : 'dim';
  }
</script>

<div class="fg" bind:clientWidth={width}>
  <svg bind:this={svgEl} {width} {height} role="img" aria-label={tr('人工智能与新质生产力知识图谱')}>
    <defs>
      <marker id="fg-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={pal.text3} />
      </marker>
      <marker id="fg-arrow-hl" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={pal.accent} />
      </marker>
      <filter id="fg-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g transform="translate({tf.x},{tf.y}) scale({tf.k})">
      {#if pos.length}
        <!-- 连线：终点回缩到目标节点边缘，以便显示箭头 -->
        {#each links as l}
          {@const st = linkState(l)}
          {#if st !== 'off'}
            {@const [x1, y1] = pos[l.si]}
            {@const [x2, y2] = pos[l.ti]}
            {@const d = Math.hypot(x2 - x1, y2 - y1) || 1}
            {@const rt = radius(nodes[l.ti]) + 3}
            <line
              {x1}
              {y1}
              x2={x2 - ((x2 - x1) / d) * rt}
              y2={y2 - ((y2 - y1) / d) * rt}
              stroke={st === 'path' || st === 'on' ? pal.accent : pal.axis}
              stroke-width={st === 'path' ? 3 : st === 'on' ? 1.8 : 1.1}
              stroke-opacity={st === 'dim' ? 0.15 : st === 'idle' ? 0.7 : 1}
              marker-end={st === 'path' || st === 'on' ? 'url(#fg-arrow-hl)' : 'url(#fg-arrow)'}
              filter={st === 'path' ? 'url(#fg-glow)' : undefined}
              class:flow={st === 'path'}
            />
            {#if (st === 'on' || st === 'path') && l.label}
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} dy="-4" text-anchor="middle" class="ll">{tr(l.label)}</text>
            {/if}
          {/if}
        {/each}

        {#each nodes as n, i}
          {@const [x, y] = pos[i]}
          {@const c = slotColor(groupOf[n.group].slot)}
          {@const r = radius(n)}
          {@const isSel = selected === n.id}
          <g
            class="node"
            transform="translate({x},{y})"
            opacity={nodeOpacity(n)}
            role="button"
            tabindex={hidden.has(n.group) ? -1 : 0}
            aria-label={tr('{name}：{desc}', { name: tr(n.name), desc: tr(n.desc) })}
            onpointerdown={(e) => down(e, i)}
            onpointermove={move}
            onpointerup={() => up(i)}
            onpointerenter={() => (hover = n.id)}
            onpointerleave={() => (hover = null)}
            onkeydown={(e) => e.key === 'Enter' && (selected = n.id)}
          >
            {#if isSel || pathSet.has(n.id)}
              <circle r={r + 7} fill="none" stroke={pal.accent} stroke-width="2" class="pulse" />
            {/if}
            <circle {r} fill={n.group === 'core' ? pal.ring : c} stroke={n.group === 'core' ? c : pal.ring} stroke-width={n.group === 'core' ? 3 : 2} />
            {#if n.group === 'core'}
              <circle r={r * 0.55} fill={c} opacity="0.85" />
            {/if}
            <text y={r + 14} text-anchor="middle" class="nl" class:big={n.size >= 1.9}>{tr(n.name)}</text>
          </g>
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  .fg {
    position: relative;
    border-radius: var(--radius-m);
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 45%, rgba(var(--accent-rgb), 0.07), transparent 60%),
      var(--panel-bg);
    border: 1px solid var(--border);
  }
  svg {
    display: block;
    cursor: grab;
    touch-action: none;
  }
  svg:active {
    cursor: grabbing;
  }
  .node {
    cursor: pointer;
    transition: opacity 0.25s;
    outline: none;
  }
  .node:focus-visible circle {
    stroke: var(--accent);
  }
  .nl {
    fill: var(--text-1);
    font-size: 11.5px;
    font-weight: 600;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3.5px;
    pointer-events: none;
  }
  .nl.big {
    font-size: 13.5px;
    font-weight: 800;
  }
  .ll {
    fill: var(--accent);
    font-size: 10.5px;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
    pointer-events: none;
  }
  .flow {
    stroke-dasharray: 8 6;
    animation: flow 0.9s linear infinite;
  }
  @keyframes flow {
    to {
      stroke-dashoffset: -14;
    }
  }
  .pulse {
    animation: pulse 1.6s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes pulse {
    50% {
      opacity: 0.35;
      transform: scale(1.12);
    }
  }
</style>
