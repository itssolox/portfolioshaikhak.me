import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** True when the visitor asked the OS/browser to minimise motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True for mouse/trackpad devices; hover-driven effects are skipped on touch screens. */
export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/**
 * Intro stagger only makes sense for content on screen when the page loads.
 * Measured against the top of the document rather than the current scroll, so
 * a back-navigation that restores a scroll position doesn't stagger content.
 */
export const introDelay = (el: Element, delay: number) =>
  el.getBoundingClientRect().top + window.scrollY < window.innerHeight * 0.9 ? delay : 0;

export { gsap, ScrollTrigger, useGSAP };
