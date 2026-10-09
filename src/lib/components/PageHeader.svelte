<script>
  /** 工具页通用页头：眉题 + 大标题 + 说明 + 可选的右侧补充内容 */
  let { kicker = '', title, lead = '', aside } = $props();
</script>

<header class="ph">
  <div class="container inner">
    <div class="main">
      {#if kicker}<div class="kicker">{kicker}</div>{/if}
      <h1><span class="grad-text">{title}</span></h1>
      {#if lead}<p class="lead">{@html lead}</p>{/if}
    </div>
    {#if aside}<div class="aside">{@render aside()}</div>{/if}
  </div>
</header>

<style>
  .ph {
    padding: 110px 0 28px;
    position: relative;
  }
  .inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: end;
  }
  .kicker {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.24em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 12px;
    padding: 2px 10px;
    border: 1px solid rgba(var(--accent-rgb), 0.35);
    border-radius: 999px;
  }
  h1 {
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 900;
    letter-spacing: -0.01em;
    margin-bottom: 12px;
  }
  .lead {
    color: var(--text-2);
    max-width: 820px;
    font-size: clamp(14.5px, 1.3vw, 16.5px);
    margin: 0;
  }
  .lead :global(b) {
    color: var(--text-1);
  }
  @media (max-width: 760px) {
    .inner {
      grid-template-columns: minmax(0, 1fr);
    }
    .ph {
      padding-top: 88px;
    }
  }
</style>
