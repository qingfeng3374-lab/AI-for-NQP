<script>
  /** 图例：items = [{ label, color, shape: 'square'|'line'|'dot'|'dash' }] */
  let { items = [], align = 'left' } = $props();
</script>

<ul class="legend" style:justify-content={align === 'center' ? 'center' : 'flex-start'}>
  {#each items as it}
    <li>
      <span class="mk {it.shape ?? 'square'}" style:--c={it.color}></span>
      <span>{it.label}</span>
    </li>
  {/each}
</ul>

<style>
  .legend {
    list-style: none;
    margin: 0 0 8px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-size: 12.5px;
    color: var(--text-2);
  }
  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .mk {
    display: inline-block;
    flex: none;
  }
  .square {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: var(--c);
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--c);
  }
  .line {
    width: 16px;
    height: 2px;
    border-radius: 2px;
    background: var(--c);
  }
  .dash {
    width: 16px;
    height: 0;
    border-top: 2px dashed var(--c);
  }
</style>
