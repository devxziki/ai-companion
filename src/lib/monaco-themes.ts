import type { editor } from "monaco-editor";

export type EditorTheme = {
  id: string;
  label: string;
  type: "dark" | "light";
  define: editor.IStandaloneThemeData;
};

export const EDITOR_THEMES: EditorTheme[] = [
  {
    id: "vs-dark",
    label: "VS Dark",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {},
    },
  },
  {
    id: "one-dark-pro",
    label: "One Dark Pro",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5C6370" },
        { token: "keyword", foreground: "C678DD" },
        { token: "string", foreground: "98C379" },
        { token: "number", foreground: "D19A66" },
        { token: "type", foreground: "E5C07B" },
        { token: "function", foreground: "61AFEF" },
        { token: "variable", foreground: "E06C75" },
      ],
      colors: {
        "editor.background": "#282C34",
        "editor.foreground": "#ABB2BF",
        "editor.lineHighlightBackground": "#2C313C",
        "editor.selectionBackground": "#3E4451",
        "editorCursor.foreground": "#528BFF",
        "editorLineNumber.foreground": "#495162",
        "editorLineNumber.activeForeground": "#ABB2BF",
      },
    },
  },
  {
    id: "dracula",
    label: "Dracula",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272A4" },
        { token: "keyword", foreground: "FF79C6" },
        { token: "string", foreground: "F1FA8C" },
        { token: "number", foreground: "BD93F9" },
        { token: "type", foreground: "8BE9FD" },
        { token: "function", foreground: "50FA7B" },
        { token: "variable", foreground: "FF5555" },
      ],
      colors: {
        "editor.background": "#282A36",
        "editor.foreground": "#F8F8F2",
        "editor.lineHighlightBackground": "#44475A",
        "editor.selectionBackground": "#44475A",
        "editorCursor.foreground": "#F8F8F2",
        "editorLineNumber.foreground": "#6272A4",
        "editorLineNumber.activeForeground": "#F8F8F2",
      },
    },
  },
  {
    id: "matrix",
    label: "Matrix",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008751" },
        { token: "keyword", foreground: "00FF41" },
        { token: "string", foreground: "00CC33" },
        { token: "number", foreground: "00FF41" },
        { token: "type", foreground: "33FF66" },
        { token: "function", foreground: "66FF99" },
        { token: "variable", foreground: "00AA22" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#00FF41",
        "editor.lineHighlightBackground": "#003300",
        "editor.selectionBackground": "#005500",
        "editorCursor.foreground": "#00FF41",
        "editorLineNumber.foreground": "#005500",
        "editorLineNumber.activeForeground": "#00FF41",
      },
    },
  },
  {
    id: "github-light",
    label: "GitHub Light",
    type: "light",
    define: {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6E7781" },
        { token: "keyword", foreground: "CF222E" },
        { token: "string", foreground: "0A3069" },
        { token: "number", foreground: "0550AE" },
        { token: "type", foreground: "6639BA" },
        { token: "function", foreground: "8250DF" },
        { token: "variable", foreground: "953800" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#1F2328",
        "editor.lineHighlightBackground": "#F6F8FA",
        "editor.selectionBackground": "#D0D7DE",
        "editorCursor.foreground": "#1F2328",
        "editorLineNumber.foreground": "#959DA5",
        "editorLineNumber.activeForeground": "#1F2328",
      },
    },
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8B949E" },
        { token: "keyword", foreground: "FF7B72" },
        { token: "string", foreground: "A5D6FF" },
        { token: "number", foreground: "79C0FF" },
        { token: "type", foreground: "FFA657" },
        { token: "function", foreground: "D2A8FF" },
        { token: "variable", foreground: "FFA198" },
      ],
      colors: {
        "editor.background": "#0D1117",
        "editor.foreground": "#C9D1D9",
        "editor.lineHighlightBackground": "#161B22",
        "editor.selectionBackground": "#3B5070",
        "editorCursor.foreground": "#C9D1D9",
        "editorLineNumber.foreground": "#484F58",
        "editorLineNumber.activeForeground": "#C9D1D9",
      },
    },
  },
  {
    id: "monokai",
    label: "Monokai",
    type: "dark",
    define: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "88846F" },
        { token: "keyword", foreground: "F92672" },
        { token: "string", foreground: "E6DB74" },
        { token: "number", foreground: "AE81FF" },
        { token: "type", foreground: "66D9EF" },
        { token: "function", foreground: "A6E22E" },
        { token: "variable", foreground: "F8F8F2" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#F8F8F2",
        "editor.lineHighlightBackground": "#3E3D32",
        "editor.selectionBackground": "#49483E",
        "editorCursor.foreground": "#F8F8F2",
        "editorLineNumber.foreground": "#75715E",
        "editorLineNumber.activeForeground": "#F8F8F2",
      },
    },
  },
];

export const DEFAULT_THEME_ID = "one-dark-pro";
