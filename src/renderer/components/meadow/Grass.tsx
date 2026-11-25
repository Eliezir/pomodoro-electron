import { useEffect, useRef } from 'react';

/** Small seeded random generator, so the grass looks the same on every draw. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paint(canvas: HTMLCanvasElement, dark: boolean) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const r = seeded(7);
  const greens = dark
    ? ['#1f3d28', '#27492f', '#2f5735', '#376440', '#1a3322', '#44724a']
    : ['#6f9a45', '#80aa50', '#8fb65a', '#5e8a3c', '#a3c46a', '#4f7d36'];
  const blades = Math.floor((w * h) / 9);
  for (let i = 0; i < blades; i++) {
    const y = h * (0.05 + Math.pow(r(), 0.65));
    const depth = y / h;
    const x = r() * w;
    const len = 4 + depth * 16 * (0.6 + r() * 0.8);
    ctx.strokeStyle = greens[Math.floor(r() * greens.length)];
    ctx.lineWidth = 1 + depth * 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (r() - 0.5) * 6,
      y - len * 0.6,
      x + (r() - 0.4) * 8,
      y - len,
    );
    ctx.stroke();
  }

  const flowers = dark
    ? ['#f6b632', '#e8e2cf', '#9a8bd6', '#d98aa0']
    : ['#f6b632', '#ffffff', '#b9a6ee', '#f19bb0'];
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < w / 14; i++) {
    const y = h * (0.3 + r() * 0.7);
    ctx.fillStyle = flowers[Math.floor(r() * flowers.length)];
    ctx.beginPath();
    ctx.ellipse(
      r() * w,
      y,
      1.6 + (y / h) * 2,
      3 + (y / h) * 4,
      (r() - 0.5) * 0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Grass and wildflowers drawn on a canvas, redrawn only on resize or theme change. */
export function Grass({
  dark,
  className,
}: {
  dark: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    paint(canvas, dark);
    const observer = new ResizeObserver(() => paint(canvas, dark));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [dark]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
