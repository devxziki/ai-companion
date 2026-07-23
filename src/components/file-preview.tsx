import { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { X, FileCode, Copy, Check } from "lucide-react";
import { useWorkspace } from "@/store/workspace-store";
import { useSettings } from "@/store/settings-store";
import { readFile } from "@/lib/fs-access";
import { EDITOR_THEMES } from "@/lib/monaco-themes";
import { getAppTheme } from "@/lib/app-themes";

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  mjs: "javascript", cjs: "javascript", json: "json", md: "markdown",
  html: "html", css: "css", scss: "scss", less: "less",
  py: "python", rb: "ruby", rs: "rust", go: "go", java: "java",
  c: "c", cpp: "cpp", cs: "csharp", swift: "swift", kt: "kotlin",
  php: "php", sh: "shell", bash: "shell", yml: "yaml", yaml: "yaml",
  xml: "xml", sql: "sql", graphql: "graphql", vue: "html", svelte: "html",
  toml: "ini", ini: "ini", cfg: "ini", env: "dotenv",
  txt: "plaintext", log: "plaintext", gitignore: "plaintext",
};

function detectLanguage(filePath: string): string {
  const name = filePath.split("/").pop() ?? "";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (name === ".gitignore") return "plaintext";
  if (name === "Dockerfile") return "dockerfile";
  if (name === "Makefile") return "makefile";
  return EXT_TO_LANG[ext] ?? "plaintext";
}

let themesDefined = false;

function defineMonacoThemes(monaco: typeof import("monaco-editor")) {
  if (themesDefined) return;
  themesDefined = true;
  for (const t of EDITOR_THEMES) {
    if (t.id !== "vs-dark" && t.id !== "vs") {
      monaco.editor.defineTheme(t.id, t.define);
    }
  }
}

export function FilePreview() {
  const rootHandle = useWorkspace((s) => s.rootHandle);
  const openFilePath = useWorkspace((s) => s.openFilePath);
  const openFileContent = useWorkspace((s) => s.openFileContent);
  const setOpenFile = useWorkspace((s) => s.setOpenFile);
  const appThemeId = useSettings((s) => s.theme);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (openFilePath && openFileContent === null && rootHandle) {
      readFile(rootHandle, openFilePath).then((content) => {
        setOpenFile(openFilePath, content ?? "// Unable to read file");
      });
    }
  }, [openFilePath, rootHandle]);

  useEffect(() => {
    loader.init().then(defineMonacoThemes);
  }, []);

  if (!openFilePath) return null;

  const ext = openFilePath.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp"].includes(ext);

  const copyContent = () => {
    if (openFileContent) {
      navigator.clipboard.writeText(openFileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Map app theme to Monaco theme
  const monacoTheme = EDITOR_THEMES.find((t) => t.id === appThemeId)
    ? appThemeId
    : getAppTheme(appThemeId).type === "light"
      ? "vs"
      : "vs-dark";

  const lang = detectLanguage(openFilePath);
  const fileName = openFilePath.split("/").pop();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="truncate text-xs font-medium text-foreground" title={openFilePath}>
          <FileCode className="mr-1.5 inline h-3.5 w-3.5" />
          {fileName}
          <span className="ml-2 text-muted-foreground/60 font-normal">{lang}</span>
        </span>
        <div className="flex items-center gap-0.5">
          {openFileContent && (
            <button
              onClick={copyContent}
              className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Copy content"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={() => setOpenFile(null, null)}
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {isImage && openFileContent ? (
          <div className="flex h-full items-center justify-center bg-background p-4">
            <img src={openFileContent} alt={openFilePath} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
        ) : openFileContent !== null ? (
          <Editor
            key={`${openFilePath}-${monacoTheme}`}
            language={lang}
            value={openFileContent}
            theme={monacoTheme}
            onMount={(editor) => { editorRef.current = editor; }}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              lineNumbers: "on",
              renderLineHighlight: "all",
              scrollBeyondLastLine: false,
              fontSize: 13,
              fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
              fontLigatures: true,
              tabSize: 2,
              wordWrap: "off",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 8 },
              folding: true,
              foldingHighlight: true,
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading…</div>
        )}
      </div>
    </div>
  );
}
