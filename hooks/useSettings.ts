import { AVAILABLE_MODELS, DEFAULT_CUSTOMIZATION, DEFAULT_MODELS, Provider, CustomizationConfig } from '../types/index';
import { useLocalStorage } from './useLocalStorage';

export function useSettings() {
  const [keys, setKeys] = useLocalStorage<{ groq: string[]; gemini: string[]; openai: string[] }>('metadata_api_keys', {
    groq: [], gemini: [], openai: []
  });

  const [activeProvider, setActiveProvider] = useLocalStorage<Provider>('metadata_provider', 'groq');
  const [activeModelId, setActiveModelId] = useLocalStorage<string>('metadata_model', DEFAULT_MODELS.groq);
  const [customization, setCustomization] = useLocalStorage<CustomizationConfig>('metadata_customization', DEFAULT_CUSTOMIZATION);

  // Auto-Switching for KEYS
  const [autoSwitch, setAutoSwitch] = useLocalStorage<Record<Provider, boolean>>('metadata_autoswitch_config', {
    groq: false, gemini: false, openai: false
  });

  // Auto-Switching for MODELS
  const [autoModelSwitch, setAutoModelSwitch] = useLocalStorage<Record<Provider, boolean>>('metadata_autoswitch_model_config', {
    groq: false, gemini: false, openai: false
  });
  
  const [selectedKeyIndices, setSelectedKeyIndices] = useLocalStorage<Record<Provider, number>>('metadata_selected_keys', {
    groq: 0, gemini: 0, openai: 0
  });

  return {
    keys,
    setKeys,
    activeProvider,
    setActiveProvider,
    activeModelId,
    setActiveModelId,
    customization,
    setCustomization,
    autoSwitch,
    setAutoSwitch,
    autoModelSwitch,
    setAutoModelSwitch,
    selectedKeyIndices,
    setSelectedKeyIndices,
    activeModel: AVAILABLE_MODELS.find(m => m.id === activeModelId)
  };
}