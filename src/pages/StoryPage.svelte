<script>
  import { onMount, tick } from 'svelte';
  import { route } from '../lib/stores/router.svelte.js';
  import Hero from '../sections/Hero.svelte';
  import Concept from '../sections/Concept.svelte';
  import History from '../sections/History.svelte';
  import Engine from '../sections/Engine.svelte';
  import China from '../sections/China.svelte';
  import Industry from '../sections/Industry.svelte';
  import Efficiency from '../sections/Efficiency.svelte';
  import Labor from '../sections/Labor.svelte';
  import Geo from '../sections/Geo.svelte';
  import Green from '../sections/Green.svelte';
  import Future from '../sections/Future.svelte';
  import Epilogue from '../sections/Epilogue.svelte';
  import Explore from '../sections/Explore.svelte';
  import Sources from '../sections/Sources.svelte';

  // 从其他页面跳转到"#章节"时，页面挂载后再滚动到对应章节
  onMount(async () => {
    if (route.anchor) {
      await tick();
      document.getElementById(route.anchor)?.scrollIntoView();
    }
  });
</script>

<Hero />
<Concept />
<History />
<Engine />
<China />
<Industry />
<Efficiency />
<Labor />
<Geo />
<Green />
<Future />
<Epilogue />
<Explore />
<Sources />
