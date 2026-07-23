export type Model = {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
};

export const MODELS: Model[] = [
  { id: "mini-5", name: "Mini-5", provider: "MiniCoder", description: "Fast & balanced everyday model", badge: "Default" },
  { id: "mini-5-pro", name: "Mini-5 Pro", provider: "MiniCoder", description: "Deeper reasoning for complex tasks", badge: "Pro" },
  { id: "aurora", name: "Aurora", provider: "Anthropic-like", description: "Thoughtful, long-context assistant" },
  { id: "nova", name: "Nova", provider: "Google-like", description: "Multimodal generalist" },
  { id: "deepthink", name: "DeepThink", provider: "DeepSeek-like", description: "Strong at math & code" },
  { id: "qwen-max", name: "Qwen-Max", provider: "Qwen-like", description: "Multilingual powerhouse" },
  { id: "llama-flow", name: "Llama Flow", provider: "Meta-like", description: "Open-weights reasoning" },
  { id: "mistral-air", name: "Mistral Air", provider: "Mistral-like", description: "Snappy European model" },
  { id: "openrouter-any", name: "OpenRouter Any", provider: "OpenRouter-like", description: "Route to any model" },
  { id: "groq-lightning", name: "Groq Lightning", provider: "Groq-like", description: "Ultra-fast inference" },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;
