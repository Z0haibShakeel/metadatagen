import React from 'react';
import { Provider, AVAILABLE_MODELS } from '../../types/index';
import { Icons } from '../ui/Icons';

interface ProviderSelectorProps {
  activeProvider: Provider;
  setActiveProvider: (p: Provider) => void;
  setActiveModelId: (id: string) => void;
  keys: { [key in Provider]: string[] };
}

const providers: { id: Provider; name: string; icon: any }[] = [
    { id: 'groq', name: 'Groq', icon: Icons.Cpu },
    { id: 'gemini', name: 'Gemini', icon: Icons.Sparkles },
    { id: 'openai', name: 'OpenAI', icon: Icons.Bot },
];

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ 
  activeProvider, setActiveProvider, setActiveModelId, keys 
}) => {
  
  const handleSelect = (p: Provider) => {
    setActiveProvider(p);
    const provModels = AVAILABLE_MODELS.filter(m => m.provider === p);
    // Only switch default model if current one isn't valid for new provider
    const currentModelValid = provModels.some(m => m.provider === p); // logic check needs access to current model, simplifying to auto-select first
    if (provModels.length > 0) {
        setActiveModelId(provModels[0].id);
    }
  };

  return (
    <div className="space-y-1">
        {providers.map((p) => {
            const keyCount = keys[p.id]?.length || 0;
            const isActive = activeProvider === p.id;
            return (
            <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full text-left relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive 
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <p.icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span className="flex-1 font-medium text-sm">{p.name}</span>
                
                {keyCount > 0 ? (
                   <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'}`}>{keyCount}</span>
                ) : (
                   isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
            </button>
        )})}
    </div>
  );
};