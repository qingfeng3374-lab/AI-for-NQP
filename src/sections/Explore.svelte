<script>
  import { tr } from '../lib/i18n/lang.svelte.js';
  import { PAGES, hrefOf } from '../lib/stores/router.svelte.js';
  import { inview } from '../lib/actions/inview.js';

  /** 叙事结束后的"继续探索"：跳转到各个工具页 */
  const tools = PAGES.filter((p) => p.id !== 'story');
  let shown = $state(false);

  // 每个工具一枚示意图标（线性 SVG）
  const ICONS = {
    graph: 'M6 18a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM18 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM18 20a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM12 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM7.6 14.8l2.8-2.4M13.6 10l2.8-2.6M13.7 12.4l2.7 4',
    timeline: 'M3 12h18M6 12v-4M10 12v6M14 12v-5M18 12v4M6 8h0M10 18h0',
    job: 'M12 4a4 4 0 1 1 0 8a4 4 0 0 1 0-8zM4 21c0-4 3.6-7 8-7s8 3 8 7M17 3l3 3l-3 3',
    roi: 'M4 20V10M10 20V4M16 20v-7M2 20h20M14 8l3-3l3 3',
    data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3s-3.6 3-8 3s-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  };
</script>

<section class="explore" id="explore">
  <div class="container">
    <div class="head" class:shown use:inview={{ onEnter: () => (shown = true) }}>
      <div class="kicker">{tr('继续探索 · Explore')}</div>
      <h2>{tr('从「看数据」到「用数据」')}</h2>
      <p>{tr('五个交互工具，把"人工智能作为新质生产力"落到每一个人、每一家企业的具体场景中。')}</p>
    </div>
    <div class="grid">
      {#each tools as t, i}
        <a class="tool" class:shown href={hrefOf(t.id)} style:transition-delay="{i * 90}ms">
          <span class="ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26"
              ><path d={ICONS[t.id]} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg
            >
          </span>
          <span class="nm">{tr(t.name)}</span>
          <span class="ds">{tr(t.desc)}</span>
          <span class="go">{tr('进入 →')}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .explore {
    padding: 100px 0 60px;
  }
  .head {
    text-align: center;
    margin-bottom: 36px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.7s ease;
  }
  .head.shown {
    opacity: 1;
    transform: none;
  }
  .kicker {
    font-size: 12px;
    letter-spacing: 0.3em;
    color: var(--accent);
    margin-bottom: 10px;
  }
  h2 {
    font-size: clamp(26px, 3.6vw, 40px);
    margin-bottom: 10px;
  }
  .head p {
    color: var(--text-2);
    margin: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
  }
  .tool {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 18px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    color: var(--text-1);
    text-decoration: none;
    overflow: hidden;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease,
      border-color 0.25s,
      box-shadow 0.25s;
  }
  .tool.shown {
    opacity: 1;
    transform: none;
  }
  .tool::after {
    content: '';
    position: absolute;
    inset: auto -30% -60% auto;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.18), transparent 70%);
    transition: transform 0.4s;
  }
  .tool:hover {
    border-color: var(--accent);
    box-shadow: 0 16px 40px rgba(var(--accent-rgb), 0.18);
    text-decoration: none;
  }
  .tool:hover::after {
    transform: scale(1.5);
  }
  .ic {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #fff;
    background: var(--accent-grad);
  }
  .nm {
    font-size: 17px;
    font-weight: 800;
  }
  .ds {
    font-size: 12.5px;
    color: var(--text-2);
    line-height: 1.55;
    flex: 1;
  }
  .go {
    font-size: 12.5px;
    color: var(--accent);
    font-weight: 600;
  }
  @media (max-width: 1000px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 520px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
