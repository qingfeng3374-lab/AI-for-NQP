<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { hierarchy, tree, linkRadial } from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { CHAIN } from '../../data/industry.js';

  /**
   * 可折叠径向树：AI 产业链图谱
   * 技巧：始终布局完整节点集合，被折叠的子孙节点"收拢"到最近的可见祖先处，
   * 这样节点集合恒定，可用 Tween 平滑插值所有坐标。
   */
  let width = $state(600);
  const size = $derived(Math.min(Math.max(width, 320), 680));
  const radius = $derived(size / 2 - (size < 480 ? 64 : 92));

  const full = hierarchy(CHAIN);
  full.each((n, i) => {
    n.uid = i;
    n.branch = n.depth === 0 ? -1 : n.ancestors().find((a) => a.depth === 1).parent.children.indexOf(n.ancestors().find((a) => a.depth === 1));
  });
  const all = full.descendants();

  // 默认折叠第三层（只展开到二级）
  let collapsed = $state(new Set(all.filter((n) => n.depth === 2 && n.children).map((n) => n.uid)));
  let focusBranch = $state(-1);

  // 计算布局：返回每个节点的 [angle, r, visible]
  const layout = $derived.by(() => {
    // 与 full 相同的遍历顺序赋 uid，再剪掉折叠节点的子树
    const map = new Map();
    const pruned = hierarchy(CHAIN, (d) => d.children);
    pruned.each((n, i) => {
      n.uid = i;
    });
    pruned.each((n) => {
      if (collapsed.has(n.uid)) n.children = undefined;
    });
    const t = tree()
      .size([2 * Math.PI, 1])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    t(pruned);
    pruned.each((n) => map.set(n.uid, [n.x, n.y]));
    return all.map((n) => {
      if (map.has(n.uid)) return [...map.get(n.uid), 1];
      // 隐藏节点：位于最近可见祖先处
      const anc = n.ancestors().find((a) => map.has(a.uid));
      return [...map.get(anc.uid), 0];
    });
  });

  const pos = Tween.of(() => layout, { duration: 800, easing: cubicInOut });
  const P = $derived(pos.current);
  const link = linkRadial()
    .angle((d) => d[0])
    .radius((d) => d[1]);

  function color(n) {
    return n.depth === 0 ? pal.text1 : pal.series[[0, 1, 2][n.branch] ?? 0];
  }
  function toggle(n) {
    if (!n.children) return;
    const s = new Set(collapsed);
    if (s.has(n.uid)) s.delete(n.uid);
    else s.add(n.uid);
    collapsed = s;
  }
  function expandAll() {
    collapsed = new Set();
  }
  function collapseAll() {
    collapsed = new Set(all.filter((n) => n.depth === 2 && n.children).map((n) => n.uid));
  }
  const xy = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r];
</script>

<div class="toolbar">
  <div class="seg">
    <button onclick={collapseAll}>{tr('收起细分')}</button>
    <button onclick={expandAll}>{tr('全部展开')}</button>
  </div>
  <span class="hint">{tr('点击带 ⊕ 的节点展开 / 收起 · 悬停高亮所属层级')}</span>
</div>

<div class="wrap" bind:clientWidth={width}>
  <svg width={size} height={size} viewBox="{-size / 2} {-size / 2} {size} {size}" role="img" aria-label={tr('人工智能产业链径向树图')}>
    <!-- 层级圆环 -->
    {#each [1 / 3, 2 / 3, 1] as k}
      <circle r={radius * k} fill="none" stroke={pal.grid} />
    {/each}

    {#each all as n}
      {#if n.parent}
        {@const a = P[n.uid]}
        {@const b = P[n.parent.uid]}
        <path
          d={link({ source: [b[0], b[1] * radius], target: [a[0], a[1] * radius] })}
          fill="none"
          stroke={color(n)}
          stroke-width={n.depth === 1 ? 2 : 1.2}
          stroke-opacity={a[2] * (focusBranch === -1 || focusBranch === n.branch ? 0.55 : 0.1)}
        />
      {/if}
    {/each}

    {#each all as n}
      {@const a = P[n.uid]}
      {@const [cx, cy] = xy(a[0], a[1] * radius)}
      {@const deg = (a[0] * 180) / Math.PI - 90}
      {@const flip = a[0] > Math.PI}
      {@const dim = focusBranch !== -1 && focusBranch !== n.branch && n.depth > 0}
      <g
        transform="translate({cx},{cy})"
        opacity={a[2] * (dim ? 0.25 : 1)}
        class="node"
        class:clickable={!!n.children}
        role="button"
        tabindex={n.children && a[2] ? 0 : -1}
        aria-disabled={!n.children}
        aria-label={tr(n.data.name)}
        onclick={() => toggle(n)}
        onkeydown={(e) => e.key === 'Enter' && toggle(n)}
        onpointerenter={() => (focusBranch = n.depth > 0 ? n.branch : -1)}
        onpointerleave={() => (focusBranch = -1)}
      >
        {#if n.depth === 0}
          <circle r="46" fill={pal.ring} stroke="url(#ict-g)" stroke-width="2" />
          <text text-anchor="middle" dy="-4" class="root-t">{tr('人工智能')}</text>
          <text text-anchor="middle" dy="16" class="root-s">{tr('产业链')}</text>
        {:else if n.depth === 1}
          <circle r="30" fill={pal.ring} stroke={color(n)} stroke-width="2" />
          <text text-anchor="middle" dy="-1" class="l1">{tr(n.data.name)}</text>
          <text text-anchor="middle" dy="14" class="l1s">{tr(n.data.desc)}</text>
        {:else}
          <circle r={n.children ? 5 : 3.5} fill={collapsed.has(n.uid) ? color(n) : pal.ring} stroke={color(n)} stroke-width="1.6" />
          <text
            transform="rotate({flip ? deg + 180 : deg})"
            x={flip ? -9 : 9}
            dy="0.35em"
            text-anchor={flip ? 'end' : 'start'}
            class="lbl"
            class:l2={n.depth === 2}>{tr(n.data.name)}{n.children && collapsed.has(n.uid) ? ' ⊕' : ''}</text
          >
        {/if}
      </g>
    {/each}
    <defs>
      <linearGradient id="ict-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color={pal.accent} /><stop offset="1" stop-color={pal.accent2} />
      </linearGradient>
    </defs>
  </svg>
</div>

<style>
  .toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .hint {
    font-size: 12px;
    color: var(--text-3);
  }
  .wrap {
    display: flex;
    justify-content: center;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .node {
    transition: opacity 0.3s;
  }
  .node.clickable {
    cursor: pointer;
  }
  .root-t {
    fill: var(--text-1);
    font-weight: 700;
    font-size: 15px;
  }
  .root-s {
    fill: var(--text-2);
    font-size: 12px;
  }
  .l1 {
    fill: var(--text-1);
    font-weight: 700;
    font-size: 13px;
  }
  .l1s {
    fill: var(--text-3);
    font-size: 8.5px;
  }
  .lbl {
    fill: var(--text-2);
    font-size: 11px;
  }
  .lbl.l2 {
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 600;
  }
  .node:hover .lbl {
    fill: var(--accent);
  }
</style>
