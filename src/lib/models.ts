export type Model = {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
};

export const MODELS: Model[] = [
  { id: "deepseek-v4-flash-free", name: "DeepSeek V4 Flash", provider: "MiniProxy", description: "Fast & capable free model", badge: "Free" },
  { id: "mimo-v2.5-free", name: "Mimo v2.5", provider: "MiniProxy", description: "Balanced general-purpose model", badge: "Free" },
  { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra", provider: "MiniProxy", description: "Powerful reasoning model", badge: "Free" },
  { id: "north-mini-code-free", name: "North Mini Code", provider: "MiniProxy", description: "Optimized for code generation", badge: "Free" },
  { id: "laguna-s-2.1-free", name: "Laguna S 2.1", provider: "MiniProxy", description: "Lightweight & efficient", badge: "Free" },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export const API_BASE = "https://mini-proxy-eta.vercel.app/v1";
