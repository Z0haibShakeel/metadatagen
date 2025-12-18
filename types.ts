export interface Metadata {
  title: string;
  description: string;
  keywords: string[];
}

export type Provider = 'groq' | 'gemini' | 'openai';

export interface AppState {
  keys: {
    groq: string[];
    gemini: string[];
    openai: string[];
  };
  activeProvider: Provider;
  activeModelId: string;
  image: string | null; // base64
  metadata: Metadata | null;
  isLoading: boolean;
  error: string | null;
}

export type ProcessStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'error';

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  metadata: Metadata;
  status: ProcessStatus;
  error?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  rpm: number; // Requests per minute
  description?: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Groq Models
  { 
    id: "meta-llama/llama-4-scout-17b-16e-instruct", 
    name: "Llama 4 Scout (17B)",
    provider: 'groq',
    rpm: 30 // Approx safe limit
  },
  { 
    id: "meta-llama/llama-4-maverick-17b-128e-instruct", 
    name: "Llama 4 Maverick (17B)",
    provider: 'groq',
    rpm: 30
  },
  
  // Gemini Models
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: 'gemini',
    rpm: 10,
    description: "10 RPM / 20 RPD"
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: 'gemini',
    rpm: 5,
    description: "5 RPM / 20 RPD"
  },

  // OpenAI Models
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: 'openai',
    rpm: 3, // Safe default for lower tiers
    description: "Fast & Cost Effective"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: 'openai',
    rpm: 3,
    description: "High Intelligence"
  }
];

export const DEFAULT_MODELS: Record<Provider, string> = {
  groq: AVAILABLE_MODELS[0].id,
  gemini: "gemini-2.5-flash-lite",
  openai: "gpt-4o-mini"
};

// --- Customization Types ---

export type KeywordFormat = 'auto' | 'single' | 'double';

export interface CustomizationConfig {
  titleLength: number;
  descriptionLength: number;
  keywordCount: number;
  keywordFormat: KeywordFormat;
  includeKeywords: string; // Comma separated string for UI simplicity
  excludeKeywords: string; // Comma separated string for UI simplicity
}

export const DEFAULT_CUSTOMIZATION: CustomizationConfig = {
  titleLength: 60,
  descriptionLength: 160,
  keywordCount: 10,
  keywordFormat: 'auto',
  includeKeywords: "",
  excludeKeywords: ""
};