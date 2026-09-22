import { cn } from "@/lib/utils";
import { FIGURE_SIZES, useFigure, type FigureProps } from "./use-figure";

type Depth = 0 | 1 | 2 | 3;

type CodeNode = {
  id: string;
  label: string;
  kind: "function" | "route";
  /** Call-graph distance from the changed function. */
  depth: Depth;
  /** Unit coordinates, scaled to the figure size on render. */
  x: number;
  y: number;
};

// A slice of a code graph: one changed function and the callers that reach it.
const NODES: CodeNode[] = [
  { id: "target", label: "resolveCall()", kind: "function", depth: 0, x: 0.1, y: 0.5 },
  { id: "parse", label: "parseFile()", kind: "function", depth: 1, x: 0.37, y: 0.16 },
  { id: "graph", label: "buildGraph()", kind: "function", depth: 1, x: 0.37, y: 0.5 },
  { id: "route", label: "POST /repos", kind: "route", depth: 1, x: 0.37, y: 0.84 },
  { id: "ingest", label: "ingest()", kind: "function", depth: 2, x: 0.64, y: 0.16 },
  { id: "query", label: "queryGraph()", kind: "function", depth: 2, x: 0.64, y: 0.5 },
  { id: "create", label: "createRepo()", kind: "function", depth: 2, x: 0.64, y: 0.84 },
  { id: "job", label: "runJob()", kind: "function", depth: 3, x: 0.9, y: 0.33 },
  { id: "chat", label: "chat()", kind: "function", depth: 3, x: 0.9, y: 0.67 },
];

/** CALLS edges, caller → callee. */
const EDGES = [
  { from: "parse", to: "target" },
  { from: "graph", to: "target" },
  { from: "route", to: "target" },
  { from: "ingest", to: "parse" },
  { from: "query", to: "graph" },
  { from: "create", to: "route" },
  { from: "job", to: "ingest" },
  { from: "job", to: "query" },
  { from: "chat", to: "query" },
  { from: "chat", to: "create" },
];

/** How strongly each ring of the blast radius is tinted. */
const RISK_ALPHA: Record<Depth, number> = { 0: 1, 1: 1, 2: 0.5, 3: 0.22 };

const RISK_LABELS: Record<Exclude<Depth, 0>, { sm: string; lg: string }> = {
  1: { sm: "high", lg: "1 hop · high" },
  2: { sm: "medium", lg: "2 hops · medium" },
  3: { sm: "low", lg: "3+ hops · low" },
};

/**
 * Blast-radius impact analysis: a small call graph draws itself, then a change
 * to one function ripples outward along CALLS edges, tinting callers by how
 * far away they are — the risk levels RepoBrain reports.
 */
