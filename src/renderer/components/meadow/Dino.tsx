import { memo } from 'react';

export type DinoMood = 'idle' | 'curious' | 'sleepy' | 'nudge' | 'celebrate';

const SPIKES: [number, number, number, number][] = [
  [92, 26, -22, 12],
  [74, 38, -50, 12],
  [64, 62, -78, 11.5],
  [60, 90, -90, 11],
  [60, 118, -98, 10.5],
  [62, 144, -112, 9.5],
  [44, 158, -140, 8.5],
  [26, 167, -155, 7],
];

function spikePath(s: number) {
  return `M${-s} 0C${-s} ${-s * 1.5} ${-s * 0.35} ${-s * 2.15} ${s * 0.25} ${-s * 2.1}C${s * 0.95} ${-s * 2} ${s} ${-s * 1.1} ${s} 0Z`;
}

/**
 * The Meadow dino as layered SVG. The mood class picks which layers show
 * and how they move (see the `.dino` rules in index.css).
 */
export const Dino = memo(function Dino({
  mood,
  label,
  className,
}: {
  mood: DinoMood;
  label: string;
  className?: string;
}) {
  return (
    <svg
      className={`dino is-${mood} ${className ?? ''}`}
      viewBox="0 0 220 220"
      role="img"
      aria-label={label}
    >
      <g className="whole" filter="url(#dino-paint)">
        <ellipse cx="108" cy="208" rx="62" ry="7" fill="#000" opacity=".18" />
        <path
          d="M74 146 C48 148 24 160 8 180 C34 186 62 182 86 172Z"
          fill="var(--dino-body)"
        />
        <g fill="var(--dino-spike)">
          {SPIKES.map(([x, y, a, s]) => (
            <path
              key={`${x}-${y}`}
              d={spikePath(s)}
              transform={`translate(${x} ${y}) rotate(${a})`}
            />
          ))}
        </g>
        <g>
          <path
            d="M62 124 C60 86 84 70 112 72 C142 74 160 100 158 140 C156 182 136 202 108 202 C80 202 64 170 62 124Z"
            fill="var(--dino-body)"
          />
          <ellipse cx="86" cy="198" rx="19" ry="11" fill="var(--dino-body)" />
          <ellipse cx="132" cy="199" rx="19" ry="10" fill="var(--dino-body)" />
          <g fill="#f6f4ea">
            <ellipse cx="76" cy="205" rx="4.5" ry="3.5" />
            <ellipse cx="86" cy="206" rx="4.5" ry="3.5" />
            <ellipse cx="96" cy="205" rx="4.5" ry="3.5" />
            <ellipse cx="124" cy="206" rx="4.5" ry="3.5" />
            <ellipse cx="134" cy="207" rx="4.5" ry="3.5" />
            <ellipse cx="144" cy="206" rx="4.5" ry="3.5" />
          </g>
          <path
            d="M94 98 C114 90 142 102 144 136 C146 176 130 196 110 196 C92 196 84 172 84 140 C84 118 86 104 94 98Z"
            fill="var(--dino-belly)"
          />
          <g fill="var(--dino-spot)">
            <circle cx="72" cy="118" r="7" />
            <circle cx="76" cy="146" r="5" />
            <circle cx="70" cy="96" r="4" />
          </g>
          <path
            d="M96 128 C102 138 114 140 122 132"
            stroke="var(--dino-shade)"
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g className="head-g">
          <path
            d="M70 58 C70 30 92 16 116 18 C138 20 146 30 154 38 C176 38 198 50 198 66 C198 86 176 96 150 96 C126 98 104 98 90 92 C76 86 70 74 70 58Z"
            fill="var(--dino-body)"
          />
          <path
            d="M98 78 C120 88 162 90 192 74 C190 88 172 98 148 99 C124 100 106 94 98 78Z"
            fill="var(--dino-belly)"
          />
          <g fill="var(--dino-spot)">
            <circle cx="84" cy="50" r="6" />
            <circle cx="96" cy="32" r="4" />
            <circle cx="80" cy="70" r="4" />
          </g>
          <g
            className="eyes-happy"
            fill="none"
            stroke="var(--dino-ink)"
            strokeWidth="4.5"
            strokeLinecap="round"
          >
            <path d="M100 50 Q109 40 118 50" />
            <path d="M128 46 Q136 37 144 46" />
          </g>
          <g className="eyes-open" fill="var(--dino-ink)">
            <ellipse className="lid" cx="109" cy="47" rx="5" ry="6.5" />
            <ellipse className="lid" cx="137" cy="43" rx="4.6" ry="6" />
            <circle cx="111" cy="45" r="1.8" fill="#fff" />
            <circle cx="139" cy="41" r="1.6" fill="#fff" />
          </g>
          <g
            className="eyes-sleep"
            fill="none"
            stroke="var(--dino-ink)"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M101 49 Q109 53 117 49" />
            <path d="M129 45 Q136 49 143 45" />
          </g>
          <ellipse cx="184" cy="56" rx="3" ry="2.4" fill="var(--dino-ink)" />
          <path
            d="M116 72 Q150 90 186 70"
            stroke="var(--dino-ink)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g className="arm-up">
          <path
            d="M136 122 C154 120 168 114 178 106"
            stroke="var(--dino-body)"
            strokeWidth="17"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="182" cy="102" r="12.5" fill="var(--dino-body)" />
        </g>
        <g className="bang" fill="var(--dino-spike)">
          <rect
            x="186"
            y="18"
            width="7"
            height="22"
            rx="3.5"
            transform="rotate(18 189 29)"
          />
          <rect
            x="198"
            y="40"
            width="7"
            height="18"
            rx="3.5"
            transform="rotate(52 201 49)"
          />
        </g>
        <g className="bang-n" fill="var(--dino-spike)">
          <rect x="186" y="8" width="8" height="24" rx="4" />
          <circle cx="190" cy="40" r="4.5" />
        </g>
        <g className="dots" fill="var(--dino-spike)">
          <circle cx="178" cy="22" r="4.5" />
          <circle cx="192" cy="22" r="4.5" />
          <circle cx="206" cy="22" r="4.5" />
        </g>
        <g
          className="zz"
          fill="var(--dino-spike)"
          fontFamily="var(--font-display)"
        >
          <text x="168" y="30" fontSize="20">
            z
          </text>
          <text x="186" y="14" fontSize="14">
            z
          </text>
        </g>
      </g>
    </svg>
  );
});
