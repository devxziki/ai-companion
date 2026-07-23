import { APP_THEMES, type AppTheme } from "@/lib/app-themes";
import { useSettings } from "@/store/settings-store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSelector({ align = "end" }: { align?: "center" | "end" | "start" }) {
  const current = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Select theme" title="Select theme">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        {APP_THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => setTheme(t.id)}
            className={cn("gap-3", current === t.id && "text-brand font-medium")}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border"
              style={{
                background: `linear-gradient(135deg, ${t.colors["--brand"]} 50%, ${t.colors["--background"]} 50%)`,
              }}
            />
            <div className="flex flex-1 items-center justify-between">
              <span>{t.label}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{t.type}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
