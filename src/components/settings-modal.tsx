import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/store/settings-store";
import { useChatStore } from "@/store/chat-store";
import { toast } from "sonner";

// Tabs may be missing; provide simple fallback via Tabs from shadcn.
export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { theme, setTheme, sendOnEnter, setSendOnEnter, language, setLanguage } = useSettings();
  const { chats, clearAll, importChats } = useChatStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportAll = () => {
    const data = JSON.stringify({ version: 1, chats: Object.values(chats) }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minicoder-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported all chats");
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.chats;
      if (!Array.isArray(list)) throw new Error("Invalid file");
      importChats(list);
      toast.success(`Imported ${list.length} chats`);
    } catch (e) {
      toast.error("Failed to import: " + (e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Personalize MiniCoder to your workflow.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex min-h-[420px] flex-col sm:flex-row">
          <TabsList className="flex h-auto w-full flex-row justify-start rounded-none border-b border-border bg-transparent p-2 sm:w-52 sm:flex-col sm:border-b-0 sm:border-r sm:p-3">
            {[
              ["appearance", "Appearance"],
              ["chat", "Chat"],
              ["data", "Data"],
              ["danger", "Danger zone"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="w-full justify-start rounded-lg data-[state=active]:bg-accent"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 p-6">
            <TabsContent value="appearance" className="mt-0 space-y-5">
              <Field label="Theme" description="Choose your color scheme.">
                <Select value={theme} onValueChange={(v) => setTheme(v as "dark" | "light")}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language" description="Interface language (placeholder).">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </TabsContent>

            <TabsContent value="chat" className="mt-0 space-y-5">
              <Field label="Send with Enter" description="If off, use ⌘/Ctrl + Enter to send.">
                <Switch checked={sendOnEnter} onCheckedChange={setSendOnEnter} />
              </Field>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                All your chats live in this browser. Export a backup or move them to another device.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportAll}>
                  <Download className="mr-2 h-4 w-4" /> Export chats
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Import chats
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="danger" className="mt-0 space-y-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <h4 className="text-sm font-semibold text-destructive">Reset MiniCoder</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Deletes all chats and resets settings. This cannot be undone.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Switch checked={confirmReset} onCheckedChange={setConfirmReset} id="confirm" />
                  <Label htmlFor="confirm" className="text-xs">I understand</Label>
                </div>
                <Button
                  variant="destructive"
                  className="mt-3"
                  disabled={!confirmReset}
                  onClick={() => {
                    clearAll();
                    toast.success("All chats cleared");
                    onOpenChange(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear all chats
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
