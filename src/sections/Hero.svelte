<script>
  import { tr, lang } from '../lib/i18n/lang.svelte.js';
  import { onMount } from 'svelte';
  import { createHeroSketch } from '../lib/sketches/heroSketch.js';

  let stage;
  let sketch;
  const heroWord = () => (lang.code === 'en' ? 'NEW QUALITY|PRODUCTIVE FORCES' : '新质生产力');
  // 语言切换时，粒子重新汇聚成对应语言的文字
  $effect(() => {
    const wd = heroWord();
    sketch?.setWord?.(wd);
  });
  let ready = $state(false);

  onMount(() => {
    let io;
    let alive = true;
    const t = setTimeout(() => (ready = true), 400);
    // p5 体积较大，按需异步加载，拆分为独立 chunk
    import('p5').then(({ default: p5 }) => {
      if (!alive) return;
      sketch = createHeroSketch(p5, stage, { word: heroWord() });
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? sketch.loop() : sketch.noLoop()));
      io.observe(stage);
    });
    return () => {
      alive = false;
      clearTimeout(t);
      io?.disconnect();
      sketch?.remove();
    };
  });
</script>

<header id="hero" class="hero">
  <div class="stage" bind:this={stage}></div>

  <div class="overlay" class:ready>
    <div class="kicker">
      <span class="pulse"></span> {tr('一场关于生产力跃迁的数据叙事')}
    </div>
    <h1 class="sr-only">{tr('智能涌现：人工智能作为新质生产力的作用和意义')}</h1>

    <div class="spacer" aria-hidden="true"></div>

    <p class="title">
      <span class="grad-text">{tr('智能涌现')}</span>
      <span class="sep">·</span>
      {@html tr('人工智能何以成为<b>新质生产力</b>')}
    </p>
    <p class="sub">
      {@html tr('新质生产力以<b>劳动者、劳动资料、劳动对象及其优化组合的跃升</b>为基本内涵，以<b>全要素生产率大幅提升</b>为核心标志。人工智能正同时作用于这三大要素——本网站用 30 余组公开数据、30 余个交互可视化，回答它"为什么是"与"如何是"。')}
    </p>
    <div class="hint">{tr('移动鼠标扰动粒子 · 向下滚动开始')}</div>
  </div>

  <a class="scroll-cue" href="#concept" aria-label={tr('向下滚动')}>
    <span></span>
  </a>
</header>

<style>
  .hero {
    position: relative;
    height: 100vh;
    min-height: 640px;
    overflow: hidden;
  }
  .stage {
    position: absolute;
    inset: 0;
    touch-action: pan-y;
  }
  .stage :global(canvas) {
    display: block;
  }
  .overlay {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 96px var(--gutter) 72px;
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1.4s ease 0.6s;
  }
  .overlay.ready {
    opacity: 1;
  }
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    letter-spacing: 0.3em;
    color: var(--text-2);
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--glass);
    backdrop-filter: blur(6px);
  }
  .pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    to {
      box-shadow: 0 0 0 12px rgba(var(--accent-rgb), 0);
    }
  }
  .spacer {
    flex: 1;
  }
  .title {
    margin: 0 0 14px;
    font-size: clamp(20px, 2.6vw, 30px);
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .title :global(b) {
    color: var(--text-1);
  }
  .sep {
    color: var(--text-3);
    margin: 0 0.4em;
  }
  .sub {
    max-width: 760px;
    margin: 0 auto 18px;
    color: var(--text-2);
    font-size: clamp(14px, 1.3vw, 16px);
    line-height: 1.8;
  }
  .sub :global(b) {
    color: var(--text-1);
    font-weight: 600;
  }
  .hint {
    font-size: 12px;
    color: var(--text-3);
    letter-spacing: 0.2em;
  }
  .scroll-cue {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: 22px;
    width: 22px;
    height: 36px;
    margin-left: -11px;
    border: 1.5px solid var(--text-3);
    border-radius: 12px;
  }
  .scroll-cue span {
    position: absolute;
    left: 50%;
    top: 7px;
    width: 3px;
    height: 7px;
    margin-left: -1.5px;
    border-radius: 2px;
    background: var(--accent);
    animation: cue 1.8s infinite;
  }
  @keyframes cue {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    80% {
      transform: translateY(12px);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
</style>
