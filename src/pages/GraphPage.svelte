<script>
  import PageHeader from '../lib/components/PageHeader.svelte';
  import ChartCard from '../lib/components/ChartCard.svelte';
  import ForceGraph from '../lib/charts/ForceGraph.svelte';
  import HBarRank from '../lib/charts/HBarRank.svelte';
  import { GROUPS, NODES, LINKS } from '../data/graph.js';
  import { pal, slotColor } from '../lib/stores/theme.svelte.js';
  import { tr, isEn } from '../lib/i18n/lang.svelte.js';

  let graph;
  let selected = $state('agent');
  let query = $state('');
  let hidden = $state(new Set());

  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const groupOf = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

  // 无向邻接表 + BFS 最短路径（选中节点 → 新质生产力）
  const adj = new Map(NODES.map((n) => [n.id, []]));
  for (const [s, t, label] of LINKS) {
    adj.get(s).push({ id: t, label, dir: 'out' });
    adj.get(t).push({ id: s, label, dir: 'in' });
  }
  // 优先沿关系方向（因 → 果）搜索；若不存在有向路径，再退化为无向搜索
  function bfs(from, to, directed) {
    const prev = new Map([[from, null]]);
    const q = [from];
    while (q.length) {
      const cur = q.shift();
      if (cur === to) break;
      for (const { id, dir } of adj.get(cur)) {
        if (directed && dir !== 'out') continue;
        if (!prev.has(id)) (prev.set(id, cur), q.push(id));
      }
    }
    if (!prev.has(to)) return [];
    const p = [];
    for (let c = to; c; c = prev.get(c)) p.unshift(c);
    return p;
  }
  function shortestPath(from, to) {
    if (!from) return [];
    const d = bfs(from, to, true);
    return d.length ? d : bfs(from, to, false);
  }
  const path = $derived(selected && selected !== 'np' ? shortestPath(selected, 'np') : []);
  const sel = $derived(selected ? byId[selected] : null);
  const conns = $derived(selected ? adj.get(selected) : []);

  // 度中心性：连接数最多的节点 = 图谱中的关键枢纽
  const degree = NODES.map((n) => ({ id: n.id, name: n.name, value: adj.get(n.id).length }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  // 渲染用：节点名称随语言切换
  const degreeView = $derived(degree.map((d) => ({ ...d, name: tr(d.name) })));

  // 搜索同时匹配中文名与译名
  const matches = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return NODES.filter((n) => n.name.toLowerCase().includes(q) || tr(n.name).toLowerCase().includes(q));
  });
  function pick(id) {
    selected = id;
    graph?.focusNode(id);
  }
  function toggleGroup(id) {
    const s = new Set(hidden);
    s.has(id) ? s.delete(id) : s.add(id);
    hidden = s;
  }
</script>

<PageHeader
  kicker="Knowledge Graph"
  title={tr('新质生产力知识图谱')}
  lead={tr('人工智能是一种<b>通用目的技术</b>：它不只作用于单一环节，而是同时连接技术、基础设施、生产力三要素、千行百业与发展目标。点击任一节点，查看它<b>通往「新质生产力」的路径</b>。')}
/>

