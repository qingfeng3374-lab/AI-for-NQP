<script>
  import { tr } from '../i18n/lang.svelte.js';
  import { inview } from '../actions/inview.js';

  /**
   * 图表卡片：标题 / 副标题 / 工具栏 / 图表主体 / 数据表视图 / 来源
   * table: { columns: string[], rows: (string|number)[][] } —— 每个图表都有可读的数据表孪生视图
   */
  let {
    title,
    subtitle = '',
    source = '',
    table = null,
    span = 1,
    tall = false,
    controls,
    children,
    footer,
  } = $props();

  let showTable = $state(false);
  let shown = $state(false);
</script>

<figure
  class="card"
  class:span-2={span === 2}
  class:tall
  class:shown
  use:inview={{ onEnter: () => (shown = true), threshold: 0.08 }}
>
  <header>
    <div class="titles">
      <h3>{title}</h3>
      {#if subtitle}<p class="sub">{subtitle}</p>{/if}
    </div>
    <div class="tools">
      {@render controls?.()}
      {#if table}
        <button
          class="tbl-btn"
          class:on={showTable}
          onclick={() => (showTable = !showTable)}
          aria-pressed={showTable}
          title={tr('切换数据表视图')}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
            ><path
              d="M2 3h12v10H2zM2 6.3h12M2 9.6h12M6.5 3v10"
              fill="none"
              stroke="currentColor"
              stroke-width="1.3"
            /></svg
          >
          {tr(showTable ? '图表' : '数据')}
        </button>
      {/if}
    </div>
  </header>

  <div class="body">
    {#if showTable && table}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>{#each table.columns as c}<th>{c}</th>{/each}</tr>
          </thead>
          <tbody>
            {#each table.rows as r}
              <tr>{#each r as cell, i}<td class:num={i > 0}>{cell}</td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </div>

  {#if footer}<div class="foot">{@render footer()}</div>{/if}
  {#if source}<figcaption>{tr('来源：')}{source}</figcaption>{/if}
</figure>

<style>
  .card {
    margin: 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 20px 22px 16px;
    border-radius: var(--radius-l);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease, border-color 0.3s;
  }
  .card.shown {
    opacity: 1;
    transform: none;
  }
  .card:hover {
    border-color: var(--border-strong);
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .titles {
    min-width: 0;
    flex: 1 1 260px;
  }
  h3 {
    font-size: 17px;
    font-weight: 650;
  }
  .sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--text-3);
    line-height: 1.5;
  }
  .tools {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .tbl-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 12px;
    transition: all 0.2s;
  }
  .tbl-btn:hover,
  .tbl-btn.on {
    color: var(--text-1);
    border-color: var(--border-strong);
  }
  .body {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .tall .body {
    min-height: 420px;
  }
  .table-wrap {
    max-height: 440px;
    overflow: auto;
    border-radius: var(--radius-s);
    border: 1px solid var(--border);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th,
  td {
    padding: 7px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  th {
    position: sticky;
    top: 0;
    background: var(--surface-3);
    color: var(--text-2);
    font-weight: 600;
  }
  td {
    color: var(--text-2);
  }
  td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--text-1);
  }
  .foot {
    margin-top: 12px;
  }
  figcaption {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--border);
    font-size: 11.5px;
    color: var(--text-3);
    line-height: 1.5;
  }
</style>
