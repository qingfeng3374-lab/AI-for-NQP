<script>
  import { onMount } from 'svelte';
  import { createNetworkSketch } from '../lib/sketches/networkSketch.js';
  import { tr } from '../lib/i18n/lang.svelte.js';

  let stage;
  onMount(() => {
    let sketch;
    let io;
    let alive = true;
    import('p5').then(({ default: p5 }) => {
      if (!alive) return;
      sketch = createNetworkSketch(p5, stage);
      // 不在视口时暂停绘制，节省性能
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? sketch.loop() : sketch.noLoop()));
      io.observe(stage);
    });
    return () => {
      alive = false;
      io?.disconnect();
      sketch?.remove();
    };
  });

  const POINTS = [
    { k: '对劳动者', v: '从体力与经验型劳动，走向人机协同的创造型劳动；技能差距被压缩，人力资本加速积累。' },
    { k: '对劳动资料', v: '算力、大模型与智能装备成为新的通用基础设施，生产工具第一次拥有了「认知」能力。' },
    { k: '对劳动对象', v: '数据成为新型生产要素，AI for Science 拓展了材料、能源、生命等新的劳动对象边界。' },
    { k: '对优化组合', v: '要素跨行业、跨区域高效配置，最终体现为全要素生产率的大幅提升——这正是新质生产力的核心标志。' },
  ];
</script>

<section class="epi" id="epilogue">
  <div class="stage" bind:this={stage} aria-hidden="true"></div>
  <div class="container inner">
    <div class="kicker">{tr('结语 · Epilogue')}</div>
    <h2>{tr('人工智能不是旧生产方式的「修补」，')}<br /><span class="grad-text">{tr('而是生产力三要素的系统性跃升')}</span></h2>
    <div class="points">
      {#each POINTS as p, i}
        <div class="pt">
          <span class="n">0{i + 1}</span>
          <div>
            <div class="k">{tr(p.k)}</div>
            <div class="v">{tr(p.v)}</div>
          </div>
        </div>
      {/each}
    </div>
    <p class="hint">{tr('点击背景，为这张智能网络添加新的节点')}</p>
  </div>
</section>

<style>
  .epi {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 120px 0;
  }
  .stage {
    position: absolute;
    inset: 0;
  }
  .stage :global(canvas) {
    display: block;
  }
  .inner {
    position: relative;
    z-index: 2;
    pointer-events: none;
  }
  .kicker {
    font-size: 12px;
    letter-spacing: 0.3em;
    color: var(--accent);
    margin-bottom: 18px;
  }
  h2 {
    font-size: clamp(26px, 4vw, 48px);
    line-height: 1.35;
    margin-bottom: 40px;
  }
  .points {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    max-width: 980px;
  }
  .pt {
    display: flex;
    gap: 14px;
    padding: 18px 20px;
    border-radius: var(--radius-l);
    background: var(--glass);
    border: 1px solid var(--border);
    backdrop-filter: blur(6px);
  }
  .n {
    font-size: 22px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1.2;
  }
  .k {
    font-weight: 700;
    margin-bottom: 4px;
  }
  .v {
    font-size: 14px;
    color: var(--text-2);
  }
  .hint {
    margin-top: 28px;
    font-size: 12px;
    color: var(--text-3);
    letter-spacing: 0.15em;
  }
  @media (max-width: 760px) {
    .points {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
