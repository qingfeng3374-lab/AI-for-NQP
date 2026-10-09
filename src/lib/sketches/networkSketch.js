/**
 * 终章生成艺术（p5.js）：不断生长的智能网络
 * 隐喻：每个节点是一家企业 / 一个行业 / 一位劳动者，AI 让它们彼此连接，
 * 脉冲沿连线传递 —— 新质生产力是"连接"与"协同"带来的系统性跃升。
 * 点击画布可以添加新节点。
 */
import { pal } from '../stores/theme.svelte.js';

export function createNetworkSketch(p5, el) {
  return new p5((p) => {
    const nodes = [];
    const edges = [];
    const pulses = [];
    const MAX = 170;
    let w;
    let h;

    function addNode(x, y) {
      const n = { x, y, r: p.random(1.6, 3.2), born: p.millis(), hue: p.random() < 0.7 ? 0 : 1 };
      // 与最近的 2~3 个节点相连
      const near = nodes
        .map((m) => ({ m, d: (m.x - x) ** 2 + (m.y - y) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, p.floor(p.random(2, 4)));
      nodes.push(n);
      for (const { m, d } of near) if (d < 260 ** 2) edges.push({ a: m, b: n, born: p.millis() });
      if (nodes.length > MAX) {
        const old = nodes.shift();
        for (let i = edges.length - 1; i >= 0; i--) if (edges[i].a === old || edges[i].b === old) edges.splice(i, 1);
      }
    }

    function seedPoint() {
      // 以中心为核心向外扩散的高斯分布
      const a = p.random(p.TWO_PI);
      const rr = Math.abs(p.randomGaussian(0, 0.3)) * Math.min(w, h) * 0.9;
      return [w / 2 + Math.cos(a) * rr * 1.5, h / 2 + Math.sin(a) * rr * 0.8];
    }

    p.setup = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      p.createCanvas(w, h).parent(el);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      addNode(w / 2, h / 2);
      el.addEventListener('click', (e) => {
        const r = el.getBoundingClientRect();
        for (let i = 0; i < 6; i++) addNode(e.clientX - r.left + p.random(-40, 40), e.clientY - r.top + p.random(-40, 40));
      });
    };

    p.windowResized = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.clear();
      const now = p.millis();
      if (p.frameCount % 4 === 0) addNode(...seedPoint());
      if (p.frameCount % 3 === 0 && edges.length) {
        const e = edges[p.floor(p.random(edges.length))];
        pulses.push({ e, t: 0, dir: p.random() < 0.5 });
      }

      const ctx = p.drawingContext;
      // 连线
      for (const e of edges) {
        const age = Math.min(1, (now - e.born) / 800);
        ctx.strokeStyle = `rgba(${pal.accentRGB},${(pal.mode === 'light' ? 0.22 : 0.16) * age})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.a.x + (e.b.x - e.a.x) * age, e.a.y + (e.b.y - e.a.y) * age);
        ctx.stroke();
      }
      // 脉冲
      for (let i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        q.t += 0.025;
        if (q.t >= 1 || !edges.includes(q.e)) {
          pulses.splice(i, 1);
          continue;
        }
        const [a, b] = q.dir ? [q.e.a, q.e.b] : [q.e.b, q.e.a];
        const x = a.x + (b.x - a.x) * q.t;
        const y = a.y + (b.y - a.y) * q.t;
        p.noStroke();
        p.fill(`rgba(${pal.accentRGB},0.8)`);
        p.circle(x, y, 3.2);
        p.fill(`rgba(${pal.accentRGB},0.16)`);
        p.circle(x, y, 10);
      }
      // 节点
      for (const n of nodes) {
        const age = Math.min(1, (now - n.born) / 600);
        p.noStroke();
        p.fill(`rgba(${n.hue === 0 ? pal.accentRGB : pal.accent2RGB},${0.82 * age})`);
        p.circle(n.x, n.y, n.r * 2 * age);
      }
    };
  });
}
