<script>
  import { SOURCES } from '../data/sources.js';
  import { tr } from '../lib/i18n/lang.svelte.js';
</script>

<footer class="foot" id="sources">
  <div class="container">
    <h2>{tr('数据来源与说明')}</h2>
    <p class="note">
      {tr('本站所有数据均来自公开发布的政府文件、统计公报、国际机构报告与同行评审研究，每张图表下方注明出处，并可通过「数据」按钮切换为数据表视图。')}
      {tr('部分指标存在统计口径差异（如算力 FP32 / FP16、产业规模的不同统计范围），已在图表中标注；情景推算与模拟器为教学示意，不构成预测。数据截至 2026 年 10 月。')}
    </p>
    <div class="cols">
      {#each SOURCES as g}
        <div class="col">
          <h3>{tr(g.group)}</h3>
          <ul>
            {#each g.items as it}
              <li><a href={it.url} target="_blank" rel="noopener noreferrer">{tr(it.name)}</a></li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
    <div class="bottom">
      <span>{tr('智能涌现 · 人工智能作为新质生产力的作用和意义')}</span>
      <span>Svelte 5 · D3.js · p5.js · d3-sankey · TopoJSON</span>
    </div>
  </div>
</footer>

<style>
  .foot {
    padding: 80px 0 40px;
    border-top: 1px solid var(--border);
    background: linear-gradient(180deg, var(--surface-2), var(--page));
  }
  h2 {
    font-size: 24px;
    margin-bottom: 12px;
  }
  .note {
    color: var(--text-2);
    font-size: 14px;
    max-width: 900px;
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px;
    margin-top: 28px;
  }
  h3 {
    font-size: 13px;
    color: var(--accent);
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  li a {
    color: var(--text-2);
    font-size: 12.5px;
    line-height: 1.5;
  }
  li a:hover {
    color: var(--text-1);
  }
  .bottom {
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
    color: var(--text-3);
  }
  @media (max-width: 960px) {
    .cols {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 560px) {
    .cols {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
