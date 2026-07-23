import { cn } from "@/lib/utils";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-xl bg-gradient-to-br from-brand to-[oklch(0.72_0.18_200)] text-brand-foreground shadow-lg shadow-brand/20",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="MiniCoder"
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" aria-hidden>
        <path
          d="M4 18V7.5c0-.28.34-.42.53-.22l4.7 4.9c.41.43 1.1.43 1.51 0l4.73-4.9c.19-.2.53-.06.53.22V18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="6" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}

export function WordMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={28} />
      <span className="text-lg font-semibold tracking-tight">
        Mini<span className="text-gradient-brand">Coder</span>
      </span>
    </div>
  );
}
