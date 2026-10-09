<script>
  import Section from '../lib/components/Section.svelte';
  import LongRunGrowth from '../lib/charts/LongRunGrowth.svelte';
  import { tr } from '../lib/i18n/lang.svelte.js';
</script>

<Section
  id="history"
  num="02"
  kicker="History"
  title={tr('生产力的四次跃迁')}
  lead={tr('人类历史上每一次生产力的质变，都源自一种<b>通用目的技术</b>（General Purpose Technology）：它不只改进某个行业，而是重塑所有行业的生产方式。向下滚动，沿着千年的人均产出曲线，看人工智能为何被视为第四次跃迁的引擎。')}
>
  <LongRunGrowth />
  <p class="src">{tr('来源：Maddison Project Database 2023（Our World in Data）；Maddison (2010) 历史统计；普华永道《Sizing the prize》。情景推算假设基准人均增速 2.2%/年。')}</p>
</Section>

<style>
  .src {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: -10vh;
  }
</style>
