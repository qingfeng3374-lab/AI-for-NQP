/**
 * 首屏生成艺术（p5.js 实例模式）
 * 隐喻："智能涌现" —— 离散的粒子（数据 / 劳动 / 资本）在 AI 的组织下
 * 从无序走向有序，汇聚成「新质生产力」五个字；鼠标靠近时粒子被扰动，
 * 近邻粒子之间连线，形成神经网络般的拓扑。
 */
import { pal } from '../stores/theme.svelte.js';

export function createHeroSketch(p5, el, opts = {}) {
  // 支持多行（以 | 分隔），英文模式下显示两行
  let word = opts.word ?? '新质生产力';
  // 颜色每帧从 pal.hero 读取，主题切换时即时生效

  return new p5((p) => {
    let particles = [];
    let targets = [];
    let w = 0;
    let h = 0;
    let t0 = 0;
    const mouse = { x: -9999, y: -9999 };

    /** 在离屏 canvas 上绘制文字并按步长采样像素，得到粒子目标点；字号按实际测量自适应宽度 */
    function sampleText() {
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const ctx = off.getContext('2d');
      const lines = word.split('|');
      const family = '"PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif';
      ctx.font = `800 100px ${family}`;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const fs = Math.min((100 * w * 0.86) / widest, (h * (lines.length > 1 ? 0.36 : 0.26)) / lines.length);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${fs}px ${family}`;
      const lh = fs * 1.08;
      lines.forEach((l, i) => ctx.fillText(l, w / 2, h * 0.47 + (i - (lines.length - 1) / 2) * lh));
      const data = ctx.getImageData(0, 0, w, h).data;
      const step = Math.max(4, Math.round(fs / 26));
      const pts = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
        }
      }
      return pts;
    }

    /** 切换文字（语言切换时调用），粒子从当前位置重新汇聚 */
    p.setWord = (nw) => {
      if (nw === word) return;
      word = nw;
      build();
    };

    function build() {
      w = el.clientWidth;
      h = el.clientHeight;
      targets = sampleText();
      const n = targets.length;
      const prev = particles;
      particles = targets.map((t, i) => {
        const old = prev[i];
        return {
          x: old ? old.x : p.random(w),
          y: old ? old.y : p.random(h),
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          ci: i % 3,
          r: p.random(1.2, 2.4),
          seed: p.random(1000),
        };
      });
      // 额外的游离粒子：尚未被组织的"潜在要素"
      const free = Math.round(n * 0.12);
      for (let i = 0; i < free; i++) {
        particles.push({
          x: p.random(w),
          y: p.random(h),
          vx: p.random(-0.3, 0.3),
          vy: p.random(-0.3, 0.3),
          tx: null,
          ty: null,
          ci: i % 3,
          r: p.random(0.8, 1.6),
          seed: p.random(1000),
        });
      }
      t0 = p.millis();
    }

    p.setup = () => {
      const c = p.createCanvas(el.clientWidth, el.clientHeight);
      c.parent(el);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      build();
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      el.addEventListener('pointerleave', () => {
        mouse.x = mouse.y = -9999;
      });
    };

    p.windowResized = () => {
      p.resizeCanvas(el.clientWidth, el.clientHeight);
      build();
    };

    p.draw = () => {
      p.clear();
      const t = (p.millis() - t0) / 1000;
      // 汇聚进度：前 1.2 秒混沌，随后逐步有序
      const order = p.constrain((t - 0.6) / 2.4, 0, 1);
      const ease = order * order * (3 - 2 * order);
      const ctx = p.drawingContext;

      // 1) 粒子运动
      for (const q of particles) {
        if (q.tx !== null) {
          const nx = p.noise(q.seed, t * 0.3) - 0.5;
          const ny = p.noise(q.seed + 99, t * 0.3) - 0.5;
          const ax = (q.tx + nx * 6 - q.x) * 0.06 * ease + nx * 0.6 * (1 - ease);
          const ay = (q.ty + ny * 6 - q.y) * 0.06 * ease + ny * 0.6 * (1 - ease);
          q.vx = (q.vx + ax) * 0.82;
          q.vy = (q.vy + ay) * 0.82;
        } else {
          q.vx += (p.noise(q.seed, t * 0.2) - 0.5) * 0.05;
          q.vy += (p.noise(q.seed + 7, t * 0.2) - 0.5) * 0.05;
          q.vx *= 0.99;
          q.vy *= 0.99;
          if (q.x < 0) q.x = w;
          if (q.x > w) q.x = 0;
          if (q.y < 0) q.y = h;
          if (q.y > h) q.y = 0;
        }
        // 鼠标扰动：排斥
        const dx = q.x - mouse.x;
        const dy = q.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          const f = (1 - Math.sqrt(d2) / 120) * 3.2;
          const d = Math.sqrt(d2) || 1;
          q.vx += (dx / d) * f;
          q.vy += (dy / d) * f;
        }
        q.x += q.vx;
        q.y += q.vy;
      }

      // 2) 鼠标附近的神经网络连线
      if (mouse.x > -999) {
        ctx.lineWidth = 0.6;
        const near = particles.filter((q) => Math.abs(q.x - mouse.x) < 160 && Math.abs(q.y - mouse.y) < 160);
        for (let i = 0; i < near.length; i += 2) {
          const a = near[i];
          for (let j = i + 2; j < near.length; j += 3) {
            const b = near[j];
            const dd = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
            if (dd < 34 * 34) {
              ctx.strokeStyle = `rgba(${pal.hero.line},${0.4 * (1 - dd / (34 * 34))})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // 3) 粒子本体（带轻微呼吸的亮度）
      p.noStroke();
      const cols = pal.hero.particles;
      const light = pal.mode === 'light';
      for (const q of particles) {
        const c = cols[q.ci];
        const a = q.tx === null ? pal.hero.free : (light ? 190 : 150) + (light ? 65 : 105) * Math.sin(t * 1.4 + q.seed);
        p.fill(c[0], c[1], c[2], a);
        p.circle(q.x, q.y, q.r * 2);
      }

      // 4) 扫描光束：从左到右周期扫过，象征"智能"在激活要素
      const sx = ((t * 0.18) % 1.4) * w - 0.2 * w;
      const g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
      g.addColorStop(0, `rgba(${pal.accentRGB},0)`);
      g.addColorStop(0.5, `rgba(${pal.accentRGB},${light ? 0.06 : 0.07})`);
      g.addColorStop(1, `rgba(${pal.accent2RGB},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(sx - 120, 0, 240, h);
    };
  });
}
