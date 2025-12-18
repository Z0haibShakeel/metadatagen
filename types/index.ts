

export interface Metadata {
  title: string;
  description: string;
  keywords: string[];
  category: string;
}

export type Provider = 'groq' | 'gemini' | 'openai';

export type ProcessStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'error';

export interface BatchItem {
  id: string;
  file: File;
  mediaType: 'image' | 'video';
  previewUrl: string;
  metadata: Metadata;
  status: ProcessStatus;
  error?: string;
  // History for Undo/Redo
  history: Metadata[];
  historyIndex: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  rpm: number; // Requests per minute
  description?: string;
}

export const MAX_BATCH_SIZE = 800;

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Groq Models
  { 
    id: "meta-llama/llama-4-scout-17b-16e-instruct", 
    name: "Llama 4 Scout (17B)",
    provider: 'groq',
    rpm: 30
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
    rpm: 3,
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

export type KeywordFormat = 'auto' | 'single' | 'double';
export type GenerationSource = 'image' | 'filename';

export interface CustomizationConfig {
  titleLength: number;
  descriptionLength: number;
  keywordCount: number;
  keywordFormat: KeywordFormat;
  generationSource: GenerationSource;
  includeKeywords: string;
  excludeKeywords: string;
  excludeTitleWords: string;
  excludeDescriptionWords: string;
  // Prefix/Suffix additions
  titlePrefix: string;
  titleSuffix: string;
  descriptionPrefix: string;
  descriptionSuffix: string;
}

export const DEFAULT_CUSTOMIZATION: CustomizationConfig = {
  titleLength: 60,
  descriptionLength: 160,
  keywordCount: 10,
  keywordFormat: 'auto',
  generationSource: 'image',
  includeKeywords: "",
  excludeKeywords: "",
  excludeTitleWords: "",
  excludeDescriptionWords: "",
  titlePrefix: "",
  titleSuffix: "",
  descriptionPrefix: "",
  descriptionSuffix: ""
};

export interface AppSettings {
    keys: {
        groq: string[];
        gemini: string[];
        openai: string[];
    };
    activeProvider: Provider;
    activeModelId: string;
    customization: CustomizationConfig;
    autoSwitch: Record<Provider, boolean>; // Keys
    autoModelSwitch: Record<Provider, boolean>; // Models
}

export type UserRole = 'free' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
  // Credit System
  credits_used: number;
  last_reset_date: string; // YYYY-MM-DD in UTC
}

export const CATEGORIES = [
  "1: Animals",
  "2: Buildings and Architecture",
  "3: Business",
  "4: Drinks",
  "5: The Environment",
  "6: States of Mind",
  "7: Food",
  "8: Graphic Resources",
  "9: Hobbies and Leisure",
  "10: Industry",
  "11: Landscape",
  "12: Lifestyle",
  "13: People",
  "14: Plants and Flowers",
  "15: Culture and Religion",
  "16: Science",
  "17: Social Issues",
  "18: Sports",
  "19: Technology",
  "20: Transport",
  "21: Travel"
];