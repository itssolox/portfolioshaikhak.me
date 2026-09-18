import { cn } from "@/lib/utils";
import { FIGURE_SIZES, useFigure, type FigureProps } from "./use-figure";

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Visible range of z, and the stretch of it the sample walks. */
const Z = { min: -6, max: 6, start: -4.5, end: 3.5 };

/**
 * The logistic curve at the heart of the classifier. It draws itself, then a
 * sample walks along it and turns the accent colour once it crosses the 0.5
 * decision threshold.
 */
export function SigmoidFigure({ size = "sm", play, delay, className }: FigureProps) {
  const { width, height } = FIGURE_SIZES[size];
  const lg = size === "lg";
  const pad = lg ? { left: 60, right: 28, top: 30, bottom: 36 } : { left: 30, right: 14, top: 16, bottom: 26 };
  const fontSize = lg ? 10 : 9;
  const dotRadius = lg ? 5 : 4;

  const x = (z: number) => pad.left + ((z - Z.min) / (Z.max - Z.min)) * (width - pad.left - pad.right);
  const y = (p: number) => height - pad.bottom - p * (height - pad.top - pad.bottom);

  const curve = Array.from({ length: 97 }, (_, i) => {
    const z = Z.min + (i / 96) * (Z.max - Z.min);
    return `${i === 0 ? "M" : "L"}${x(z).toFixed(1)} ${y(sigmoid(z)).toFixed(1)}`;
  }).join(" ");

  const start = { x: x(Z.start), y: y(sigmoid(Z.start)) };

  const ref = useFigure(
    ({ svg, intro, highlight }) => {
      const dots = svg.querySelectorAll<SVGCircleElement>("[data-dot]");
      const accent = svg.querySelector<SVGCircleElement>("[data-dot='accent']");
      const readout = svg.querySelector<SVGTextElement>("[data-readout]");

      intro
        .from(svg.querySelectorAll("[data-axis]"), { autoAlpha: 0, duration: 0.5, stagger: 0.05 })
        .from(
          svg.querySelector("[data-curve]"),
          { attr: { "stroke-dashoffset": 1 }, duration: 1.2, ease: "power2.inOut" },
          0.1,
        )
        .from(svg.querySelectorAll("[data-threshold]"), { autoAlpha: 0, duration: 0.5 }, 0.9)
        .from(svg.querySelectorAll("[data-sample]"), { autoAlpha: 0, duration: 0.3 }, 1.2);

      const sample = { z: Z.start };
      const place = () => {
        const p = sigmoid(sample.z);
        const cx = x(sample.z).toFixed(1);
        const cy = y(p).toFixed(1);
        dots.forEach((dot) => {
          dot.setAttribute("cx", cx);
          dot.setAttribute("cy", cy);
        });
        if (accent) accent.style.opacity = p >= 0.5 ? "1" : "0";
        if (readout) {
          readout.setAttribute("x", cx);
          readout.setAttribute("y", (Number(cy) - 12).toFixed(1));
          readout.textContent = p.toFixed(2);
        }
      };
      place();
      highlight.fromTo(sample, { z: Z.start }, { z: Z.end, duration: 1.6, ease: "power2.inOut", onUpdate: place });
    },
    { play, delay },
  );

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Logistic sigmoid curve with the 0.5 decision threshold; a sample moves along it from not placed to placed"
      fill="none"
      className={cn("block max-w-full font-mono text-muted-foreground", className)}
    >
      {/* Axes */}
      <g data-axis stroke="currentColor" strokeOpacity={0.35}>
        <path d={`M${x(Z.min)} ${y(0)} H${x(Z.max)}`} />
        <path d={`M${x(Z.min)} ${y(0)} V${y(1)}`} />
      </g>
      <g data-axis className="fill-current" fontSize={fontSize} textAnchor="end">
        <text x={pad.left - 8} y={y(1) + 3}>1</text>
        <text x={pad.left - 8} y={y(0.5) + 3}>0.5</text>
        <text x={pad.left - 8} y={y(0) + 3}>0</text>
        <text x={x(Z.max)} y={y(0) + (lg ? 18 : 15)}>z = w·x + b</text>
      </g>
      {lg && (
        <text data-axis className="fill-current" fontSize={fontSize} x={pad.left} y={pad.top - 12}>
          σ(z) = 1 / (1 + e^−z)
        </text>
      )}

      {/* Decision threshold */}
      <g data-threshold stroke="currentColor" strokeOpacity={0.6} strokeDasharray="2 4">
        <path d={`M${x(Z.min)} ${y(0.5)} H${x(Z.max)}`} />
        {lg && <path d={`M${x(0)} ${y(0)} V${y(0.5)}`} />}
      </g>
      <g data-threshold className="fill-current" fontSize={fontSize}>
        <text x={x(Z.min) + 6} y={y(0) - 12}>not placed</text>
        <text x={x(Z.max)} y={y(1) + 14} textAnchor="end">
          placed
        </text>
      </g>

      {/* σ(z) */}
      <path
        data-curve
        d={curve}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground"
      />

      {/* A sample walking the curve */}
      <circle data-dot="base" data-sample cx={start.x} cy={start.y} r={dotRadius} className="fill-current" />
      <circle data-dot="accent" cx={start.x} cy={start.y} r={dotRadius} className="fill-primary" style={{ opacity: 0 }} />
      {lg && (
        <text data-readout data-sample className="fill-foreground" fontSize={fontSize} textAnchor="middle" x={start.x} y={start.y - 12}>
          {sigmoid(Z.start).toFixed(2)}
        </text>
      )}
    </svg>
  );
}
