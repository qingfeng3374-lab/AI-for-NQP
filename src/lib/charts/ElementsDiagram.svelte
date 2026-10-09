<script>
  import { pal } from '../stores/theme.svelte.js';
  import { Tween } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { ELEMENTS, TRAITS, DRIVERS } from '../../data/concept.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';

  /** 三要素交互图：切换"传统 / 新质"，节点内容、流动粒子速度、中心 TFP 规模随之变化 */
  let mode = $state('neo'); // 'old' | 'neo'
  let selected = $state('means');

  const W = 1000;
  const H = 690;
  const C = { x: 500, y: 385 };
  const POS = {
    labor: { x: 500, y: 165 },
    means: { x: 228, y: 540 },
    object: { x: 772, y: 540 },
  };
  const NODE_R = 84;

  const tfp = new Tween(1, { duration: 900, easing: cubicInOut });
  $effect(() => {
    tfp.target = mode === 'neo' ? 1 : 0;
  });

  const centerR = $derived(70 + tfp.current * 30);
  const speed = $derived(mode === 'neo' ? 1.6 : 4.2); // 粒子单程秒数
  const particleCount = $derived(mode === 'neo' ? 4 : 1);

  const sel = $derived(ELEMENTS.find((e) => e.id === selected));

  // 三角边（"优化组合"）与辐条（要素 → 全要素生产率）
  const pairs = [
    ['labor', 'means'],
    ['means', 'object'],
    ['object', 'labor'],
  ];
  function edgePath(a, b) {
    const A = POS[a];
    const B = POS[b];
    // 向外弯曲的二次曲线
    const mx = (A.x + B.x) / 2;
    const my = (A.y + B.y) / 2;
    const dx = mx - C.x;
    const dy = my - C.y;
    const k = 0.32;
    return `M${A.x},${A.y} Q${mx + dx * k},${my + dy * k} ${B.x},${B.y}`;
  }
  function spokePath(a) {
    const A = POS[a];
    return `M${A.x},${A.y} L${C.x},${C.y}`;
  }

  // 外圈装饰环
  const ringR = 290;
</script>

