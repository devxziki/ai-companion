import { Check, ChevronDown, Sparkle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODELS } from "@/lib/models";
import { cn } from "@/lib/utils";

type Props = { value: string; onChange: (id: string) => void; className?: string };

export function ModelSelector({ value, onChange, className }: Props) {
  const current = MODELS.find((m) => m.id === value) ?? MODELS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors",
            className,
          )}
        >
          <Sparkle className="h-3.5 w-3.5 text-brand" />
          <span className="max-w-[10rem] truncate">{current.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Choose a model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MODELS.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onSelect={() => onChange(m.id)}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{m.name}</span>
                {m.badge && (
                  <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                    {m.badge}
                  </span>
                )}
              </div>
              {m.id === value && <Check className="h-3.5 w-3.5 text-brand" />}
            </div>
            <span className="text-xs text-muted-foreground">{m.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
