import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  title?: string;
  description?: string;
}

export function Header({
  theme,
  onThemeToggle,
  title,
  description,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 shrink-0 bg-background/95 backdrop-blur-md border-b border-border/10">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/[0.02] dark:bg-foreground/[0.04]">
            <img src="/logo.svg" alt="LeelE" className="h-5 w-5 opacity-80" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold font-sans text-foreground/90">
            {title}
          </h1>
          <div className="h-4 w-px bg-border/10" />
          <p className="text-sm font-medium font-sans text-foreground/50 hidden sm:block">
            {description}
          </p>
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </header>
  );
}
