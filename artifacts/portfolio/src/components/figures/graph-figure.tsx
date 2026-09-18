import { cn } from "@/lib/utils";
import { FIGURE_SIZES, useFigure, type FigureProps } from "./use-figure";

type NodeKind = "director" | "movie" | "actor" | "genre";

type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  /** Unit coordinates, scaled to the figure size on render. */
  x: number;
  y: number;
  labelSide: "above" | "below";
};

// A slice of the kind of graph the pipeline extracts (Movie, Director, Actor, Genre).
const NODES: GraphNode[] = [
  { id: "nolan", label: "Nolan", kind: "director", x: 0.1, y: 0.5, labelSide: "below" },
  { id: "inception", label: "Inception", kind: "movie", x: 0.4, y: 0.18, labelSide: "above" },
  { id: "interstellar", label: "Interstellar", kind: "movie", x: 0.4, y: 0.82, labelSide: "below" },
  { id: "dicaprio", label: "DiCaprio", kind: "actor", x: 0.68, y: 0.18, labelSide: "above" },
  { id: "hathaway", label: "Hathaway", kind: "actor", x: 0.68, y: 0.82, labelSide: "below" },
  { id: "scifi", label: "Sci-Fi", kind: "genre", x: 0.92, y: 0.5, labelSide: "below" },
];

const EDGES = [
  { from: "nolan", to: "inception", type: "DIRECTED" },
  { from: "nolan", to: "interstellar", type: "DIRECTED" },
  { from: "dicaprio", to: "inception", type: "ACTED_IN" },
  { from: "hathaway", to: "interstellar", type: "ACTED_IN" },
  { from: "inception", to: "scifi", type: "IN_GENRE" },
  { from: "interstellar", to: "scifi", type: "IN_GENRE" },
];

/** The two-hop answer to "Nolan films starring DiCaprio", walked in order. */
const PATH = ["nolan", "inception", "dicaprio"];

/**
 * A small knowledge graph that draws itself, then traces a multi-hop path in
 * the accent colour — the kind of question vector search alone can't answer.
 */
export function GraphFigure({ size = "sm", play, delay, className }: FigureProps) {
  const { width, height } = FIGURE_SIZES[size];
  const lg = size === "lg";
  const padX = lg ? 60 : 32;
  const padY = lg ? 40 : 24;
  const r = lg ? 6 : 5;

  const point = (id: string) => {
    const node = NODES.find((n) => n.id === id)!;
    return { x: padX + node.x * (width - 2 * padX), y: padY + node.y * (height - 2 * padY) };
  };

  const ref = useFigure(
    ({ svg, intro, highlight }) => {
      intro
        .from(svg.querySelectorAll("[data-edge]"), {
          attr: { "stroke-dashoffset": 1 },
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.inOut",
        })
        .from(
          svg.querySelectorAll("[data-node]"),
          { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.06, ease: "back.out(2)" },
          0.25,
        )
        .from(svg.querySelectorAll("[data-label]"), { autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.6);

      PATH.forEach((id, index) => {
        highlight.fromTo(
          svg.querySelector(`[data-ring="${id}"]`),
          { autoAlpha: 0, scale: 0.5, transformOrigin: "50% 50%" },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(3)" },
          index === 0 ? 0 : ">-0.1",
        );
        const hop = svg.querySelector(`[data-hop="${index}"]`);
        if (hop) {
          highlight.fromTo(
            hop,
            { attr: { "stroke-dashoffset": 1 } },
            { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.inOut" },
            ">-0.15",
          );
        }
      });
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
      aria-label="Knowledge graph of movies, a director, actors and a genre, highlighting the two-hop path from Nolan through Inception to DiCaprio"
      fill="none"
      className={cn("block max-w-full font-mono text-muted-foreground", className)}
    >
      {/* Relationships */}
      <g stroke="currentColor" strokeOpacity={0.55}>
        {EDGES.map((edge) => {
          const a = point(edge.from);
          const b = point(edge.to);
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              data-edge
              d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
            />
          );
        })}
      </g>

      {lg && (
        <g data-label className="fill-current stroke-background" fontSize={8} textAnchor="middle" paintOrder="stroke" strokeWidth={4} style={{ letterSpacing: "0.08em" }}>
          {EDGES.map((edge) => {
            const a = point(edge.from);
            const b = point(edge.to);
            return (
              <text key={`${edge.from}-${edge.to}-label`} x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 3}>
                {edge.type}
              </text>
            );
          })}
        </g>
      )}

      {/* Accent path, drawn hop by hop */}
      <g className="text-primary" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        {PATH.slice(1).map((id, index) => {
          const a = point(PATH[index]);
          const b = point(id);
          return (
            <path
              key={id}
              data-hop={index}
              d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          );
        })}
        {PATH.map((id) => {
          const p = point(id);
          return <circle key={id} data-ring={id} cx={p.x} cy={p.y} r={r + 4} style={{ opacity: 0 }} />;
        })}
      </g>

      {/* Entities */}
      {NODES.map((node) => {
        const p = point(node.id);
        return (
          <g key={node.id} data-node stroke="currentColor" strokeWidth={1.25}>
            {node.kind === "movie" ? (
              <rect x={p.x - r} y={p.y - r} width={r * 2} height={r * 2} rx={2} className="fill-background" />
            ) : node.kind === "genre" ? (
              <circle cx={p.x} cy={p.y} r={r - 1} strokeDasharray="2 2" className="fill-background" />
            ) : (
              <circle cx={p.x} cy={p.y} r={r} className={node.kind === "director" ? "fill-current" : "fill-background"} />
            )}
          </g>
        );
      })}

      {/* Labels */}
      <g className="fill-current stroke-background" fontSize={lg ? 10 : 9} textAnchor="middle" paintOrder="stroke" strokeWidth={3}>
        {NODES.map((node) => {
          const p = point(node.id);
          const y = node.labelSide === "above" ? p.y - r - 7 : p.y + r + 13;
          return (
            <text key={node.id} data-label x={p.x} y={y}>
              {node.label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
