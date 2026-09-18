import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Hairline at the very top of the viewport that fills as the page is scrolled. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-foreground/70"
      data-testid="scroll-progress"
    />
  );
}
