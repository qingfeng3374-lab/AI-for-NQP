<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';
  import { SIX_ACTIONS } from '../../data/future.js';

  /** 六大重点行动：蜂窝布局，围绕中心"人工智能+"，点击查看详情 */
  let active = $state('ind');
  const sel = $derived(SIX_ACTIONS.find((a) => a.id === active));

  // 六边形顶点（尖顶朝上）
  const hex = (r) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${r * Math.cos(a)},${r * Math.sin(a)}`;
    }).join(' ');
  const RING = 118;
  const pos = SIX_ACTIONS.map((_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2 + Math.PI / 6;
    return [RING * Math.cos(a), RING * Math.sin(a)];
  });
</script>

<div class="wrap">
  <svg viewBox="-200 -190 400 380" role="group" class:en={isEn()} aria-label={tr('"人工智能+"六大重点行动')}>
    <defs>
      <linearGradient id="sa-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color={pal.accent} /><stop offset="1" stop-color={pal.accent2} />
      </linearGradient>
    </defs>
    {#each pos as [x, y], i}
      <line x1="0" y1="0" x2={x} y2={y} stroke={`rgba(${pal.accentRGB},0.3)`} stroke-dasharray="3 4" />
    {/each}
    <g>
      <polygon points={hex(62)} fill={pal.ring} stroke="url(#sa-g)" stroke-width="2.5" />
      <text text-anchor="middle" y="-4" class="c1">{tr('人工智能+')}</text>
      <text text-anchor="middle" y="16" class="c2">{tr('六大行动')}</text>
    </g>
    {#each SIX_ACTIONS as a, i}
      {@const [x, y] = pos[i]}
      <g
        transform="translate({x},{y})"
        class="cell"
        class:on={active === a.id}
        role="button"
        tabindex="0"
        aria-pressed={active === a.id}
        aria-label={tr(a.name)}
        onclick={() => (active = a.id)}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (active = a.id)}
        onpointerenter={() => (active = a.id)}
      >
        <polygon points={hex(54)} class="hx" />
        <text text-anchor="middle" y="-6" class="ic">{a.icon}</text>
        <text text-anchor="middle" y="18" class="nm">{isEn() ? tr(`${a.name}（简称）`) : a.name}</text>
      </g>
    {/each}
  </svg>

  <div class="detail" aria-live="polite">
    <div class="k">{tr('人工智能 + {n}', { n: tr(sel.name) })}</div>
    <p class="d">{tr(sel.desc)}</p>
    <div class="ex"><span>{tr('典型场景')}</span>{tr(sel.example)}</div>
  </div>
</div>

<style>
  .wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.9fr);
    gap: 20px;
    align-items: center;
  }
  svg {
    width: 100%;
    max-width: 420px;
    height: auto;
    display: block;
    margin: 0 auto;
    overflow: visible;
  }
  .c1 {
    fill: var(--text-1);
    font-size: 17px;
    font-weight: 800;
  }
  .c2 {
    fill: var(--text-3);
    font-size: 11px;
  }
  .cell {
    cursor: pointer;
    outline: none;
  }
  .hx {
    fill: var(--surface-2);
    stroke: var(--axis);
    stroke-width: 1.5;
    transition: all 0.25s;
  }
  .cell:hover .hx,
  .cell:focus-visible .hx,
  .cell.on .hx {
    fill: rgba(var(--accent-rgb), 0.12);
    stroke: var(--accent);
  }
  .ic {
    font-size: 22px;
  }
  .nm {
    fill: var(--text-1);
    font-size: 13px;
    font-weight: 700;
  }
  .en .nm {
    font-size: 11.5px;
  }
  .detail {
    padding: 20px;
    border-radius: var(--radius-l);
    border: 1px solid var(--border);
    background: var(--glass);
    min-height: 200px;
  }
  .k {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 10px;
  }
  .d {
    color: var(--text-2);
    font-size: 14px;
  }
  .ex {
    font-size: 13px;
    color: var(--text-1);
  }
  .ex span {
    display: inline-block;
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 999px;
    background: rgba(var(--accent2-rgb), 0.16);
    color: var(--violet-text);
    margin-right: 8px;
  }
  @media (max-width: 760px) {
    .wrap {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
