import { useRef, useSyncExternalStore } from "react";
import { gsap, hasFinePointer, introDelay, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

export type FigureSize = "sm" | "lg";

export type FigureProps = {
  size?: FigureSize;
  /** `scroll` draws the figure when it scrolls into view; `mount` draws it as soon as the page renders. */
  play?: "scroll" | "mount";
  /** Intro stagger in seconds. Like FadeIn, it only applies to a figure that is in the first viewport. */
  delay?: number;
  className?: string;
};

/** Figures render 1:1 at these pixel sizes so hairlines and labels stay crisp. */
export const FIGURE_SIZES: Record<FigureSize, { width: number; height: number }> = {
  sm: { width: 300, height: 170 },
  lg: { width: 640, height: 300 },
};

const WIDE_QUERY = "(min-width: 768px)";

const subscribeToWidth = (onChange: () => void) => {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** The figure size that fits the viewport (Tailwind's `md` breakpoint), known on the first render. */
export function useFigureSize(): FigureSize {
  const wide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
  return wide ? "lg" : "sm";
}

type FigureTimelines = {
  svg: SVGSVGElement;
  /** Draws the diagram once. */
  intro: gsap.core.Timeline;
  /** Tells the figure's story in the accent colour; runs after the intro and replays on hover. */
  highlight: gsap.core.Timeline;
};

/**
 * Drives a figure's two timelines. Hovering the enclosing `.group` (or the
 * figure itself) replays the highlight on mouse devices. With reduced motion
 * both timelines render straight to their finished state.
 */
export function useFigure(
  build: (timelines: FigureTimelines) => void,
  { play = "scroll", delay = 0 }: Pick<FigureProps, "play" | "delay">,
) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;

      const highlight = gsap.timeline({ paused: true });
      const intro = gsap.timeline({ paused: true, onComplete: () => highlight.play(0) });
      build({ svg, intro, highlight });

      if (prefersReducedMotion()) {
        // Jump to the finished drawing; the intro's completion callback is
        // suppressed so it doesn't play the highlight.
        intro.progress(1, true);
        highlight.progress(1);
        return;
      }

      const start = () => gsap.delayedCall(introDelay(svg, delay), () => intro.play());
      if (play === "mount") start();
      else ScrollTrigger.create({ trigger: svg, start: "top 88%", once: true, onEnter: start });

      if (!hasFinePointer()) return;
      const hoverTarget = svg.closest(".group") ?? svg;
      const replay = () => {
        if (intro.progress() === 1) highlight.restart();
      };
      hoverTarget.addEventListener("mouseenter", replay);
      return () => hoverTarget.removeEventListener("mouseenter", replay);
    },
    { scope: ref },
  );

  return ref;
}
