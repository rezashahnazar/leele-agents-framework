import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 shrink-0 bg-background/60 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <img src="/logo.svg" alt="LeelE" className="relative h-6 w-6" />
        </div>
        <div className="flex items-baseline space-x-2">
          <h1 className="text-xl font-bold animate-title-gradient">LeelE</h1>
          <div className="h-3 w-px bg-border/20" />
          <p className="text-sm font-medium text-muted-foreground/40 hidden sm:block">
            INTELLIGENT AGENT FRAMEWORK
          </p>
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </header>
  );
}
