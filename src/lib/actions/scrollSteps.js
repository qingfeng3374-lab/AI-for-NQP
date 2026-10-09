/**
 * use:scrollSteps —— 滚动叙事：监听容器内 [data-step] 元素，
 * 当某一步越过视口中线时回调其索引。
 */
export function scrollSteps(node, { onStep }) {
  const steps = [...node.querySelectorAll('[data-step]')];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onStep?.(+e.target.dataset.step);
      }
    },
    { rootMargin: '-48% 0px -48% 0px', threshold: 0 },
  );
  steps.forEach((s) => io.observe(s));
  return {
    destroy() {
      io.disconnect();
    },
  };
}
