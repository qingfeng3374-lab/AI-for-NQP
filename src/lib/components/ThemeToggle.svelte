<script>
  import { tr } from '../i18n/lang.svelte.js';
  import { theme, toggleTheme } from '../stores/theme.svelte.js';

  /** 日间 / 夜间切换按钮：图标在太阳与月亮之间旋转变形 */
  const isLight = $derived(theme.mode === 'light');
</script>

<button
  class="toggle"
  class:light={isLight}
  onclick={(e) => toggleTheme(e)}
  aria-label={tr(isLight ? '切换到夜间模式' : '切换到日间模式')}
  title={tr(isLight ? '切换到夜间模式' : '切换到日间模式')}
>
  <span class="track">
    <span class="knob">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <!-- 太阳光芒（日间显示） -->
        <g class="rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" /><line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" /><line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
        </g>
        <!-- 月亮遮罩：夜间时用一个圆"咬掉"太阳的一角 -->
        <mask id="tt-moon">
          <rect width="24" height="24" fill="white" />
          <circle class="bite" cx="17" cy="7" r="6" fill="black" />
        </mask>
        <circle class="body" cx="12" cy="12" r="6" fill="currentColor" mask="url(#tt-moon)" />
      </svg>
    </span>
  </span>
  <span class="lbl">{tr(isLight ? '日间' : '夜间')}</span>
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 4px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    color: var(--text-1);
    font-size: 12.5px;
    flex: none;
    transition: background 0.3s, border-color 0.3s;
  }
  .toggle:hover {
    border-color: var(--accent);
  }
  .track {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 999px;
    background: linear-gradient(90deg, #1c2740, #0b1020);
    transition: background 0.4s;
  }
  .light .track {
    background: linear-gradient(90deg, #ffd36e, #ff8a3d);
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #f2f5fa;
    color: #6b7cff;
    box-shadow: 0 0 10px rgba(107, 124, 255, 0.6);
    transition:
      transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
      background 0.3s,
      color 0.3s;
  }
  .light .knob {
    transform: translateX(20px) rotate(180deg);
    background: #ffffff;
    color: #ff7a1a;
    box-shadow: 0 0 12px rgba(255, 138, 61, 0.8);
  }
  .rays {
    opacity: 0;
    transform-origin: 12px 12px;
    transform: scale(0.5);
    transition: all 0.4s;
  }
  .light .rays {
    opacity: 1;
    transform: scale(1);
  }
  .bite {
    transition: cx 0.4s, cy 0.4s;
  }
  .light .bite {
    cx: 30;
    cy: -6;
  }
  .lbl {
    white-space: nowrap;
  }
  @media (max-width: 640px) {
    .lbl {
      display: none;
    }
    .toggle {
      padding: 4px;
    }
  }
</style>
