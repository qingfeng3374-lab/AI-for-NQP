<script>
  import { inview } from '../actions/inview.js';

  /** 章节容器：编号 + 眉题 + 标题 + 导语 + 内容 */
  let { id, num, kicker = '', title, lead = '', children } = $props();
  let shown = $state(false);
</script>

<section {id} class="chapter" data-chapter={id}>
  <div class="container">
    <header class="head" class:shown use:inview={{ onEnter: () => (shown = true) }}>
      <div class="num" aria-hidden="true">{num}</div>
      <div class="meta">
        {#if kicker}<div class="kicker">{kicker}</div>{/if}
        <h2>{title}</h2>
        {#if lead}<p class="lead">{@html lead}</p>{/if}
      </div>
    </header>
    <div class="body">
      {@render children?.()}
    </div>
  </div>
</section>

<style>
  .chapter {
    position: relative;
    padding: clamp(80px, 12vh, 140px) 0 clamp(40px, 6vh, 80px);
  }
  .chapter::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    width: min(var(--content-w), 92vw);
    height: 1px;
    transform: translateX(-50%);
    background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
  }
  .head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: clamp(16px, 3vw, 40px);
    align-items: start;
    margin-bottom: clamp(32px, 5vh, 56px);
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .head.shown {
    opacity: 1;
    transform: none;
  }
  .num {
    font-size: clamp(56px, 9vw, 120px);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.04em;
    background: var(--num-grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    user-select: none;
  }
  .kicker {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.24em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 10px;
    padding: 2px 10px;
    border: 1px solid rgba(var(--accent-rgb), 0.35);
    border-radius: 999px;
  }
  h2 {
    font-size: clamp(28px, 4vw, 44px);
    margin-bottom: 14px;
  }
  .lead {
    color: var(--text-2);
    font-size: clamp(15px, 1.4vw, 17.5px);
    max-width: 820px;
    margin: 0;
  }
  .lead :global(b) {
    color: var(--text-1);
  }
  .lead :global(em) {
    font-style: normal;
    color: var(--accent);
  }
  @media (max-width: 600px) {
    .head {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
    }
  }
</style>
