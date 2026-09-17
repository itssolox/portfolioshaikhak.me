import { FadeIn } from "@/components/animations";
import { ArrowLeft, ExternalLink, Github, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function PlacementPredictor() {
  return (
    <main className="min-h-[100dvh] pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
      <FadeIn>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </FadeIn>

      <FadeIn delay={0.1}>
        <header className="mb-16">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">Placement Predictor</h1>
          <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground mb-8">
            <span>C++</span>
            <span>Gradient Descent</span>
            <span>From Scratch</span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A logistic-regression classifier — a single neuron with a sigmoid — written from scratch in C++ with no ML framework, so every step of training is visible in the code.
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="flex flex-wrap gap-6 mb-16 border-y border-border/50 py-6">
          <a href="https://github.com/akamalferojshaikh/placement-predictor-DL-model" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium hover:text-primary transition-colors">
            <Github className="w-4 h-4" /> Source Code
          </a>
          <span className="text-muted-foreground/30 hidden sm:inline">|</span>
          <div className="inline-flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <TrendingUp className="w-4 h-4" /> 50k+ Impressions on LinkedIn
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight">
          <h3>The Motivation</h3>
          <p>
            Anyone can call <code>model.fit()</code> in PyTorch or scikit-learn. I wanted to understand exactly what happens underneath those abstractions — how a prediction is made, how the loss is measured, and how the weights actually move. 
          </p>
          <p>
            I chose C++ so there was no NumPy to lean on: the loops, the arithmetic and the update rule all had to be written by hand.
          </p>

          <h3>The Implementation</h3>
          <p>
            The project is a binary classification model (Logistic Regression) designed to predict student placement outcomes based on synthetic academic records.
          </p>

          <ul>
            <li>
              <strong>The Math:</strong> Forward pass (weighted sum plus bias), sigmoid activation, binary cross-entropy loss and gradient descent with per-record weight updates, all implemented by hand.
            </li>
            <li>
              <strong>Data Processing:</strong> CSV loading and Min-Max normalisation for a self-generated dataset of 2,000+ synthetic student records with four features: DSA problems solved, projects completed, IQ score and attendance percentage.
            </li>
            <li>
              <strong>Inference:</strong> A separate prediction program takes the trained weights and normalisation statistics and outputs a placement probability for new student profiles.
            </li>
          </ul>

          <div className="my-12 p-8 bg-muted/30 border border-border/50 rounded-lg">
            <pre className="text-sm font-mono overflow-x-auto text-foreground">
{`// Training loop: one gradient step per record
for (int epoch = 0; epoch < epochs; ++epoch) {
    double total_loss = 0.0;

    for (int i = 0; i < n_samples; ++i) {
        // Forward pass
        double z = bias;
        for (int j = 0; j < n_features; ++j) {
            z += weights[j] * X[i][j];
        }
        double prediction = sigmoid(z);
        total_loss += binary_cross_entropy(y[i], prediction);

        // Gradient of BCE loss w.r.t. weights and bias
        double error = prediction - y[i];
        for (int j = 0; j < n_features; ++j) {
            weights[j] -= learning_rate * error * X[i][j];
        }
        bias -= learning_rate * error;
    }
}`}
            </pre>
          </div>

          <h3>Impact</h3>
          <p>
            When I shared the source code and a walkthrough on LinkedIn, the post reached over 50,000 impressions with 180+ reactions — a useful signal that engineers still value seeing the fundamentals written out rather than imported.
          </p>
        </article>
      </FadeIn>
    </main>
  );
}
