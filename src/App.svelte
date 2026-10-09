<script>
  import { tr } from './lib/i18n/lang.svelte.js';
  import Nav from './lib/components/Nav.svelte';
  import Tooltip from './lib/components/Tooltip.svelte';
  import StoryPage from './pages/StoryPage.svelte';
  import { route, PAGES, hrefOf } from './lib/stores/router.svelte.js';

  // 工具页按需加载（代码分割），叙事页随主包加载
  const LOADERS = {
    graph: () => import('./pages/GraphPage.svelte'),
    timeline: () => import('./pages/TimelinePage.svelte'),
    job: () => import('./pages/JobPage.svelte'),
    roi: () => import('./pages/RoiPage.svelte'),
    data: () => import('./pages/DataPage.svelte'),
  };
  const current = $derived(PAGES.find((p) => p.id === route.page));
  const others = $derived(PAGES.filter((p) => p.id !== route.page && p.id !== 'story'));

  $effect(() => {
    document.title = route.page === 'story' ? tr('智能涌现 · AI 新质生产力') : `${tr(current.name)} · ${tr('智能涌现')}`;
  });
</script>

<Nav />
<main>
  {#if route.page === 'story'}
    <StoryPage />
  {:else}
    {#key route.page}
      {#await LOADERS[route.page]()}
        <div class="loading">{tr('加载中…')}</div>
      {:then mod}
        {@const Page = mod.default}
        <Page />
      {/await}
    {/key}
    <!-- 工具页底部：互相跳转 -->
    <footer class="page-foot">
      <div class="container">
        <span>{tr('继续探索：')}</span>
        <a href="#/">{tr('数据叙事')}</a>
        {#each others as p}<a href={hrefOf(p.id)}>{tr(p.name)}</a>{/each}
      </div>
    </footer>
  {/if}
</main>
<Tooltip />

<style>
  .loading {
    min-height: 70vh;
    display: grid;
    place-items: center;
    color: var(--text-3);
  }
  .page-foot {
    margin-top: 60px;
    padding: 28px 0 40px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-3);
  }
  .page-foot .container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
  }
  .page-foot a {
    color: var(--text-2);
  }
  .page-foot a:hover {
    color: var(--accent);
  }
</style>