<div class="container">
  <div class="toolbar">
    <div class="search">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
        ><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg
      >
      <input
        type="search"
        placeholder={tr('搜索节点，如：大模型、智能制造…')}
        bind:value={query}
        onkeydown={(e) => e.key === 'Enter' && matches[0] && pick(matches[0].id)}
        aria-label={tr('搜索节点')}
      />
      {#if matches.length}
        <ul class="sugg">
          {#each matches.slice(0, 6) as m}
            <li><button onclick={() => (pick(m.id), (query = ''))}><i style:background={slotColor(groupOf[m.group].slot)}></i>{tr(m.name)}</button></li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="chips" role="group" aria-label={tr('按分组显示')}>
      {#each GROUPS as g}
        <button class="chip" class:off={hidden.has(g.id)} onclick={() => toggleGroup(g.id)} aria-pressed={!hidden.has(g.id)}>
          <i style:background={slotColor(g.slot)}></i>{tr(g.name)}
        </button>
      {/each}
    </div>
    <button class="reset" onclick={() => (graph?.reset(), (selected = null))}>{tr('重置视图')}</button>
  </div>

  <div class="layout">
    <div class="graph-wrap">
      <ForceGraph bind:this={graph} nodes={NODES} links={LINKS} groups={GROUPS} {hidden} bind:selected {path} height={660} />
      <div class="hint">{tr('拖拽节点 · 滚轮缩放 · 拖动空白处平移 · 点击节点查看路径')}</div>
    </div>

    <aside class="panel" aria-live="polite">
      {#if sel}
        <span class="g" style:--c={slotColor(groupOf[sel.group].slot)}>{tr(groupOf[sel.group].name)}</span>
        <h2>{tr(sel.name)}</h2>
        <p class="desc">{tr(sel.desc)}</p>
        {#if sel.fact}<div class="fact"><span>{tr('关键数据')}</span>{tr(sel.fact)}</div>{/if}

        {#if path.length > 1}
          <div class="sec">{tr('通往「新质生产力」的路径 · {n} 步', { n: path.length - 1 })}</div>
          <ol class="path">
            {#each path as id, i}
              <li>
                <button onclick={() => pick(id)} style:--c={slotColor(groupOf[byId[id].group].slot)}>{tr(byId[id].name)}</button>
                {#if i < path.length - 1}<span class="arr">↓</span>{/if}
              </li>
            {/each}
          </ol>
        {/if}

        <div class="sec">{tr('直接关联 · {n} 个', { n: conns.length })}</div>
        <ul class="conns">
          {#each conns as c}
            <li>
              <button onclick={() => pick(c.id)}>
                <i style:background={slotColor(groupOf[byId[c.id].group].slot)}></i>
                <span class="cn">{tr(byId[c.id].name)}</span>
                <span class="cl">{c.dir === 'out' ? '→' : '←'} {tr(c.label || '关联')}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <h2>{tr('图谱概览')}</h2>
        <p class="desc">
          {tr('共 {n} 个节点、{m} 条关系。连接数越多的节点，越是贯通全局的「枢纽」——{top}位居前列，正对应 AI 作为通用目的技术「一处突破、处处赋能」的特征。', {
            n: NODES.length,
            m: LINKS.length,
            top: degreeView.slice(0, 3).map((d) => d.name).join(isEn() ? ', ' : '、'),
          })}
        </p>
      {/if}
    </aside>
  </div>

  <div class="below">
    <ChartCard
      title={tr('关键枢纽：节点连接数排名')}
      subtitle={tr('度中心性（与该节点直接相连的节点数）。点击左侧图谱中的节点可查看其关联')}
      source={tr('根据本页知识图谱结构计算')}
      table={{ columns: [tr('节点'), tr('连接数')], rows: degreeView.map((d) => [d.name, d.value]) }}
    >
      <HBarRank data={degreeView} highlight={degreeView.slice(0, 3).map((d) => d.name)} color={pal.accent} unit={tr('个')} rowH={28} labelW={110} ariaLabel={tr('节点连接数排名')} />
    </ChartCard>
    <ChartCard title={tr('如何阅读这张图')} subtitle={tr('从左到右，是一条「技术 → 要素 → 产业 → 意义」的价值链')}>
      <ol class="howto">
        <li>{@html tr('<b>左侧</b>：AI 技术与新型基础设施（算力、数据、芯片）——新质生产力的「技术革命性突破」。')}</li>
        <li>{@html tr('<b>中心</b>：劳动者、劳动资料、劳动对象经由「优化组合」汇聚到全要素生产率——新质生产力的核心标志。')}</li>
        <li>{@html tr('<b>右侧</b>：千行百业的应用场景——「产业深度转型升级」。')}</li>
        <li>{@html tr('<b>底部</b>：效率、新兴产业、绿色、就业与普惠——最终指向高质量发展。')}</li>
        <li>{@html tr('<b>顶部</b>：政策制度为整个网络提供方向与护栏。')}</li>
      </ol>
    </ChartCard>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    align-items: center;
    margin-bottom: 14px;
  }
  .search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text-3);
    flex: 0 1 300px;
  }
  .search input {
    border: 0;
    outline: none;
    background: transparent;
    color: var(--text-1);
    font: inherit;
    font-size: 13.5px;
    width: 100%;
  }
  .sugg {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;
    list-style: none;
    margin: 0;
    padding: 6px;
    border-radius: var(--radius-m);
    background: var(--surface-1);
    border: 1px solid var(--border-strong);
    box-shadow: var(--card-shadow);
  }
  .sugg button {
    width: 100%;
    text-align: left;
    border: 0;
    background: transparent;
    padding: 6px 8px;
    border-radius: 8px;
    color: var(--text-1);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sugg button:hover {
    background: var(--hover-wash);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: 12.5px;
  }
  .chip.off {
    opacity: 0.4;
  }
  i {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex: none;
  }
  .reset {
    margin-left: auto;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text-2);
    font-size: 12.5px;
  }
  .reset:hover {
    color: var(--accent);
    border-color: var(--accent);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 20px;
    align-items: start;
  }
  .graph-wrap {
    min-width: 0;
  }
  .hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-3);
  }
  .panel {
    position: sticky;
    top: 76px;
    padding: 20px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    max-height: calc(100vh - 96px);
    overflow: auto;
  }
  .g {
    display: inline-block;
    font-size: 11.5px;
    padding: 1px 10px;
    border-radius: 999px;
    color: var(--text-1);
    background: color-mix(in srgb, var(--c) 22%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
  }
  h2 {
    font-size: 24px;
    margin: 8px 0;
  }
  .desc {
    color: var(--text-2);
    font-size: 14px;
  }
  .fact {
    font-size: 13px;
    padding: 10px 12px;
    border-radius: var(--radius-m);
    background: var(--accent-wash);
    color: var(--text-1);
    font-weight: 600;
    margin-bottom: 14px;
  }
  .fact span {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: var(--accent);
  }
  .sec {
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--accent);
    margin: 14px 0 8px;
  }
  .path {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .path li {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .path button {
    border: 1px solid color-mix(in srgb, var(--c) 55%, transparent);
    background: color-mix(in srgb, var(--c) 14%, transparent);
    color: var(--text-1);
    border-radius: 8px;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 600;
  }
  .arr {
    color: var(--accent);
    padding-left: 14px;
    line-height: 1.4;
  }
  .conns {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .conns button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 6px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    font-size: 13px;
    color: var(--text-1);
  }
  .conns button:hover {
    background: var(--hover-wash);
  }
  .cn {
    flex: 1;
  }
  .cl {
    font-size: 11.5px;
    color: var(--text-3);
  }
  .below {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 24px;
  }
  .howto {
    margin: 0;
    padding-left: 18px;
    color: var(--text-2);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .howto :global(b) {
    color: var(--text-1);
  }
  @media (max-width: 980px) {
    .layout,
    .below {
      grid-template-columns: minmax(0, 1fr);
    }
    .panel {
      position: static;
      max-height: none;
    }
  }
</style>
