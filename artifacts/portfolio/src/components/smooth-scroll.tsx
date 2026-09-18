import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "wouter";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

/**
 * Smooth scrolling for the whole site, plus scroll handling on route changes.
 *
 * Lenis eases the scroll position and GSAP's ticker drives Lenis, so
 * ScrollTrigger animations stay in sync with the eased scroll. Visitors who
 * prefer reduced motion keep native scrolling.
 *
 * Route changes: a link click starts the new page at the top; back/forward
 * returns to where the visitor left that page.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [location] = useLocation();
  const previousLocation = useRef(location);
  const latestScrollY = useRef(0);
  const savedPositions = useRef(new Map<string, number>());
  const navigatedViaHistory = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
    const update = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll positions are managed here instead of by the browser, which would
  // restore them asynchronously and fight the reset below.
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const trackScroll = () => {
      latestScrollY.current = window.scrollY;
    };
    const markHistoryNavigation = () => {
      navigatedViaHistory.current = true;
    };
    window.addEventListener("scroll", trackScroll, { passive: true });
    window.addEventListener("popstate", markHistoryNavigation);

    return () => {
      window.removeEventListener("scroll", trackScroll);
      window.removeEventListener("popstate", markHistoryNavigation);
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  // Web fonts change line wrapping, which moves every scroll-triggered element.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // New page: position it, then re-measure trigger positions for the new layout.
  useLayoutEffect(() => {
    if (previousLocation.current === location) return;

    savedPositions.current.set(previousLocation.current, latestScrollY.current);
    previousLocation.current = location;

    const target = navigatedViaHistory.current ? (savedPositions.current.get(location) ?? 0) : 0;
    navigatedViaHistory.current = false;

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo(0, target);
    }
    ScrollTrigger.refresh();
  }, [location]);

  return <>{children}</>;
}
