<script>
  import { lang, toggleLang } from '../i18n/lang.svelte.js';
</script>

<button class="lt" onclick={toggleLang} aria-label={lang.code === 'en' ? '切换到中文' : 'Switch to English'} title={lang.code === 'en' ? '切换到中文' : 'Switch to English'}>
  <span class:on={lang.code === 'zh'}>中</span>
  <span class:on={lang.code === 'en'}>EN</span>
</button>

<style>
  .lt {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    flex: none;
  }
  .lt:hover {
    border-color: var(--accent);
  }
  span {
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-3);
    transition: all 0.25s;
  }
  span.on {
    color: #fff;
    background: var(--accent-grad);
  }
</style>
