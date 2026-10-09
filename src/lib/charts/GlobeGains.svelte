<script>
  import { pal } from '../stores/theme.svelte.js';
  import { tr, isEn } from '../i18n/lang.svelte.js';
  import { onMount } from 'svelte';
  import { geoOrthographic, geoPath, geoGraticule10, geoContains, scaleSequential, interpolateRgbBasis } from 'd3';
  import { feature } from 'topojson-client';
  import { PWC_REGIONS, regionOfCountry } from '../../data/global.js';
  import { showTip, moveTip, hideTip } from '../stores/tooltip.svelte.js';

  /**
   * 可拖拽旋转的三维地球（Canvas + d3-geo 正射投影）
   * 按普华永道区域着色：到 2030 年 AI 带来的 GDP 增幅（%）
   */
  let canvas;
  let wrap;
  let size = $state(420);
  let activeRegion = $state(null);

  const color = $derived(scaleSequential(interpolateRgbBasis(pal.seq.slice(1))).domain([4, 27]));
  const regionById = Object.fromEntries(PWC_REGIONS.map((r) => [r.id, r]));

  onMount(() => {
    let countries = [];
    let rotation = [-100, -18, 0];
    let dragging = false;
    let last = null;
    let raf;
    let hoverFeature = null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    const projection = geoOrthographic().clipAngle(90);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    function resize() {
      size = Math.min(wrap.clientWidth, 520);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      projection.scale(size / 2 - 12).translate([size / 2, size / 2]);
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      projection.rotate(rotation);

      // 大气光晕
      const r = size / 2 - 12;
      const g = ctx.createRadialGradient(size / 2, size / 2, r * 0.9, size / 2, size / 2, r * 1.08);
      g.addColorStop(0, `rgba(${pal.accentRGB},0.25)`);
      g.addColorStop(1, `rgba(${pal.accentRGB},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // 海洋
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fillStyle = pal.globe.ocean;
      ctx.fill();

      // 经纬网
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = pal.globe.grat;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // 国家
      for (const f of countries) {
        const reg = regionById[f.region];
        const dim = activeRegion && activeRegion !== f.region;
        ctx.beginPath();
        path(f);
        ctx.globalAlpha = dim ? 0.25 : 1;
        ctx.fillStyle = color(reg.gain);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = f === hoverFeature ? pal.globe.hover : pal.globe.stroke;
        ctx.lineWidth = f === hoverFeature ? 1.4 : 0.5;
        ctx.stroke();
      }

      // 球体描边
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.strokeStyle = pal.globe.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function tick() {
      if (!dragging) rotation[0] += 0.12;
      draw();
      raf = requestAnimationFrame(tick);
    }

    function pointer(e) {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }

    canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      last = pointer(e);
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', () => {
      dragging = false;
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = pointer(e);
      if (dragging && last) {
        rotation[0] += (p[0] - last[0]) * 0.35;
        rotation[1] = Math.max(-60, Math.min(60, rotation[1] - (p[1] - last[1]) * 0.35));
        last = p;
        return;
      }
      const ll = projection.invert(p);
      const f = ll && countries.find((c) => geoContains(c, ll));
      hoverFeature = f ?? null;
      if (f) {
        const reg = regionById[f.region];
        showTip(e, {
          title: tr(reg.name),
          rows: [
            { label: tr('2030 年 GDP 增幅'), value: `+${reg.gain}%`, color: color(reg.gain) },
            { label: tr('增量'), value: tr('{v} 万亿美元', { v: reg.usd }) },
          ],
          note: tr('拖拽可旋转地球'),
        });
        moveTip(e);
      } else hideTip();
    });
    canvas.addEventListener('pointerleave', () => {
      hoverFeature = null;
      dragging = false;
      hideTip();
    });

    (async () => {
      const topo = await (await fetch(`${import.meta.env.BASE_URL}geo/world-110m.json`)).json();
      countries = feature(topo, topo.objects.countries).features.map((f) => {
        f.region = regionOfCountry(+f.id);
        return f;
      });
    })();

    resize();
    tick();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  });
</script>

<div class="globe-wrap">
  <div class="globe" bind:this={wrap}>
    <canvas bind:this={canvas} aria-label={tr('按区域着色的地球：人工智能到 2030 年带来的 GDP 增幅')}></canvas>
  </div>
  <ul class="regions" class:en={isEn()}>
    {#each [...PWC_REGIONS].sort((a, b) => b.gain - a.gain) as r}
      <li>
        <button
          class:on={activeRegion === r.id}
          onmouseenter={() => (activeRegion = r.id)}
          onmouseleave={() => (activeRegion = null)}
          onfocus={() => (activeRegion = r.id)}
          onblur={() => (activeRegion = null)}
        >
          <span class="sw" style:background={color(r.gain)}></span>
          <span class="nm">{tr(r.name)}</span>
          <span class="bar"><span style:width="{(r.gain / 27) * 100}%" style:background={color(r.gain)}></span></span>
          <span class="v">+{r.gain}%</span>
          <span class="usd">{tr('{v} 万亿$', { v: r.usd })}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .globe-wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 1fr);
    gap: 20px;
    align-items: center;
  }
  .globe {
    display: flex;
    justify-content: center;
    min-width: 0;
  }
  canvas {
    cursor: grab;
    touch-action: none;
  }
  canvas:active {
    cursor: grabbing;
  }
  .regions {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .regions button {
    width: 100%;
    display: grid;
    grid-template-columns: 10px minmax(90px, 1.3fr) 1fr 52px 64px;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    font-size: 12.5px;
    color: var(--text-2);
  }
  .regions.en button {
    grid-template-columns: 10px minmax(130px, 2fr) 1fr 48px 48px;
  }
  .regions button:hover,
  .regions button.on {
    background: var(--hover-wash);
    color: var(--text-1);
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .bar {
    height: 6px;
    border-radius: 3px;
    background: var(--surface-3);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: 3px;
  }
  .v {
    color: var(--text-1);
    font-weight: 700;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .usd {
    color: var(--text-3);
    text-align: right;
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 860px) {
    .globe-wrap {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