export function ImpactFigure({ size = "sm", play, delay, className }: FigureProps) {
  const { width, height } = FIGURE_SIZES[size];
  const lg = size === "lg";
  const padX = lg ? 64 : 34;
  const padTop = lg ? 48 : 34;
  const padBottom = lg ? 40 : 22;
  const r = lg ? 6 : 5;
  const fontSize = lg ? 9 : 8;

  const point = (id: string) => {
    const node = NODES.find((n) => n.id === id)!;
    return { x: padX + node.x * (width - 2 * padX), y: padTop + node.y * (height - padTop - padBottom) };
  };
  const depthOf = (id: string) => NODES.find((n) => n.id === id)!.depth;

  const ref = useFigure(
    ({ svg, intro, highlight }) => {
      intro
        .from(svg.querySelectorAll("[data-edge]"), {
          attr: { "stroke-dashoffset": 1 },
          duration: 0.7,
          stagger: 0.05,
          ease: "power2.inOut",
        })
        .from(
          svg.querySelectorAll("[data-node]"),
          { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.05, ease: "back.out(2)" },
          0.2,
        )
        .from(svg.querySelectorAll("[data-label]"), { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, 0.6);

      // The change lands on the target, then spreads one hop at a time.
      highlight.fromTo(
        svg.querySelector("[data-ring]"),
        { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" },
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(3)" },
      );
      ([1, 2, 3] as const).forEach((depth) => {
        highlight
          .fromTo(
            svg.querySelectorAll(`[data-wave][data-depth="${depth}"]`),
            { attr: { "stroke-dashoffset": 1 } },
            { attr: { "stroke-dashoffset": 0 }, duration: 0.45, ease: "power2.inOut" },
            depth === 1 ? ">-0.15" : ">-0.2",
          )
          .fromTo(
            svg.querySelectorAll(`[data-hit][data-depth="${depth}"]`),
            { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" },
            { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.05, ease: "back.out(2)" },
            ">-0.2",
          )
          .fromTo(
            svg.querySelector(`[data-risk="${depth}"]`),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3 },
            "<",
          );
      });
    },
    { play, delay },
  );

  const target = point("target");

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Call graph with one changed function; the change ripples outward to its callers, which are marked high, medium or low risk by distance"
      fill="none"
      className={cn("block max-w-full font-mono text-muted-foreground", className)}
    >
      {/* Calls */}
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

      {/* The blast radius, drawn from the change outward */}
      <g className="text-primary" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        {EDGES.map((edge) => {
          const depth = depthOf(edge.from);
          const a = point(edge.to);
          const b = point(edge.from);
          return (
            <path
              key={`${edge.from}-${edge.to}-wave`}
              data-wave
              data-depth={depth}
              d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              strokeOpacity={RISK_ALPHA[depth]}
            />
          );
        })}
      </g>

      {/* Functions and routes */}
      {NODES.map((node) => {
        const p = point(node.id);
        return (
          <g key={node.id} data-node stroke="currentColor" strokeWidth={1.25}>
            {node.kind === "route" ? (
              <rect x={p.x - r} y={p.y - r} width={r * 2} height={r * 2} rx={2} className="fill-background" />
            ) : (
              <circle cx={p.x} cy={p.y} r={r} className={node.depth === 0 ? "fill-current" : "fill-background"} />
            )}
          </g>
        );
      })}

      {/* Affected nodes, tinted by risk */}
      <g className="text-primary" stroke="currentColor" strokeWidth={1.5}>
        <circle data-ring cx={target.x} cy={target.y} r={r + 4} style={{ opacity: 0 }} />
        {NODES.filter((node) => node.depth > 0).map((node) => {
          const p = point(node.id);
          const alpha = RISK_ALPHA[node.depth];
          return node.kind === "route" ? (
            <rect
              key={node.id}
              data-hit
              data-depth={node.depth}
              x={p.x - r}
              y={p.y - r}
              width={r * 2}
              height={r * 2}
              rx={2}
              stroke="none"
              className="fill-primary"
              fillOpacity={alpha}
              style={{ opacity: 0 }}
            />
          ) : (
            <circle
              key={node.id}
              data-hit
              data-depth={node.depth}
              cx={p.x}
              cy={p.y}
              r={r}
              stroke="none"
              className="fill-primary"
              fillOpacity={alpha}
              style={{ opacity: 0 }}
            />
          );
        })}
      </g>

      {/* Risk bands */}
      <g className="fill-current" fontSize={fontSize} textAnchor="middle" style={{ letterSpacing: "0.06em" }}>
        {([1, 2, 3] as const).map((depth) => {
          const column = NODES.find((n) => n.depth === depth)!;
          return (
            <text key={depth} data-risk={depth} x={padX + column.x * (width - 2 * padX)} y={lg ? 18 : 13} style={{ opacity: 0 }}>
              {RISK_LABELS[depth][lg ? "lg" : "sm"]}
            </text>
          );
        })}
      </g>

      {/* Labels */}
      <g className="fill-current stroke-background" fontSize={fontSize} textAnchor="middle" paintOrder="stroke" strokeWidth={3}>
        <text data-label x={target.x} y={target.y + r + 13} className="fill-foreground">
          {lg ? "changed · resolveCall()" : "changed"}
        </text>
        {lg &&
          NODES.filter((node) => node.depth > 0).map((node) => {
            const p = point(node.id);
            return (
              <text key={node.id} data-label x={p.x} y={p.y + r + 13}>
                {node.label}
              </text>
            );
          })}
      </g>
    </svg>
  );
}
