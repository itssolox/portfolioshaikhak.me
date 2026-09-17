import { Link } from "wouter";
import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";

export function Nav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 pointer-events-none">
      <nav className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        <Link href="/" className="font-mono text-sm font-bold tracking-tight uppercase hover:text-primary transition-colors text-foreground">
          A.S
        </Link>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
          aria-label="Toggle theme"
          data-testid="button-toggle-theme"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      </nav>
    </header>
  );
}
