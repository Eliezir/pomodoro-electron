/**
 * SVG filters used for the painted look. Rendered once at the root;
 * elements use them with `filter: url(#rough)` and friends.
 */
export function PaintFilters() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="rough" x="-4%" y="-8%" width="108%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045 0.11"
            numOctaves={2}
            seed={7}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="paint-edge" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03 0.09"
            numOctaves={3}
            seed={3}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={16}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="impasto" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.07"
            numOctaves={4}
            seed={8}
            result="n"
          />
          <feDiffuseLighting
            in="n"
            surfaceScale={3}
            lightingColor="#ffffff"
            result="l"
          >
            <feDistantLight azimuth={225} elevation={40} />
          </feDiffuseLighting>
        </filter>
        <filter id="dino-paint" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.14"
            numOctaves={3}
            seed={11}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.11 0.035"
            numOctaves={3}
            seed={4}
            result="n2"
          />
          <feDiffuseLighting
            in="n2"
            surfaceScale={2.4}
            lightingColor="#ffffff"
            result="l"
          >
            <feDistantLight azimuth={235} elevation={52} />
          </feDiffuseLighting>
          <feComposite in="l" in2="d" operator="in" result="lt" />
          <feBlend in="lt" in2="d" mode="soft-light" />
        </filter>
      </defs>
    </svg>
  );
}
