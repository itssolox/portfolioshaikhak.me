import { FadeIn } from "@/components/animations";
import { StatsSection } from "@/components/stats";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Copy, Github, Linkedin, Mail } from "lucide-react";

export default function Home() {
  const email = "akamalferojshaikh1@gmail.com";
  const resumeUrl = `${import.meta.env.BASE_URL}Akamal_Shaikh_Resume.pdf`;
  const avatarUrl = `${import.meta.env.BASE_URL}akamal.png`;
  const contactMenuRef = useRef<HTMLDivElement>(null);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    if (!contactMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!contactMenuRef.current?.contains(event.target as Node)) {
        setContactMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [contactMenuOpen]);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <main className="min-h-[100dvh] pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto selection:bg-primary/20 selection:text-primary">
      
      {/* Hero Section */}
      <section className="mb-20 space-y-8 md:mb-24 md:space-y-12">
        <FadeIn>
          <div className="w-16 h-16 rounded-full overflow-hidden mb-8 grayscale hover:grayscale-0 transition-all duration-500 border border-border/50">
            <img src={avatarUrl} alt="Akamal Shaikh" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight leading-tight">
            I build full-stack GenAI applications — <br className="hidden md:block" />
            <span className="text-muted-foreground">from knowledge graphs to the interface on top.</span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm font-mono text-muted-foreground">
            <p>Akamal Shaikh</p>
            <p className="hidden sm:block">—</p>
            <p>Pune, India</p>
            <p className="hidden sm:block">—</p>
            <p>B.E. Computer Engineering '28</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
            <a
              href={`mailto:${email}`}
              className="inline-flex sm:hidden items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-80"
              data-testid="link-hero-contact-mobile"
            >
              Connect with me <ArrowUpRight className="w-4 h-4" />
            </a>
            <div ref={contactMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setContactMenuOpen((open) => !open)}
                aria-expanded={contactMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-80"
                data-testid="button-hero-contact-desktop"
              >
                Connect with me <ArrowUpRight className="w-4 h-4" />
              </button>
              {contactMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-xl border border-border bg-background p-1.5 text-foreground shadow-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={copyEmail}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    {emailCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {emailCopied ? "Email copied" : "Copy email"}
                  </button>
                  <a
                    role="menuitem"
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" /> Open Gmail
                  </a>
                  <a
                    role="menuitem"
                    href="https://www.linkedin.com/in/akamal-shaikh-22bb08382"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              )}
            </div>
            <a href="https://github.com/akamalferojshaikh" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-hero-github">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/akamal-shaikh-22bb08382" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-hero-linkedin">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-hero-resume">
              Resume <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Selected Work */}
      <section className="mb-32">
        <FadeIn delay={0.2}>
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-12">Selected Work</h2>
        </FadeIn>

        <div className="space-y-16">
          <FadeIn delay={0.3}>
            <Link href="/work/graphrag" className="group block group">
              <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <h3 className="text-2xl font-medium mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                    GraphRAG Movie Intelligence <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">
                    A GraphRAG pipeline that routes each question to a Neo4j knowledge graph or Pinecone vector search, answering multi-hop relationship questions that plain RAG gets wrong. Web demo in progress.
                  </p>
                </div>
                <div className="font-mono text-xs text-muted-foreground flex flex-wrap gap-2 md:justify-end">
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">Node.js</span>
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">Neo4j</span>
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">Pinecone</span>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn delay={0.4}>
            <Link href="/work/placement-predictor" className="group block">
              <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                <div>
                  <h3 className="text-2xl font-medium mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                    Placement Predictor <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">
                    A logistic-regression classifier written from scratch in C++ with no ML framework, trained on 2,000+ student records. The LinkedIn write-up reached 50,000+ people.
                  </p>
                </div>
                <div className="font-mono text-xs text-muted-foreground flex flex-wrap gap-2 md:justify-end">
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">C++</span>
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">From scratch</span>
                  <span className="px-2 py-1 rounded-sm bg-muted/50 border border-border/50">Gradient descent</span>
                </div>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Skills & Experience */}
      <section className="mb-32">
        <FadeIn delay={0.5}>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-8">Capabilities</h2>
              <ul className="space-y-4 text-sm leading-relaxed">
                <li><strong className="font-medium text-foreground">Languages:</strong> Python, C++, JavaScript, SQL</li>
                <li><strong className="font-medium text-foreground">Frontend/Backend:</strong> React, Tailwind, Node.js, Express, REST</li>
                <li><strong className="font-medium text-foreground">Databases:</strong> MongoDB, MySQL, Neo4j, Pinecone</li>
                <li><strong className="font-medium text-foreground">AI/ML:</strong> LangChain, LangGraph, Ollama, Agentic RAG, GraphRAG, Gemini API</li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-8">Education</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium">B.E. Computer Engineering</h3>
                  <p className="text-sm text-muted-foreground mt-1">ISBM College of Engineering, Pune (SPPU)<br/>2025–2028 · CGPA 8.00</p>
                </div>
                <div>
                  <h3 className="font-medium">Diploma in Computer Engineering</h3>
                  <p className="text-sm text-muted-foreground mt-1">Jamia Polytechnic Akkalkuwa<br/>2022–2025 · 86.17%</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <FadeIn delay={0.6}>
        <StatsSection />
      </FadeIn>

      <FadeIn delay={0.7}>
        <section id="contact" className="mt-32 scroll-mt-16 pt-16 border-t border-border/50 grid md:grid-cols-[1fr_1fr] gap-12">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">About</h2>
            <p className="text-base leading-relaxed max-w-md">
              I'm a computer engineering student in Pune who likes the whole stack of a GenAI product: the retrieval layer, the graph or vector store underneath it, and the React interface people actually use. When a library hides something I don't understand, I rebuild it from scratch until I do. Currently looking for internships and full-time roles in web development and GenAI.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">Contact</h2>
            <a href={`mailto:${email}`} className="block text-lg md:text-xl font-medium tracking-tight hover:text-primary transition-colors break-all" data-testid="link-email">
              {email}
            </a>
            <div className="mt-6 flex flex-wrap gap-6 font-mono text-sm text-muted-foreground">
              <a href="https://www.linkedin.com/in/akamal-shaikh-22bb08382" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a href="https://github.com/akamalferojshaikh" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                Resume <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
        <footer className="mt-24 flex flex-col sm:flex-row justify-between gap-2 text-xs font-mono text-muted-foreground">
          <span>Akamal Shaikh · Pune, India</span>
          <span>Stats pulled automatically from LeetCode and GitHub.</span>
        </footer>
      </FadeIn>
    </main>
  );
}
