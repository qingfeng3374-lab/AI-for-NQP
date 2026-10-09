<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr } from '../i18n/lang.svelte.js';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { MILESTONES } from '../../data/future.js';
  import { inview } from '../actions/inview.js';

  /** "人工智能+"三阶段目标：环形进度 + 时间轴；当前时间点标注在轴上 */
  const g = new Tween(0, { duration: 2000, easing: cubicOut });
  const R = 52;
  const C = 2 * Math.PI * R;
  const NOW = 2026.76; // 2026 年 10 月
  const span = [2025, 2035];
  const pos = (y) => ((y - span[0]) / (span[1] - span[0])) * 100;
</script>

<div class="wrap" use:inview={{ onEnter: () => (g.target = 1) }}>
  <div class="axis">
    <div class="rail"></div>
    <div class="fill" style:width="{pos(NOW) * g.current}%"></div>
    <div class="now" style:left="{pos(NOW)}%">
      <span class="now-dot"></span>
      <span class="now-t">{tr('现在 · 2026.10')}</span>
    </div>
    <div class="start" style:left="0%"><span>{tr('2025.08 意见印发')}</span></div>
    {#each MILESTONES as ms, i}
      <div class="tick" class:last={i === MILESTONES.length - 1} style:left="{pos(ms.year)}%"><span>{ms.year}</span></div>
    {/each}
  </div>

  <div class="cards">
    {#each MILESTONES as ms, i}
      {@const p = (ms.pct / 100) * g.current}
      <div class="card" style:--d="{i * 0.25}s">
        <svg viewBox="0 0 140 140" width="132" height="132" aria-hidden="true">
          <defs>
            <linearGradient id="fm-g{i}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color={pal.accent} /><stop offset="1" stop-color={pal.accent2} />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={R} fill="none" stroke={pal.empty} stroke-width="10" />
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="url(#fm-g{i})"
            stroke-width="10"
            stroke-linecap="round"
            stroke-dasharray="{C * p} {C}"
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="68" text-anchor="middle" class="pct">
            {ms.pct === 100 ? tr('全面') : `>${Math.round(ms.pct * g.current)}%`}
          </text>
          <text x="70" y="90" text-anchor="middle" class="pl">{tr(ms.pct === 100 ? '智能社会' : '应用普及率')}</text>
        </svg>
        <div class="yr grad-text">{ms.year}</div>
        <div class="tt">{tr(ms.title)}</div>
        <p>{tr(ms.text)}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .axis {
    position: relative;
    height: 56px;
    margin: 10px 8px 26px;
  }
  .rail,
  .fill {
    position: absolute;
    left: 0;
    top: 26px;
    height: 4px;
    border-radius: 4px;
  }
  .rail {
    right: 0;
    background: var(--surface-3);
  }
  .fill {
    background: var(--accent-grad);
  }
  .tick,
  .start {
    position: absolute;
    top: 20px;
    transform: translateX(-50%);
  }
  .tick::before,
  .start::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--page);
    border: 3px solid var(--accent-2);
    margin: 0 auto;
  }
  .start {
    transform: none;
  }
  .start::before {
    margin: 0;
    border-color: var(--accent);
  }
  .tick span,
  .start span {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-1);
    white-space: nowrap;
  }
  .start span {
    font-weight: 400;
    font-size: 12px;
    color: var(--text-3);
  }
  .tick span {
    text-align: center;
  }
  .tick.last {
    transform: translateX(-100%);
  }
  .tick.last::before {
    margin: 0 0 0 auto;
  }
  .tick.last span {
    text-align: right;
  }
  .now {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .now-t {
    order: -1;
    font-size: 11.5px;
    color: var(--accent);
    white-space: nowrap;
  }
  .now-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    margin-top: 6px;
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.6);
    animation: pulse 1.8s infinite;
  }
  @keyframes pulse {
    to {
      box-shadow: 0 0 0 12px rgba(var(--accent-rgb), 0);
    }
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .card {
    text-align: center;
    padding: 20px 18px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
  }
  .pct {
    fill: var(--text-1);
    font-size: 24px;
    font-weight: 800;
  }
  .pl {
    fill: var(--text-3);
    font-size: 11px;
  }
  .yr {
    font-size: 34px;
    font-weight: 800;
    line-height: 1.1;
    margin-top: 4px;
  }
  .tt {
    font-weight: 700;
    margin: 4px 0 8px;
  }
  p {
    font-size: 13px;
    color: var(--text-2);
    margin: 0;
    text-align: left;
  }
  @media (max-width: 760px) {
    .cards {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
