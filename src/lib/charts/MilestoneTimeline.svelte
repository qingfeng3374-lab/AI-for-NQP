<script>
  import { onMount } from 'svelte';
  import { scaleLinear, scaleLog, zoom, zoomIdentity, brushX, select, area, curveStepAfter } from 'd3';
  import { LANES, ERAS, MILESTONES } from '../../data/milestones.js';
  import { MODELS } from '../../data/engine.js';
  import { pal, slotColor } from '../stores/theme.svelte.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';
  import { fmtPow10, fmtSci } from '../utils/format.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';

  /**
   * 可缩放时间轴：主视图（泳道 + 里程碑）/ 联动的训练算力条带 / 带刷选的全局缩略图
   * - 滚轮或拖拽缩放平移，或在下方缩略图中刷选时间窗口
   * - "播放"按钮让时间窗口自动扫过 80 年历史
   */
  let { selected = $bindable(null) } = $props();

  const FULL = [1940, 2027];
  const LABEL_W = 92;
  const LANE_H = 66;
  const ERA_H = 26;
  const mainH = ERA_H + LANES.length * LANE_H + 26;
  const STRIP_H = 110;
  const MINI_H = 46;

  let width = $state(900);
  let domain = $state([...FULL]);
  let laneOn = $state(Object.fromEntries(LANES.map((l) => [l.id, true])));
  let playing = $state(false);

  const iw = $derived(Math.max(100, width - LABEL_W - 16));
  const x0 = $derived(scaleLinear().domain(FULL).range([0, iw]));
  const x = $derived(scaleLinear().domain(domain).range([0, iw]));
  const laneIdx = Object.fromEntries(LANES.map((l, i) => [l.id, i]));
  const laneSlot = Object.fromEntries(LANES.map((l) => [l.id, l.slot]));

  // 标签避让：每条泳道内，先放重大事件，再放一般事件；与已放置标签重叠则只显示圆点
  const labels = $derived.by(() => {
    const placed = new Map(LANES.map((l) => [l.id, []]));
    const show = new Set();
    // 同泳道内其他事件的圆点也视为障碍物
    const dots = new Map(LANES.map((l) => [l.id, []]));
    for (const m of MILESTONES) dots.get(m.lane).push({ m, px: x(m.date) });
    const order = [...MILESTONES].sort((a, b) => (b.major ? 1 : 0) - (a.major ? 1 : 0) || a.date - b.date);
    for (const m of order) {
      const px = x(m.date);
      if (px < -10 || px > iw + 10) continue;
      // 标签宽度按当前语言的标题估算（英文字符更窄）
      const len = tr(m.title).length;
      const w = isEn() ? len * 7 + 14 : len * 12.5 + 14;
      const span = [px - 4, px + w];
      if (span[1] > iw + 40) continue;
      const list = placed.get(m.lane);
      const freeOfLabels = list.every(([a, b]) => span[1] < a - 4 || span[0] > b + 4);
      const freeOfDots = dots.get(m.lane).every((d) => d.m === m || d.px < px + 4 || d.px > span[1] + 6);
      if (freeOfLabels && freeOfDots) {
        list.push(span);
        show.add(m);
      }
    }
    return show;
  });

  // 前沿训练算力：按时间累计最大值（阶梯）
  const frontier = (() => {
    const sorted = [...MODELS].sort((a, b) => a.date - b.date);
    let mx = 0;
    const pts = [];
    for (const m of sorted) {
      if (m.flop > mx) {
        mx = m.flop;
        pts.push({ date: m.date, flop: mx, name: m.name });
      }
    }
    pts.push({ date: 2026.5, flop: mx, name: '' });
    return pts;
  })();
  const ys = scaleLog().domain([1e17, 1e27]).range([STRIP_H - 22, 8]);
  const stripArea = $derived(
    area()
      .x((d) => x(d.date))
      .y0(STRIP_H - 22)
      .y1((d) => ys(d.flop))
      .curve(curveStepAfter)(frontier),
  );

  const ticks = $derived(x.ticks(Math.max(4, Math.floor(iw / 90))).filter((t) => Number.isInteger(t)));

  // ---- 缩放 / 刷选联动 ----
  let mainEl;
  let miniG;
  let z;
  let br;
  let syncing = false;

  function applyDomain(d0, d1, fromBrush = false) {
    const k = (FULL[1] - FULL[0]) / (d1 - d0);
    const t = zoomIdentity.scale(k).translate(-x0(d0), 0);
    syncing = true;
    select(mainEl).call(z.transform, t);
    if (!fromBrush) select(miniG).call(br.move, [x0(d0), x0(d1)]);
    syncing = false;
  }

  onMount(() => {
    z = zoom()
      .scaleExtent([1, 40])
      .on('zoom', (e) => {
        const nd = e.transform.rescaleX(x0).domain();
        domain = [Math.max(FULL[0], nd[0]), Math.min(FULL[1], nd[1])];
        if (!syncing && br) {
          syncing = true;
          select(miniG).call(br.move, [x0(domain[0]), x0(domain[1])]);
          syncing = false;
        }
        if (e.sourceEvent) playing = false;
      });
    select(mainEl).call(z);
    br = brushX().on('brush end', (e) => {
      if (syncing || !e.selection) return;
      const [s0, s1] = e.selection;
      if (s1 - s0 < 4) return;
      playing = false;
      applyDomain(x0.invert(s0), x0.invert(s1), true);
    });
    setupBrush();
  });

  function setupBrush() {
    br.extent([
      [0, 0],
      [iw, MINI_H - 16],
    ]);
    z.translateExtent([
      [0, 0],
      [iw, mainH],
    ]).extent([
      [0, 0],
      [iw, mainH],
    ]);
    select(miniG).call(br);
    applyDomain(domain[0], domain[1]);
  }

  // 宽度变化时重新设置刷选范围与缩放
  let lastW = 0;
  $effect(() => {
    const w = iw;
    if (z && br && w !== lastW) {
      lastW = w;
      queueMicrotask(setupBrush);
    }
  });

  // 播放：25 年的窗口从 1940 匀速扫到 2026
  let raf;
  function play() {
    if (playing) {
      playing = false;
      return;
    }
    playing = true;
    const win = 25;
    const start = performance.now();
    const dur = 16000;
    const stepFn = (now) => {
      if (!playing) return;
      const t = Math.min(1, (now - start) / dur);
      const d0 = FULL[0] + (FULL[1] - win - FULL[0]) * t;
      applyDomain(d0, d0 + win);
      if (t < 1) raf = requestAnimationFrame(stepFn);
      else playing = false;
    };
    raf = requestAnimationFrame(stepFn);
  }
  function reset() {
    playing = false;
    applyDomain(FULL[0], FULL[1]);
  }
  export function zoomToEvent(m) {
    playing = false;
    applyDomain(Math.max(FULL[0], m.date - 6), Math.min(FULL[1], m.date + 6));
  }
  export function zoomToRange(a, b) {
    playing = false;
    applyDomain(a, b);
  }

  function tip(e, m) {
    showTip(e, {
      title: `${Math.floor(m.date)} · ${tr(m.title)}`,
      rows: [{ label: tr(LANES[laneIdx[m.lane]].name), value: m.major ? tr('重大里程碑') : '', color: slotColor(laneSlot[m.lane]) }],
      note: tr(m.desc),
    });
  }