<div class="wrap">
  <div class="diagram">
    <div class="toolbar">
      <div class="seg" role="group" aria-label={tr('生产力形态')}>
        <button class:on={mode === 'old'} onclick={() => (mode = 'old')}>{tr('传统生产力')}</button>
        <button class:on={mode === 'neo'} onclick={() => (mode = 'neo')}>{tr('新质生产力 · AI 赋能')}</button>
      </div>
      <span class="hint">{tr('点击要素查看 AI 的作用')}</span>
    </div>

    <svg viewBox="0 0 {W} {H}" role="img" aria-label={tr('新质生产力三要素关系图')}>
      <defs>
        <radialGradient id="ed-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color={pal.accent} stop-opacity="0.55" />
          <stop offset="60%" stop-color={pal.accent2} stop-opacity="0.18" />
          <stop offset="100%" stop-color={pal.accent2} stop-opacity="0" />
        </radialGradient>
        <linearGradient id="ed-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color={pal.accent} />
          <stop offset="1" stop-color={pal.accent2} />
        </linearGradient>
        <filter id="ed-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {#each pairs as [a, b], i}
          <path id="ed-edge-{i}" d={edgePath(a, b)} />
        {/each}
        {#each ELEMENTS as e}
          <path id="ed-spoke-{e.id}" d={spokePath(e.id)} />
        {/each}
      </defs>

      <!-- 外圈装饰环 -->
      <circle cx={C.x} cy={C.y} r={ringR} fill="none" stroke={pal.grid} stroke-width="1" />
      <circle
        cx={C.x}
        cy={C.y}
        r={ringR}
        fill="none"
        stroke="url(#ed-stroke)"
        stroke-width="1.5"
        stroke-dasharray="4 10"
        opacity={0.25 + tfp.current * 0.5}
        class="spin"
        style:animation-duration="{mode === 'neo' ? 40 : 120}s"
      />

      <!-- 优化组合：三角边 -->
      {#each pairs as _, i}
        <use href="#ed-edge-{i}" class="edge" class:neo={mode === 'neo'} />
      {/each}
      <text x={C.x} y={isEn() ? 596 : 678} class="edge-label" class:en={isEn()} text-anchor="middle">{tr('要素优化组合')}</text>

      <!-- 辐条 -->
      {#each ELEMENTS as e}
        <use href="#ed-spoke-{e.id}" class="spoke" />
      {/each}

      <!-- 流动粒子：要素 → 中心 -->
      {#key mode}
        {#each ELEMENTS as e}
          {#each Array(particleCount) as _, k}
            <circle r="3.2" fill={pal.accent} filter="url(#ed-glow)">
              <animateMotion
                dur="{speed}s"
                begin="{(k * speed) / particleCount}s"
                repeatCount="indefinite"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href="#ed-spoke-{e.id}" />
              </animateMotion>
            </circle>
          {/each}
        {/each}
        {#each pairs as _, i}
          {#each Array(particleCount) as _, k}
            <circle r="2.4" fill={pal.accent2}>
              <animateMotion dur="{speed * 1.6}s" begin="{(k * speed * 1.6) / particleCount}s" repeatCount="indefinite">
                <mpath href="#ed-edge-{i}" />
              </animateMotion>
            </circle>
          {/each}
        {/each}
      {/key}

      <!-- 中心：全要素生产率 -->
      <circle cx={C.x} cy={C.y} r={centerR * 1.9} fill="url(#ed-core)" />
      <circle cx={C.x} cy={C.y} r={centerR} fill={pal.ring} stroke="url(#ed-stroke)" stroke-width="2" />
      {#if isEn()}
        <!-- 英文较长：拆为两行 -->
        <text x={C.x} y={C.y - 20} text-anchor="middle" class="core-t en">Total factor</text>
        <text x={C.x} y={C.y + 2} text-anchor="middle" class="core-t en">productivity</text>
      {:else}
        <text x={C.x} y={C.y - 6} text-anchor="middle" class="core-t">全要素生产率</text>
      {/if}
      <text x={C.x} y={C.y + (isEn() ? 30 : 24)} text-anchor="middle" class="core-v">
        {tr(mode === 'neo' ? 'TFP ↑↑ 大幅提升' : 'TFP 平稳')}
      </text>

      <!-- 三个要素节点 -->
      {#each ELEMENTS as e}
        {@const P = POS[e.id]}
        {@const lines = mode === 'neo' ? e.neo : e.old}
        {@const isSel = selected === e.id}
        <g
          class="node"
          class:sel={isSel}
          transform="translate({P.x},{P.y})"
          role="button"
          tabindex="0"
          aria-label={tr('{name}：{lines}', { name: tr(e.name), lines: lines.map((l) => tr(l)).join(tr('，')) })}
          onclick={() => (selected = e.id)}
          onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (selected = e.id)}
        >
          <circle r={NODE_R + 10} class="halo" />
          <circle r={NODE_R} class="disc" />
          <g transform="translate(-17,-58) scale(1.4)">
            <path d={e.icon} fill="none" stroke={mode === 'neo' ? pal.accent : pal.text3} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <text y="10" text-anchor="middle" class="node-t" class:en={isEn()}>{tr(e.name)}</text>
          <text y="38" text-anchor="middle" class="node-s">{tr(mode === 'neo' ? 'AI 赋能' : '传统形态')}</text>
          {#key mode}
            <g class="desc" transform="translate(0,{e.id === 'labor' ? -NODE_R - 50 : NODE_R + 36})">
              {#each lines as l, j}
                <text y={j * 26} text-anchor="middle" class="node-d" class:neo={mode === 'neo'} class:en={isEn()}>{tr(l)}</text>
              {/each}
            </g>
          {/key}
        </g>
      {/each}

      <!-- 驱动力标签 -->
      <g class="drivers" transform="translate(16,36)" opacity={0.45 + tfp.current * 0.55}>
        <text class="driver-h" class:en={isEn()}>{tr('三大催生动力')}</text>
        {#each DRIVERS as d, i}
          <text y={32 + i * 28} class="driver" class:en={isEn()}>▸ {tr(d)}</text>
        {/each}
      </g>
      <g class="drivers" transform="translate({W - 16},36)" opacity={0.45 + tfp.current * 0.55}>
        <text class="driver-h" class:en={isEn()} text-anchor="end">{tr('三个基本特征')}</text>
        {#each TRAITS as d, i}
          <text y={32 + i * 28} class="driver" class:en={isEn()} text-anchor="end">{tr(d)} ◂</text>
        {/each}
      </g>
    </svg>
  </div>

  <aside class="panel" aria-live="polite">
    <div class="p-k">{tr('要素解读')}</div>
    <h4>{tr(sel.name)}</h4>
    <div class="compare">
      <div>
        <span class="tag old">{tr('传统')}</span>
        <ul>{#each sel.old as l}<li>{tr(l)}</li>{/each}</ul>
      </div>
      <div class="arrow" aria-hidden="true">→</div>
      <div>
        <span class="tag neo">{tr('新质')}</span>
        <ul>{#each sel.neo as l}<li>{tr(l)}</li>{/each}</ul>
      </div>
    </div>
    <p class="role">{tr(sel.role)}</p>
    <div class="fact">
      <div class="fv grad-text">{tr(sel.fact.value)}</div>
      <div class="fl">{tr(sel.fact.label)}</div>
    </div>
    <div class="switch">
      {#each ELEMENTS as e}
        <button class:on={selected === e.id} onclick={() => (selected = e.id)}>{tr(e.name)}</button>
      {/each}
    </div>
  </aside>
</div>

<style>
  .wrap {
    display: grid;
    grid-template-columns: minmax(0, 1.75fr) minmax(260px, 1fr);
    gap: 24px;
    align-items: stretch;
  }
  .diagram {
    min-width: 0;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .hint {
    font-size: 12px;
    color: var(--text-3);
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }
  .spin {
    transform-origin: 500px 385px;
    animation: spin 60s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .edge {
    fill: none;
    stroke: var(--axis);
    stroke-width: 1.5;
    stroke-dasharray: 2 6;
    transition: stroke 0.6s;
  }
  .edge.neo {
    stroke: rgba(var(--accent2-rgb), 0.6);
  }
  .edge-label {
    fill: var(--text-3);
    font-size: 17px;
    letter-spacing: 0.3em;
  }
  .spoke {
    stroke: rgba(var(--accent-rgb), 0.22);
    stroke-width: 1.5;
    fill: none;
  }
  .core-t {
    fill: var(--text-1);
    font-size: 22px;
    font-weight: 700;
  }
  .core-v {
    fill: var(--accent);
    font-size: 17px;
    font-weight: 600;
  }
  .node {
    cursor: pointer;
    outline: none;
  }
  .halo {
    fill: none;
    stroke: rgba(var(--accent-rgb), 0);
    stroke-width: 1;
    transition: stroke 0.3s;
  }
  .node:hover .halo,
  .node:focus-visible .halo,
  .node.sel .halo {
    stroke: rgba(var(--accent-rgb), 0.55);
  }
  .disc {
    fill: var(--surface-2);
    stroke: var(--axis);
    stroke-width: 1.5;
    transition: stroke 0.3s, fill 0.3s;
  }
  .node.sel .disc {
    stroke: url(#ed-stroke);
    fill: var(--surface-3);
  }
  .node-t {
    fill: var(--text-1);
    font-size: 26px;
    font-weight: 700;
  }
  .node-t.en {
    font-size: 20px;
  }
  .core-t.en {
    font-size: 19px;
  }
  .node-s {
    fill: var(--text-3);
    font-size: 15px;
  }
  .node-d {
    fill: var(--text-3);
    font-size: 19px;
    animation: fadein 0.6s ease both;
  }
  .node-d.neo {
    fill: var(--text-2);
  }
  .node-d.en {
    font-size: 17px;
  }
  @keyframes fadein {
    from {
      opacity: 0;
    }
  }
  .driver {
    fill: var(--text-2);
    font-size: 19px;
    letter-spacing: 0.06em;
  }
  .driver.en {
    font-size: 16px;
    letter-spacing: 0;
  }
  .driver-h.en,
  .edge-label.en {
    letter-spacing: 0.08em;
  }
  .driver-h {
    fill: var(--accent);
    font-size: 16px;
    letter-spacing: 0.24em;
  }
  .panel {
    padding: 22px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .p-k {
    font-size: 12px;
    letter-spacing: 0.2em;
    color: var(--accent);
  }
  h4 {
    font-size: 26px;
  }
  .compare {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 10px;
    align-items: start;
    font-size: 13px;
  }
  .compare ul {
    margin: 6px 0 0;
    padding-left: 16px;
    color: var(--text-2);
  }
  .arrow {
    color: var(--accent);
    font-size: 20px;
    padding-top: 18px;
  }
  .tag {
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 999px;
  }
  .tag.old {
    background: var(--surface-3);
    color: var(--text-3);
  }
  .tag.neo {
    background: rgba(var(--accent-rgb), 0.14);
    color: var(--accent);
  }
  .role {
    color: var(--text-2);
    font-size: 14px;
    margin: 0;
  }
  .fact {
    padding: 14px;
    border-radius: var(--radius-m);
    background: var(--panel-bg);
    border: 1px solid var(--border);
  }
  .fv {
    font-size: 30px;
    font-weight: 800;
  }
  .fl {
    font-size: 12px;
    color: var(--text-3);
  }
  .switch {
    display: flex;
    gap: 6px;
    margin-top: auto;
  }
  .switch button {
    flex: 1;
    padding: 6px 0;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-2);
    font-size: 13px;
  }
  .switch button.on {
    border-color: rgba(var(--accent-rgb), 0.5);
    color: var(--text-1);
    background: rgba(var(--accent-rgb), 0.08);
  }
  @media (max-width: 900px) {
    .wrap {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
