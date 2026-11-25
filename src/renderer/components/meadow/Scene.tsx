import { memo } from 'react';

const W = 440;
const H = 300;

/**
 * The sun rises behind the middle hill and sets behind the near one, on the
 * right half of the sky, so it never sits behind the clock's text.
 */
function sunAt(t: number) {
  const p0 = [W * 0.55, H * 0.6];
  const p1 = [W * 0.78, -H * 0.15];
  const p2 = [W * 0.99, H * 0.6];
  const at = (k: 0 | 1) =>
    (1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * p1[k] + t ** 2 * p2[k];
  return {
    x: at(0),
    y: at(1),
    path: `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`,
  };
}

/**
 * Hills, field and paint texture. They never move, so this layer is
 * memoized: the expensive filters are drawn once per theme and size.
 */
const Landscape = memo(function Landscape() {
  return (
    <svg
      className="absolute inset-0 size-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g filter="url(#paint-edge)">
        <path
          d={`M-20 ${H * 0.66} C${W * 0.14} ${H * 0.4} ${W * 0.3} ${H * 0.42} ${W * 0.48} ${H * 0.64} L${W * 0.48} ${H} L-20 ${H}Z`}
          fill="var(--hill-far)"
        />
        <path
          d={`M${W * 0.32} ${H * 0.72} C${W * 0.5} ${H * 0.52} ${W * 0.64} ${H * 0.54} ${W * 0.78} ${H * 0.7} L${W * 0.78} ${H} L${W * 0.32} ${H}Z`}
          fill="var(--hill-mid)"
        />
        <path
          d={`M${W * 0.58} ${H * 0.76} C${W * 0.76} ${H * 0.56} ${W * 0.9} ${H * 0.5} ${W + 20} ${H * 0.54} L${W + 20} ${H} L${W * 0.58} ${H}Z`}
          fill="var(--hill-near)"
        />
        <rect
          x={-20}
          y={H * 0.76}
          width={W + 40}
          height={H * 0.3}
          fill="var(--field)"
        />
      </g>
      <rect
        width={W}
        height={H}
        filter="url(#impasto)"
        opacity={0.32}
        style={{ mixBlendMode: 'overlay' }}
      />
    </svg>
  );
});

/**
 * The painted sky. As in the Meadow design, the sky is a clock: here the
 * sun's place on its arc is how far the current phase has gone (0 to 1).
 */
export function Scene({ progress }: { progress: number }) {
  const sun = sunAt(Math.min(1, Math.max(0, progress)));
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 size-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sky-a)" />
            <stop offset="1" stopColor="var(--sky-b)" />
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0" stopColor="var(--sun)" stopOpacity={0.55} />
            <stop offset="1" stopColor="var(--sun)" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        <path
          d={sun.path}
          fill="none"
          stroke="var(--sun)"
          strokeOpacity={0.35}
          strokeWidth={2}
          strokeDasharray="2 9"
          strokeLinecap="round"
        />
        <g
          style={{
            transform: `translate(${sun.x}px, ${sun.y}px)`,
            transition: 'transform 1s linear',
          }}
        >
          <circle r={H * 0.4} fill="url(#glow)" />
          <circle r={24} fill="var(--sun)" filter="url(#paint-edge)" />
        </g>
      </svg>
      <div className="absolute inset-0" style={{ willChange: 'transform' }}>
        <Landscape />
      </div>
    </div>
  );
}
