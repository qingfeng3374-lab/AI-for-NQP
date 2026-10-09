/**
 * use:inview —— 元素进入视口时回调（默认只触发一次）
 * <div use:inview={{ onEnter: () => (shown = true) }}>
 */
export function inview(node, params = {}) {
  let { threshold = 0.2, once = true, rootMargin = '0px 0px -10% 0px', onEnter, onLeave } = params;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          onEnter?.(e);
          if (once) io.disconnect();
        } else {
          onLeave?.(e);
        }
      }
    },
    { threshold, rootMargin },
  );
  io.observe(node);

  return {
    update(p) {
      ({ onEnter, onLeave } = p);
    },
    destroy() {
      io.disconnect();
    },
  };
}
