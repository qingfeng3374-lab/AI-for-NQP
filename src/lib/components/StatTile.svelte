<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { inview } from '../actions/inview.js';
  import { loc } from '../i18n/lang.svelte.js';

  /** 指标卡：数字滚动 + 标签 + 注释 */
  let {
    value,
    decimals = 0,
    prefix = '',
    suffix = '',
    unit = '',
    label,
    note = '',
    delta = '',
    accent = 'var(--accent)',
    icon = '',
  } = $props();

  const n = new Tween(0, { duration: 1800, easing: cubicOut });
  // 进入视口后才开始滚动；之后 value 变化（如切换语言换算单位）时同步更新
  let entered = $state(false);
  $effect(() => {
    if (entered) n.target = value;
  });
  const text = $derived(
    n.current.toLocaleString(loc(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );
</script>

<div class="tile" style:--a={accent} use:inview={{ onEnter: () => (entered = true) }}>
  <div class="label">
    {#if icon}<span class="ic" aria-hidden="true">{icon}</span>{/if}
    {label}
  </div>
  <div class="value" aria-label="{prefix}{value}{suffix}{unit}">
    <span class="pre">{prefix}</span>{text}<span class="suf">{suffix}</span>
    {#if unit}<span class="unit">{unit}</span>{/if}
  </div>
  {#if delta}<div class="delta">{delta}</div>{/if}
  {#if note}<div class="note">{note}</div>{/if}
</div>

<style>
  .tile {
    position: relative;
    padding: 18px 20px;
    border-radius: var(--radius-m);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    min-width: 0;
  }
  .tile::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--a);
    opacity: 0.9;
  }
  .tile::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--a) 22%, transparent), transparent 70%);
    pointer-events: none;
  }
  .label {
    font-size: 13px;
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ic {
    font-size: 15px;
  }
  .value {
    margin-top: 6px;
    font-size: clamp(26px, 3vw, 36px);
    font-weight: 750;
    letter-spacing: -0.01em;
    color: var(--text-1);
    line-height: 1.15;
    white-space: nowrap;
  }
  .pre,
  .suf {
    font-size: 0.7em;
    font-weight: 600;
  }
  .unit {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-2);
    margin-left: 4px;
  }
  .delta {
    margin-top: 4px;
    font-size: 12.5px;
    color: var(--a);
    font-weight: 600;
  }
  .note {
    margin-top: 6px;
    font-size: 11.5px;
    color: var(--text-3);
    line-height: 1.45;
  }
</style>
