import { FadeIn, SplitHeading } from "@/components/animations";
import { ImpactFigure } from "@/components/figures/impact-figure";
import { useFigureSize } from "@/components/figures/use-figure";
import { ArrowLeft, Github } from "lucide-react";
import { Link } from "wouter";

export default function RepoBrain() {
  const figureSize = useFigureSize();

  return (
    <main className="min-h-[100dvh] pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
      <FadeIn>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </FadeIn>

      <header className="mb-16">
        <SplitHeading text="RepoBrain" delay={0.1} className="text-3xl md:text-5xl font-medium tracking-tight mb-6" />
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground mb-8">
            <span>TypeScript</span>
            <span>Express 5</span>
            <span>React 19</span>
            <span>Neo4j</span>
            <span>MongoDB Atlas</span>
            <span>tree-sitter</span>
            <span>LangGraph</span>
            <span>Gemini</span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Codebase intelligence: connect a GitHub repository and the server clones and parses it into a Neo4j code graph plus a vector search index, then answers questions about it with file:line citations.
          </p>
        </FadeIn>
      </header>

      <figure className="mb-16">
        <ImpactFigure key={figureSize} size={figureSize} play="mount" delay={0.5} />
        <figcaption className="mt-4 font-mono text-xs text-muted-foreground">
          Blast radius: change one function and the risk spreads along CALLS edges. Direct callers and routes are high, two hops medium, deeper low.
        </figcaption>
      </figure>

      <FadeIn delay={0.5}>
        <div className="flex gap-6 mb-16 border-y border-border/50 py-6">
          <a href="https://github.com/akamalferojshaikh/RepoBrain" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium hover:text-primary transition-colors">
            <Github className="w-4 h-4" /> Source Code
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.6}>
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight">
          <h3>The Problem</h3>
          <p>
            Chatting with a codebase through plain vector search answers "what does this file do" reasonably well and falls apart on the questions engineers actually ask: what breaks if I change this function, which route ends up in this stack trace, who owns this module, which code is never called. Those are graph questions. RepoBrain builds the graph first and puts retrieval on top of it.
          </p>

          <h3>Ingestion Pipeline</h3>
          <p>
            Connecting a repository queues an index job that runs through staged steps, each streamed to the UI over server-sent events:
          </p>
          <ol className="space-y-6">
            <li>
              <strong>Clone and detect:</strong> the repository is cloned (private repos through the user's GitHub token) and walked with the same ignore rules a developer would expect: dependency and build trees, lockfiles, minified and oversized files are skipped.
            </li>
            <li>
              <strong>Parse:</strong> tree-sitter grammars for twenty languages (JavaScript/TypeScript, Python, Go, Java, C/C++, C#, Rust, Ruby, PHP, Kotlin, Swift, Scala, Dart and more) are reduced to one common intermediate representation: files, functions, classes, imports, HTTP routes and calls with name resolution. A file the grammar cannot handle produces a warning, not a failed index.
            </li>
            <li>
              <strong>Graph:</strong> the IR is written to Neo4j as File, Function, Class, Route, Commit and Author nodes joined by IMPORTS, CALLS, CALLS_API, HANDLED_BY, EXTENDS, MODIFIED_IN and AUTHORED_BY relationships. Git history for the last 500 commits links functions to the commits and authors that touched them.
            </li>
            <li>
              <strong>Chunks and docs:</strong> every function and class becomes a chunk with a Gemini summary and, when embeddings are enabled, a vector stored in MongoDB Atlas. A final pass generates onboarding docs (architecture, modules, entry points, data flow) from graph statistics and the most connected files.
            </li>
          </ol>

          <h3>Retrieval and the Agent</h3>
          <p>
            Questions go through hybrid retrieval: a BM25 index over chunk tokens and dense cosine similarity are fused with reciprocal-rank fusion, the top 30 candidates are reranked by a fast model, and the best six reach the answer model. A LangGraph state graph routes each message by intent, calls repository tools in parallel only when the question is actually about the code, streams the reasoning model's answer and grounds repository answers in file:line citations. Slash commands such as <code>/impact</code>, <code>/trace</code>, <code>/owners</code> and <code>/docs</code> bypass the router and hit the graph directly.
          </p>

          <h3>Graph Analyses</h3>
          <p>
            <strong>Impact analysis</strong> walks CALLS, HANDLED_BY, CALLS_API and IMPORTS edges backwards from a changed node and ranks what it finds: direct callers, routes and untested functions are high risk, two hops is medium, anything deeper is low. <strong>Stack-trace tracing</strong> maps frames back to graph nodes. <strong>Dead code</strong> and <strong>ownership</strong> are graph queries over the same data. The PR reviewer reuses impact analysis on the changed functions of a pull request, drafts a review with the smart model, then pauses on a LangGraph interrupt until a human approves before anything is posted to GitHub.
          </p>

          <h3>Engineering Decisions</h3>
          <ul className="space-y-4">
            <li>
              <strong>No Redis:</strong> the job queue is a Mongo collection claimed with an atomic <code>findOneAndUpdate</code>, with heartbeats and stale-lock recovery on boot. One index job and two light jobs run at a time.
            </li>
            <li>
              <strong>Contract first:</strong> the API is described in an OpenAPI 3.0 spec; Zod schemas for the server and TanStack Query hooks for the React client are generated from it.
            </li>
            <li>
              <strong>Auth without a vendor:</strong> email registration with a hashed six-digit OTP and per-IP rate limits, plus Google and GitHub OAuth, all issuing an httpOnly JWT cookie. GitHub tokens are stored encrypted and used only for repository access and posting approved PR comments.
            </li>
            <li>
              <strong>Per-user quotas and memory:</strong> a daily LLM call quota per user, answer caching keyed on repository SHA and conversation history, and a small deterministic memory of user facts that needs no extra model call.
            </li>
          </ul>

          <h3>Status</h3>
          <p>
            RepoBrain runs locally against MongoDB Atlas and Neo4j AuraDB free tiers with a Gemini key; the repository contains the full backend, frontend and shared packages. A hosted demo is the next step.
          </p>
        </article>
      </FadeIn>
    </main>
  );
}
