import React from 'react';
import { Provider } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { ProviderSelector } from './ProviderSelector';
import { APIKeyManager } from './APIKeyManager';
import { ModelSelector } from './ModelSelector';

interface SettingsDialogProps {
  keys: { groq: string[]; gemini: string[]; openai: string[] };
  setKeys: (keys: { groq: string[]; gemini: string[]; openai: string[] }) => void;
  activeProvider: Provider;
  setActiveProvider: (p: Provider) => void;
  activeModelId: string;
  setActiveModelId: (m: string) => void;
  onClose: () => void;
  autoSwitch: Record<Provider, boolean>;
  setAutoSwitch: (v: Record<Provider, boolean>) => void;
  autoModelSwitch: Record<Provider, boolean>;
  setAutoModelSwitch: (v: Record<Provider, boolean>) => void;
  selectedKeyIndices: Record<Provider, number>;
  setSelectedKeyIndices: (v: Record<Provider, number>) => void;
}

const providersInfo: { id: Provider; name: string; url: string }[] = [
    { id: 'groq', name: 'Groq', url: 'https://console.groq.com/keys' },
    { id: 'gemini', name: 'Gemini', url: 'https://aistudio.google.com/app/apikey' },
    { id: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys' },
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
    keys, setKeys, activeProvider, setActiveProvider, activeModelId, setActiveModelId, onClose,
    autoSwitch, setAutoSwitch, autoModelSwitch, setAutoModelSwitch, selectedKeyIndices, setSelectedKeyIndices
}) => {
  
  const currentProviderInfo = providersInfo.find(p => p.id === activeProvider);

  return (
    <div className="flex-1 bg-gray-50 animate-fade-in-up flex flex-col overflow-hidden">
      
      {/* Settings Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
         <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage API connections and model preferences.</p>
         </div>
         <Button variant="secondary" size="sm" onClick={onClose}>
            <Icons.X className="w-4 h-4 mr-2" /> Close
         </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Providers */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 space-y-2 overflow-y-auto">
            <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Providers</h3>
            <ProviderSelector 
                activeProvider={activeProvider}
                setActiveProvider={setActiveProvider}
                setActiveModelId={setActiveModelId}
                keys={keys}
            />
        </div>

        {/* Right Content - Config */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-100/50">
            <div className="max-w-2xl mx-auto space-y-8 pb-20">
                
                {/* Header for current provider */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-900/10">
                            {activeProvider === 'openai' ? <Icons.Bot className="w-5 h-5"/> : activeProvider === 'gemini' ? <Icons.Sparkles className="w-5 h-5"/> : <Icons.Cpu className="w-5 h-5"/>}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeProvider} Configuration</h1>
                            <p className="text-xs text-gray-500">Configure keys and models for {currentProviderInfo?.name}.</p>
                        </div>
                    </div>
                    <a href={currentProviderInfo?.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition-colors">
                        Get API Key <Icons.Layout className="w-3 h-3" />
                    </a>
                </div>

                <div className="space-y-6">
                    {/* API Keys Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
                            <Icons.Layout className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">API Keys</h3>
                        </div>
                        <div className="p-6">
                            {providersInfo.map(p => (
                                <APIKeyManager 
                                    key={p.id}
                                    provider={p.id}
                                    providerName={p.name}
                                    providerUrl={p.url}
                                    isActive={activeProvider === p.id}
                                    keys={keys[p.id]}
                                    setKeys={(k) => setKeys({...keys, [p.id]: k})}
                                    autoSwitch={autoSwitch[p.id]}
                                    setAutoSwitch={(val) => setAutoSwitch({...autoSwitch, [p.id]: val})}
                                    selectedIndex={selectedKeyIndices[p.id]}
                                    setSelectedIndex={(val) => setSelectedKeyIndices({...selectedKeyIndices, [p.id]: val})}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Models Section */}
                    <ModelSelector 
                        activeProvider={activeProvider}
                        activeModelId={activeModelId}
                        setActiveModelId={setActiveModelId}
                        autoModelSwitch={autoModelSwitch[activeProvider]}
                        setAutoModelSwitch={(val) => setAutoModelSwitch({...autoModelSwitch, [activeProvider]: val})}
                    />
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};