import { FadeIn, SplitHeading } from "@/components/animations";
import { GraphFigure } from "@/components/figures/graph-figure";
import { useFigureSize } from "@/components/figures/use-figure";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Link } from "wouter";

export default function GraphRAG() {
  const figureSize = useFigureSize();

  return (
    <main className="min-h-[100dvh] pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
      <FadeIn>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </FadeIn>

      <header className="mb-16">
        <SplitHeading
          text="GraphRAG Movie Intelligence System"
          delay={0.1}
          className="text-3xl md:text-5xl font-medium tracking-tight mb-6"
        />
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground mb-8">
            <span>Node.js</span>
            <span>Neo4j</span>
            <span>Pinecone</span>
            <span>Gemini API</span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Combining knowledge graphs with vector search to answer complex relationship questions where traditional RAG falls short.
          </p>
        </FadeIn>
      </header>

      <figure className="mb-16">
        <GraphFigure key={figureSize} size={figureSize} play="mount" delay={0.5} />
        <figcaption className="mt-4 font-mono text-xs text-muted-foreground">
          Two hops that similarity search can't take on its own: Nolan → Inception ← DiCaprio.
        </figcaption>
      </figure>

      <FadeIn delay={0.5}>
        <div className="flex gap-6 mb-16 border-y border-border/50 py-6">
          <a href="https://github.com/akamalferojshaikh/GraphRAG-Pipeline-Movie-Intellegence-system-" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium hover:text-primary transition-colors">
            <Github className="w-4 h-4" /> Source Code
          </a>
          <span className="text-muted-foreground/30">|</span>
          <div className="inline-flex items-center gap-2 text-muted-foreground cursor-not-allowed">
            <ExternalLink className="w-4 h-4" /> Live Demo <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-sm ml-1">Coming Soon</span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.6}>
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight">
          <h3>The Problem</h3>
          <p>
            Traditional Retrieval-Augmented Generation (RAG) splits documents into chunks and uses vector similarity to find relevant context. While excellent for semantic queries ("movies about dreams"), it fails completely at multi-hop relationship questions ("movies directed by Nolan starring DiCaprio"). The vector index doesn't understand the explicit graph of relationships, forcing the LLM to guess based on co-occurrence in chunks.
          </p>

          <h3>The Architecture</h3>
          <p>
            This system solves the multi-hop problem by building a dual-index architecture over a dataset of 106 movies.
          </p>

          {/* Clean custom SVG Diagram */}
          <div className="my-12 p-8 bg-muted/30 border border-border/50 rounded-lg flex flex-col items-center">
            <svg viewBox="0 0 600 400" className="w-full max-w-2xl text-foreground font-sans text-sm">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.5"/>
                </marker>
              </defs>
              
              {/* User Query */}
              <rect x="200" y="20" width="200" height="40" rx="4" fill="var(--color-background)" stroke="currentColor" strokeWidth="1" />
              <text x="300" y="45" textAnchor="middle" fill="currentColor" className="font-medium">User Query</text>

              <path d="M 300 60 L 300 90" stroke="currentColor" strokeWidth="1" opacity="0.5" markerEnd="url(#arrow)" />

              {/* Classifier */}
              <rect x="220" y="90" width="160" height="40" rx="4" fill="var(--color-muted)" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <text x="300" y="115" textAnchor="middle" fill="currentColor">Intent Classifier</text>

              <path d="M 220 110 L 150 110 L 150 150" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" markerEnd="url(#arrow)" />
              <path d="M 380 110 L 450 110 L 450 150" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" markerEnd="url(#arrow)" />
              
              <text x="130" y="105" textAnchor="end" fill="currentColor" opacity="0.7" className="text-xs font-mono">Semantic</text>
              <text x="470" y="105" textAnchor="start" fill="currentColor" opacity="0.7" className="text-xs font-mono">Relational</text>

              {/* Vector Branch */}
              <rect x="70" y="150" width="160" height="40" rx="4" fill="var(--color-background)" stroke="currentColor" strokeWidth="1" />
              <text x="150" y="175" textAnchor="middle" fill="currentColor">Pinecone Vector Search</text>
              
              <path d="M 150 190 L 150 250" stroke="currentColor" strokeWidth="1" opacity="0.5" markerEnd="url(#arrow)" />
              <rect x="70" y="250" width="160" height="60" rx="4" fill="var(--color-muted)" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="4" />
              <text x="150" y="275" textAnchor="middle" fill="currentColor">106 Document Vectors</text>
              <text x="150" y="295" textAnchor="middle" fill="currentColor" opacity="0.5" className="text-xs font-mono">3072-dim embeddings</text>

              {/* Graph Branch */}
              <rect x="370" y="150" width="160" height="40" rx="4" fill="var(--color-background)" stroke="currentColor" strokeWidth="1" />
              <text x="450" y="175" textAnchor="middle" fill="currentColor">Neo4j Cypher Traversal</text>

              <path d="M 450 190 L 450 250" stroke="currentColor" strokeWidth="1" opacity="0.5" markerEnd="url(#arrow)" />
              <rect x="370" y="250" width="160" height="60" rx="4" fill="var(--color-muted)" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="4" />
              <text x="450" y="275" textAnchor="middle" fill="currentColor">Knowledge Graph</text>
              <text x="450" y="295" textAnchor="middle" fill="currentColor" opacity="0.5" className="text-xs font-mono">850 Nodes, 1.2k Edges</text>

              {/* Convergence */}
              <path d="M 150 310 L 150 340 L 195 340" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" markerEnd="url(#arrow)" />
              <path d="M 450 310 L 450 340 L 405 340" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" markerEnd="url(#arrow)" />

              <rect x="200" y="320" width="200" height="40" rx="4" fill="var(--color-primary)" fillOpacity="0.1" stroke="var(--color-primary)" strokeWidth="1" />
              <text x="300" y="345" textAnchor="middle" fill="currentColor" className="font-medium text-[var(--color-primary)]">Gemini Synthesis</text>
            </svg>
            <figcaption className="text-xs font-mono text-muted-foreground mt-4 text-center">Architecture: Dual-routing inference pipeline</figcaption>
          </div>

          <ol className="space-y-6">
            <li>
              <strong>Extraction Pipeline:</strong> The system processes a raw PDF using Gemini to extract structured entities (Movie, Director, Actor, Genre).
            </li>
            <li>
              <strong>Dual Indexing:</strong> Relationships are pushed to Neo4j (producing an 850-node graph), while semantic summaries are embedded (3072-dim) and pushed to Pinecone.
            </li>
            <li>
              <strong>Query Routing:</strong> An intent classifier evaluates the incoming prompt. Relational queries trigger parameterised Cypher templates against Neo4j. Semantic queries trigger cosine-similarity searches in Pinecone.
            </li>
          </ol>

          <h3>Security by Design</h3>
          <p>
            Generating raw Cypher queries from an LLM is the GraphRAG equivalent of SQL injection. To prevent this, the LLM is only allowed to extract entities and map them to predefined, parameterised Cypher templates. It never writes raw traversal logic.
          </p>

          <h3>Results</h3>
          <p>
            Because relational queries resolve through explicit graph traversal rather than similarity, the system returns exact answers on multi-hop questions ("Who directed the movie where X played Y?") where standard RAG pipelines hallucinate or fail to retrieve the connecting chunk. The next phase is migrating this from a CLI tool to a full web interface.
          </p>
        </article>
      </FadeIn>
    </main>
  );
}
