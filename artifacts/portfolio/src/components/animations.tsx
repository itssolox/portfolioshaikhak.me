import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, hasFinePointer, introDelay, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const REVEAL_START = "top 90%";

/**
 * Fades and lifts its content into place the first time it scrolls into view.
 * `delay` only applies to content that is already on screen when the page
 * loads (to stagger the intro); content revealed by scrolling appears at once.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          delay: introDelay(el, delay),
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Renders text as individually masked words so a parent timeline can slide
 * them up into view. Target the words with `[data-split-word]`. Screen
 * readers get the unsplit sentence.
 */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="inline-block overflow-hidden align-bottom pb-[0.15em] -mb-[0.15em]">
              <span className="inline-block will-change-transform" data-split-word>
                {word}
              </span>
            </span>{" "}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A heading whose words slide up into view when the page mounts — the same
 * entrance as the home hero, for page titles that sit above the fold.
 */
export function SplitHeading({
  text,
  as: Tag = "h1",
  delay = 0,
  className,
}: {
  text: string;
  as?: "h1" | "h2";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-split-word]", {
        yPercent: 110,
        duration: 0.9,
        delay,
        stagger: 0.035,
        ease: "power3.out",
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      <SplitWords text={text} />
    </Tag>
  );
}

/** Thin horizontal rule that draws itself from left to right when scrolled into view. */
export function Rule({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.inOut",
        scrollTrigger: { trigger: ref.current, start: "top 95%", once: true },
      });
    },
    { scope: ref },
  );

  return <div ref={ref} role="separator" className={cn("h-px w-full origin-left bg-border/50", className)} />;
}

/** Counts from 0 up to `value` the first time it scrolls into view. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const counter = { n: 0 };
      el.textContent = "0";
      gsap.to(counter, {
        n: value,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(counter.n).toLocaleString();
        },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    },
    { scope: ref, dependencies: [value], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}

/** Lets its child drift toward the cursor while hovered (mouse/trackpad only). */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !hasFinePointer() || prefersReducedMotion()) return;

      const moveX = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const moveY = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

      const follow = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
        moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
      };
      const release = () => {
        moveX(0);
        moveY(0);
      };

      el.addEventListener("pointermove", follow);
      el.addEventListener("pointerleave", release);
      return () => {
        el.removeEventListener("pointermove", follow);
        el.removeEventListener("pointerleave", release);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-block align-top", className)}>
      {children}
    </div>
  );
}
