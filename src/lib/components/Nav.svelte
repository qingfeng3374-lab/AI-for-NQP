<script>
  import { tr } from '../i18n/lang.svelte.js';
  import { onMount } from 'svelte';
  import { CHAPTERS } from '../../data/chapters.js';
  import { PAGES, route, hrefOf } from '../stores/router.svelte.js';
  import ThemeToggle from './ThemeToggle.svelte';
  import LangToggle from './LangToggle.svelte';

  /**
   * 顶部导航：品牌 / 页面切换（可跳转的独立界面）/ 日夜切换
   * 叙事页额外显示章节子导航、阅读进度条与右侧进度点
   */
  let active = $state('');
  let progress = $state(0);
  let scrolled = $state(false);
  const isStory = $derived(route.page === 'story');

  onMount(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress = max > 0 ? h.scrollTop / max : 0;
      scrolled = h.scrollTop > 40;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  });

  // 章节高亮：叙事页挂载后再观察章节元素
  $effect(() => {
    if (!isStory) return;
    let io;
    const t = setTimeout(() => {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) active = e.target.id;
        },
        { rootMargin: '-35% 0px -60% 0px' },
      );
      document.querySelectorAll('section[data-chapter], #hero').forEach((s) => io.observe(s));
    }, 50);
    return () => {
      clearTimeout(t);
      io?.disconnect();
    };
  });
</script>

<nav class="top" class:scrolled={scrolled || !isStory} aria-label={tr('主导航')}>
  <a class="brand" href="#/" aria-label={tr('回到首页')}>
    <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true">
      <defs
        ><linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"
          ><stop offset="0" style:stop-color="var(--accent)" /><stop offset="1" style:stop-color="var(--accent-2)" /></linearGradient
        ></defs
      >
      <path d="M12 46 L26 20 L40 36 L52 14" fill="none" stroke="url(#ng)" stroke-width="5" stroke-linecap="round" />
    </svg>
    <span>{tr('智能涌现')}</span>
  </a>

  <ul class="pages">
    {#each PAGES as p}
      <li>
        <a href={hrefOf(p.id)} class:on={route.page === p.id} aria-current={route.page === p.id ? 'page' : undefined}>
          <span class="full">{tr(p.name)}</span><span class="short">{tr(p.short)}</span>
        </a>
      </li>
    {/each}
  </ul>

  <LangToggle />
  <ThemeToggle />

  {#if isStory}
    <div class="bar" style:transform="scaleX({progress})"></div>
  {/if}
</nav>

{#if isStory}
  <nav class="sub" class:show={scrolled} aria-label={tr('章节导航')}>
    <ul>
      {#each CHAPTERS as c}
        <li>
          <a href="#{c.id}" class:on={active === c.id}><span class="n">{c.num}</span>{tr(c.short)}</a>
        </li>
      {/each}
    </ul>
  </nav>

  <aside class="dots" aria-hidden="true">
    {#each CHAPTERS as c}
      <a href="#{c.id}" class:on={active === c.id} tabindex="-1">
        <span class="tip">{c.num} {tr(c.title)}</span>
      </a>
    {/each}
  </aside>
{/if}

<style>
  .top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 16px;
    height: 56px;
    padding: 0 var(--gutter);
    transition: background 0.3s, border-color 0.3s;
    border-bottom: 1px solid transparent;
  }
  .top.scrolled {
    background: var(--nav-bg);
    backdrop-filter: blur(14px) saturate(140%);
    border-bottom-color: var(--border);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-1);
    font-weight: 800;
    letter-spacing: 0.08em;
    white-space: nowrap;
    text-decoration: none;
  }
  .pages {
    list-style: none;
    margin: 0 0 0 auto;
    padding: 3px;
    min-width: 0;
    display: flex;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .pages::-webkit-scrollbar {
    display: none;
  }
  .pages a {
    display: block;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 13px;
    color: var(--text-2);
    white-space: nowrap;
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
  }
  .pages a:hover {
    color: var(--text-1);
  }
  .pages a.on {
    color: #fff;
    background: var(--accent-grad);
    box-shadow: 0 4px 14px rgba(var(--accent-rgb), 0.35);
    font-weight: 600;
  }
  .short {
    display: none;
  }
  .bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: var(--accent-grad);
    transform-origin: 0 50%;
  }

  /* 章节子导航 */
  .sub {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    z-index: 99;
    display: flex;
    justify-content: center;
    padding: 0 var(--gutter);
    background: var(--nav-bg);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s, opacity 0.3s;
  }
  .sub.show {
    transform: none;
    opacity: 1;
    pointer-events: auto;
  }
  .sub ul {
    list-style: none;
    margin: 0;
    padding: 4px 0;
    display: flex;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    min-width: 0;
  }
  .sub ul::-webkit-scrollbar {
    display: none;
  }
  .sub a {
    display: block;
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 12.5px;
    color: var(--text-2);
    white-space: nowrap;
    text-decoration: none;
  }
  .sub a:hover {
    color: var(--text-1);
    background: var(--hover-wash);
  }
  .sub a.on {
    color: var(--accent);
    background: var(--accent-wash);
  }
  .n {
    font-size: 10px;
    color: var(--accent);
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
  }

  .dots {
    position: fixed;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 90;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .dots a {
    position: relative;
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--surface-3);
    border: 1px solid var(--border-strong);
    transition: all 0.25s;
  }
  .dots a.on {
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
    transform: scale(1.3);
  }
  .tip {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    font-size: 12px;
    color: var(--text-1);
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .dots a:hover .tip {
    opacity: 1;
  }
  @media (max-width: 1100px) {
    .dots {
      display: none;
    }
    .pages a {
      padding: 5px 10px;
    }
  }
  @media (max-width: 760px) {
    .full {
      display: none;
    }
    .short {
      display: inline;
    }
    .brand span {
      display: none;
    }
    .top {
      gap: 8px;
    }
  }
</style>