</script>

<div class="tl" bind:clientWidth={width}>
  <div class="toolbar">
    <button class="play" class:on={playing} onclick={play}>{playing ? tr('❚❚ 暂停') : tr('▶ 播放 80 年')}</button>
    <button class="ghost" onclick={reset}>{tr('全部显示')}</button>
    <span class="win">{tr('当前窗口：{a} — {b}', { a: Math.round(domain[0]), b: Math.round(domain[1]) })}</span>
    <div class="chips">
      {#each LANES as l}
        <button class="chip" class:off={!laneOn[l.id]} onclick={() => (laneOn[l.id] = !laneOn[l.id])} aria-pressed={laneOn[l.id]}>
          <i style:background={slotColor(l.slot)}></i>{tr(l.name)}
        </button>
      {/each}
    </div>
  </div>

  <!-- 主视图 -->
  <svg bind:this={mainEl} {width} height={mainH} class="main" role="img" aria-label={tr('人工智能里程碑时间轴')}>
    <defs>
      <clipPath id="tl-clip"><rect x="0" y="0" width={iw} height={mainH} /></clipPath>
    </defs>
    <g transform="translate({LABEL_W},0)">
      <g clip-path="url(#tl-clip)">
        <!-- 发展阶段 -->
        {#each ERAS as e, i}
          {@const a = x(e.start)}
          {@const b = x(e.end)}
          {@const en = tr(e.name)}
          <rect x={a} y="0" width={Math.max(0, b - a)} height={mainH - 26} fill={e.winter ? pal.warn : i % 2 ? pal.accent2 : pal.accent} opacity={e.winter ? 0.08 : 0.04} />
          <rect x={a} y="0" width={Math.max(0, b - a - 1)} height={ERA_H - 6} rx="4" fill={e.winter ? pal.warn : pal.accent} opacity={e.winter ? 0.22 : 0.12} />
          {#if b - a > (isEn() ? en.length * 6.5 : en.length * 12) + 10}
            <text x={(a + b) / 2} y={ERA_H - 11} text-anchor="middle" class="era" class:winter={e.winter}>{en}</text>
          {/if}
        {/each}
        <!-- 泳道分隔 -->
        {#each LANES as l, i}
          <line x1="0" x2={iw} y1={ERA_H + i * LANE_H + LANE_H} y2={ERA_H + i * LANE_H + LANE_H} stroke={pal.grid} />
        {/each}
        <!-- 刻度网格 -->
        {#each ticks as t}
          <line x1={x(t)} x2={x(t)} y1={ERA_H} y2={mainH - 26} stroke={pal.grid} stroke-dasharray="2 4" />
        {/each}
        <!-- 选中事件的竖向参考线 -->
        {#if selected}
          <line x1={x(selected.date)} x2={x(selected.date)} y1={ERA_H} y2={mainH - 26} stroke={pal.accent} stroke-width="1.5" />
        {/if}
        <!-- 里程碑 -->
        {#each MILESTONES as m}
          {#if laneOn[m.lane]}
            {@const cx = x(m.date)}
            {#if cx > -20 && cx < iw + 20}
              {@const cy = ERA_H + laneIdx[m.lane] * LANE_H + LANE_H / 2}
              {@const c = slotColor(laneSlot[m.lane])}
              <g
                class="ev"
                class:sel={selected === m}
                transform="translate({cx},{cy})"
                role="button"
                tabindex="0"
                aria-label="{Math.floor(m.date)} {tr(m.title)}"
                onclick={() => (selected = selected === m ? null : m)}
                onkeydown={(e) => e.key === 'Enter' && (selected = m)}
                onpointerenter={(e) => tip(e, m)}
                onpointermove={moveTip}
                onpointerleave={hideTip}
              >
                <circle r="14" fill="transparent" />
                {#if m.major}<circle r="10" fill={c} opacity="0.18" />{/if}
                <circle r={m.major ? 6.5 : 4.5} fill={c} stroke={pal.ring} stroke-width="2" />
                {#if labels.has(m)}
                  <text x="10" y="4" class="evt" class:major={m.major}>{tr(m.title)}</text>
                  <text x="10" y="18" class="evy">{Math.floor(m.date)}</text>
                {/if}
              </g>
            {/if}
          {/if}
        {/each}
      </g>
      <!-- x 轴 -->
      <line x1="0" x2={iw} y1={mainH - 26} y2={mainH - 26} stroke={pal.axis} />
      {#each ticks as t}
        <text x={x(t)} y={mainH - 8} text-anchor="middle" class="tk">{t}</text>
      {/each}
    </g>
    <!-- 泳道标签 -->
    {#each LANES as l, i}
      <g transform="translate(0,{ERA_H + i * LANE_H + LANE_H / 2})" opacity={laneOn[l.id] ? 1 : 0.35}>
        <rect x="0" y="-11" width="4" height="22" rx="2" fill={slotColor(l.slot)} />
        <text x="12" y="4" class="lane">{tr(l.name)}</text>
      </g>
    {/each}
  </svg>

  <!-- 联动条带：前沿训练算力 -->
  <svg {width} height={STRIP_H} class="strip" role="img" aria-label={tr('前沿模型训练算力（对数）')}>
    <g transform="translate({LABEL_W},0)">
      <clipPath id="tl-clip2"><rect width={iw} height={STRIP_H} /></clipPath>
      {#each [17, 21, 25] as e}
        <line x1="0" x2={iw} y1={ys(10 ** e)} y2={ys(10 ** e)} stroke={pal.grid} />
        <text x="-6" y={ys(10 ** e)} dy="0.32em" text-anchor="end" class="tk">{fmtPow10(e)}</text>
      {/each}
      <g clip-path="url(#tl-clip2)">
        <path d={stripArea} fill={pal.accent} opacity="0.18" />
        <path d={stripArea} fill="none" stroke={pal.accent} stroke-width="1.8" />
        {#each frontier.slice(0, -1) as p}
          <circle
            cx={x(p.date)}
            cy={ys(p.flop)}
            r="3.5"
            fill={pal.accent}
            stroke={pal.ring}
            stroke-width="1.5"
            role="img"
            aria-label="{p.name} {fmtSci(p.flop)} FLOP"
            onpointerenter={(e) => showTip(e, { title: p.name, rows: [{ label: tr('训练算力'), value: `${fmtSci(p.flop)} FLOP`, color: pal.accent }], note: tr('当时的前沿纪录') })}
            onpointermove={moveTip}
            onpointerleave={hideTip}
          />
        {/each}
        {#if selected}
          <line x1={x(selected.date)} x2={x(selected.date)} y1="0" y2={STRIP_H - 22} stroke={pal.accent} stroke-width="1.5" />
        {/if}
      </g>
      {#if x(2012) > iw}
        <text x={iw - 4} y={STRIP_H / 2} text-anchor="end" class="na">{tr('算力数据自 2012 年（深度学习时代）起 →')}</text>
      {/if}
    </g>
    <text x="0" y="14" class="strip-t">{tr('前沿训练算力')}</text>
    <text x="0" y="28" class="strip-s">{tr('FLOP · 对数')}</text>
  </svg>

  <!-- 全局缩略图 + 刷选 -->
  <svg {width} height={MINI_H} class="mini" role="img" aria-label={tr('时间轴缩略图，可拖动选择时间窗口')}>
    <text x="0" y="18" class="strip-t">{tr('全局')}</text>
    <g transform="translate({LABEL_W},0)">
      <rect width={iw} height={MINI_H - 16} rx="6" fill={pal.surface2} />
      {#each ERAS as e}
        {#if e.winter}<rect x={x0(e.start)} width={x0(e.end) - x0(e.start)} height={MINI_H - 16} fill={pal.warn} opacity="0.15" />{/if}
      {/each}
      {#each MILESTONES as m}
        <line
          x1={x0(m.date)}
          x2={x0(m.date)}
          y1={(MINI_H - 16) / 2 - (m.major ? 9 : 5)}
          y2={(MINI_H - 16) / 2 + (m.major ? 9 : 5)}
          stroke={slotColor(laneSlot[m.lane])}
          stroke-width="1.5"
        />
      {/each}
      {#each x0.ticks(Math.max(3, Math.floor(iw / 70))) as t}
        <text x={x0(t)} y={MINI_H - 3} text-anchor="middle" class="tk sm">{t}</text>
      {/each}
      <g bind:this={miniG} class="brush"></g>
    </g>
  </svg>
</div>

<style>
  .tl {
    position: relative;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin-bottom: 10px;
  }
  .play {
    padding: 6px 16px;
    border-radius: 999px;
    border: 0;
    color: #fff;
    background: var(--accent-grad);
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 6px 18px rgba(var(--accent-rgb), 0.3);
  }
  .ghost {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text-2);
    font-size: 12.5px;
  }
  .win {
    font-size: 12.5px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
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
    font-size: 12px;
  }
  .chip.off {
    opacity: 0.4;
  }
  .chip i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .main {
    cursor: grab;
    touch-action: none;
  }
  .main:active {
    cursor: grabbing;
  }
  .era {
    fill: var(--text-2);
    font-size: 11.5px;
    font-weight: 600;
  }
  .era.winter {
    fill: var(--warn-text);
  }
  .lane {
    fill: var(--text-1);
    font-size: 12.5px;
    font-weight: 700;
  }
  .ev {
    cursor: pointer;
    outline: none;
  }
  .ev:hover circle:last-of-type,
  .ev.sel circle:last-of-type {
    stroke: var(--accent);
  }
  .evt {
    fill: var(--text-1);
    font-size: 12px;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .evt.major {
    font-weight: 800;
    font-size: 12.5px;
  }
  .evy {
    fill: var(--text-3);
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
  }
  .tk {
    fill: var(--text-3);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .tk.sm {
    font-size: 10px;
  }
  .strip {
    margin-top: 6px;
  }
  .strip-t {
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 700;
  }
  .strip-s {
    fill: var(--text-3);
    font-size: 10.5px;
  }
  .na {
    fill: var(--text-3);
    font-size: 11.5px;
  }
  .mini {
    margin-top: 8px;
  }
  .brush :global(.selection) {
    fill: var(--accent);
    fill-opacity: 0.18;
    stroke: var(--accent);
    stroke-width: 1.5;
  }
  .brush :global(.handle) {
    fill: var(--accent);
    fill-opacity: 0.6;
  }
</style>
