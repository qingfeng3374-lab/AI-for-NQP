<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';
  import { onMount } from 'svelte';
  import { geoMercator, geoPath, scaleSequentialLog, interpolateRgbBasis, max as d3max } from 'd3';
  import { HUBS, CLUSTERS, FLOWS, PILOT_ZONES, PROVINCE_SNAPSHOTS } from '../../data/geo.js';
  import { rewindGeoJSON } from '../utils/geo.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /**
   * 中国地图：三个图层可切换
   * 1) 东数西算：枢纽节点 + 数据中心集群 + 动态流向弧线
   * 2) 生成式 AI 服务备案分布（省级分级设色）
   * 3) 国家新一代人工智能创新发展试验区
   */
  let geo = $state.raw(null);
  let layer = $state('compute');
  let width = $state(700);
  const height = $derived(Math.round(Math.min(620, Math.max(360, width * 0.78))));

  onMount(async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}geo/china.json`);
    geo = rewindGeoJSON(await res.json());
  });

  const projection = $derived.by(() => {
    if (!geo) return null;
    return geoMercator().fitExtent(
      [
        [10, 10],
        [width - 10, height - 10],
      ],
      geo,
    );
  });
  const pathGen = $derived(projection ? geoPath(projection) : null);
  const P = (c) => projection(c);

  // 备案分布：可在三个时间快照间切换 / 自动播放
  let snapIdx = $state(PROVINCE_SNAPSHOTS.length - 1);
  let playing = $state(false);
  const snap = $derived(PROVINCE_SNAPSHOTS[snapIdx]);
  const vals = $derived(snap.values);
  const hasVals = true;
  // 颜色刻度固定为最新快照的最大值，保证不同时间可比
  const vmax = d3max(Object.values(PROVINCE_SNAPSHOTS[PROVINCE_SNAPSHOTS.length - 1].values));
  const color = $derived(scaleSequentialLog(interpolateRgbBasis(pal.seq)).domain([1, vmax]));
  const top8 = $derived(
    Object.entries(vals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
  );
  function play() {
    if (playing) return;
    playing = true;
    snapIdx = 0;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      if (i >= PROVINCE_SNAPSHOTS.length) {
        clearInterval(t);
        playing = false;
        return;
      }
      snapIdx = i;
    }, 1400);
  }

  // 排行榜条形起点：英文省名更长，需留出更宽的标签列
  const rankX = $derived(isEn() ? 66 : 34);

  const hubBy = Object.fromEntries(HUBS.map((h) => [h.name, h]));
  function arcPath(a, b) {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.hypot(dx, dy);
    // 向上弯曲的二次贝塞尔
    const cx = (x1 + x2) / 2 - dy * 0.25;
    const cy = (y1 + y2) / 2 - Math.abs(dx) * 0.25 - d * 0.1;
    return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  }

  function provinceFill(f) {
    const n = f.properties.name;
    if (!n) return 'none';
    if (layer === 'models' && hasVals) return vals[n] ? color(vals[n]) : pal.map.land;
    return pal.map.land;
  }

  function onProv(e, f) {
    const n = f.properties.name;
    if (!n) return;
    const rows = [];
    if (layer === 'models') rows.push({ label: tr('已备案生成式 AI 服务（{d}）', { d: snap.date }), value: tr('{n} 款', { n: vals[n] ?? 0 }), color: vals[n] ? color(vals[n]) : pal.map.land });
    showTip(e, { title: tr(n), rows, note: layer === 'compute' ? tr('东数西算：东部算力需求向西部可再生能源富集区转移') : '' });
  }

</script>

<div class="toolbar">
  <div class="seg" role="group" aria-label={tr('地图图层')}>
    <button class:on={layer === 'compute'} onclick={() => (layer = 'compute')}>{tr('东数西算')}</button>
    <button class:on={layer === 'models'} onclick={() => (layer = 'models')}>{tr('大模型备案分布')}</button>
    <button class:on={layer === 'pilot'} onclick={() => (layer = 'pilot')}>{tr('国家 AI 试验区')}</button>
  </div>
  {#if layer === 'models'}
    <div class="snaps">
      <button class="play" onclick={play} disabled={playing} aria-label={tr('播放时间演变')}>{tr(playing ? '播放中…' : '▶ 播放')}</button>
      <div class="seg" role="group" aria-label={tr('时间快照')}>
        {#each PROVINCE_SNAPSHOTS as sp, i}
          <button class:on={snapIdx === i} onclick={() => (snapIdx = i)}>{sp.date.slice(0, 7)}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<div class="map" bind:clientWidth={width}>
  {#if geo && pathGen}
    <svg {width} {height} role="img" aria-label={tr('中国人工智能与算力空间格局地图')}>
      <defs>
        <radialGradient id="cm-glow">
          <stop offset="0" stop-color={pal.accent} stop-opacity="0.7" />
          <stop offset="1" stop-color={pal.accent} stop-opacity="0" />
        </radialGradient>
        <radialGradient id="cm-glow-w">
          <stop offset="0" stop-color={pal.series[3]} stop-opacity="0.75" />
          <stop offset="1" stop-color={pal.series[3]} stop-opacity="0" />
        </radialGradient>
        <filter id="cm-blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      <!-- 省级底图 -->
      <g>
        {#each geo.features as f}
          {#if f.properties.name}
            <path
              d={pathGen(f)}
              fill={provinceFill(f)}
              stroke={pal.axis}
              stroke-width="0.7"
              class="prov"
              role="img"
              aria-label={tr(f.properties.name)}
              onpointerenter={(e) => onProv(e, f)}
              onpointermove={moveTip}
              onpointerleave={hideTip}
            />
          {:else}
            <path d={pathGen(f)} fill="none" stroke={pal.map.jd} stroke-width="1.2" />
          {/if}
        {/each}
      </g>

      {#if layer === 'compute'}
        <!-- 流向弧线 -->
        <g>
          {#each FLOWS as [a, b], i}
            {@const d = arcPath(hubBy[a].coord, hubBy[b].coord)}
            <path id="cm-flow-{i}" {d} fill="none" stroke="url(#cm-flow-grad)" stroke-width="1.6" class="flow" style:animation-delay="{i * 0.3}s" />
            <circle r="3" fill={pal.map.flowDot}>
              <animateMotion dur="{2.6 + (i % 3) * 0.5}s" repeatCount="indefinite" begin="{i * 0.35}s">
                <mpath href="#cm-flow-{i}" />
              </animateMotion>
            </circle>
          {/each}
          <defs>
            <linearGradient id="cm-flow-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color={pal.accent} stop-opacity="0.2" />
              <stop offset="1" stop-color={pal.accent} stop-opacity="0.9" />
            </linearGradient>
          </defs>
        </g>
        <!-- 枢纽节点 -->
        {#each HUBS as h}
          {@const [x, y] = P(h.coord)}
          <g transform="translate({x},{y})">
            <circle r="18" fill={h.side === 'east' ? 'url(#cm-glow)' : 'url(#cm-glow-w)'} class="breath" />
            <circle r="5.5" fill={h.side === 'east' ? pal.series[0] : pal.series[3]} stroke={pal.ring} stroke-width="2" />
            <text y="-12" text-anchor="middle" class="hub-t">{tr(h.name)}</text>
          </g>
        {/each}
        {#each CLUSTERS as c}
          {@const [x, y] = P(c.coord)}
          <rect
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
            transform="rotate(45 {x} {y})"
            fill={pal.text1}
            class="cluster"
            role="img"
            aria-label={tr(c.name)}
            onpointerenter={(e) => showTip(e, { title: tr(c.name), rows: [{ label: tr('类型'), value: tr('国家数据中心集群') }] })}
            onpointermove={moveTip}
            onpointerleave={hideTip}
          />
        {/each}
      {:else if layer === 'models'}
        <g transform="translate(12,{height - 200})" class="rank">
          <text class="rank-h">{tr('累计备案 {n} 款 · {d}', { n: snap.total, d: snap.date })}</text>
          {#each top8 as [name, v], i}
            {@const bw = (Math.min(210, width * 0.34) - 70) * (v / vmax)}
            <g transform="translate(0,{18 + i * 19})">
              <text y="10" class="rank-n">{isEn() ? tr(name) : name.replace(/(省|市|自治区|回族|维吾尔|壮族)/g, '')}</text>
              <rect x={rankX} y="2" width={bw} height="10" rx="2" fill={color(v)} />
              <text x={rankX + 4 + bw} y="11" class="rank-v">{v}</text>
            </g>
          {/each}
          <text y={18 + 8 * 19 + 12} class="rank-note">{tr('另有央企备案 {n} 款', { n: snap.central })}</text>
        </g>
      {:else if layer === 'pilot'}
        {#each PILOT_ZONES as z, i}
          {@const [x, y] = P(z.coord)}
          <g transform="translate({x},{y})" class="pz" style:animation-delay="{i * 60}ms">
            <circle r="12" fill="url(#cm-glow)" />
            <circle r="4.5" fill={pal.accent2} stroke={pal.ring} stroke-width="1.5" />
            <text x="7" y="-6" class="pz-t">{tr(z.name)}</text>
          </g>
        {/each}
      {/if}
    </svg>
  {:else}
    <div class="loading" style:height="{height}px">{tr('地图加载中…')}</div>
  {/if}

  <div class="legend">
    {#if layer === 'compute'}
      <span><i class="dot" style:background={pal.series[0]}></i>{tr('东部枢纽（算力需求）')}</span>
      <span><i class="dot" style:background={pal.series[3]}></i>{tr('西部枢纽（算力供给）')}</span>
      <span><i class="dia"></i>{tr('国家数据中心集群')}</span>
      <span><i class="ln"></i>{tr('算力流向（示意）')}</span>
    {:else if layer === 'pilot'}
      <span><i class="dot" style:background={pal.accent2}></i>{tr('国家新一代人工智能创新发展试验区（18 个）')}</span>
    {:else if layer === 'models'}
      <span class="grad-leg">
        {tr('少')}
        <i class="ramp" style:background="linear-gradient(90deg,{pal.seq.join(',')})"></i>
        {tr('多（款，对数刻度） · 最深色：暂无备案')}
      </span>
    {/if}
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }
  .snaps {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .play {
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    background: rgba(var(--accent-rgb), 0.08);
    color: var(--accent);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 12.5px;
  }
  .play:disabled {
    opacity: 0.6;
  }
  .rank-h {
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 600;
  }
  .rank-n,
  .rank-note {
    fill: var(--text-2);
    font-size: 11px;
  }
  .rank-v {
    fill: var(--text-1);
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .rank rect {
    transition: width 0.8s ease;
  }
  .map {
    position: relative;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .prov {
    transition: fill 0.5s;
    cursor: pointer;
  }
  .prov:hover {
    stroke: var(--accent);
    stroke-width: 1.4;
  }
  .flow {
    stroke-dasharray: 6 6;
    animation: dash 1.2s linear infinite;
  }
  @keyframes dash {
    to {
      stroke-dashoffset: -24;
    }
  }
  .breath {
    animation: breath 2.4s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes breath {
    50% {
      transform: scale(1.4);
      opacity: 0.5;
    }
  }
  .hub-t {
    fill: var(--text-1);
    font-size: 12px;
    font-weight: 600;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .cluster {
    cursor: pointer;
    opacity: 0.9;
  }
  .pz {
    animation: pop 0.5s ease both;
  }
  @keyframes pop {
    from {
      opacity: 0;
    }
  }
  .pz-t {
    fill: var(--text-1);
    font-size: 11px;
    paint-order: stroke;
    stroke: var(--halo);
    stroke-width: 3px;
  }
  .loading {
    display: grid;
    place-items: center;
    color: var(--text-3);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-size: 12px;
    color: var(--text-2);
    margin-top: 6px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .dia {
    width: 7px;
    height: 7px;
    background: var(--text-1);
    transform: rotate(45deg);
  }
  .ln {
    width: 18px;
    height: 2px;
    background: linear-gradient(90deg, rgba(var(--accent-rgb), 0.2), var(--accent));
  }
  .ramp {
    display: inline-block;
    width: 120px;
    height: 8px;
    border-radius: 4px;
  }
  .grad-leg {
    gap: 8px;
  }
</style>
