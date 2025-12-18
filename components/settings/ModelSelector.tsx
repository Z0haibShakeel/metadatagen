import React from 'react';
import { AVAILABLE_MODELS, Provider } from '../../types/index';
import { Icons } from '../ui/Icons';

interface ModelSelectorProps {
  activeProvider: Provider;
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  autoModelSwitch: boolean;
  setAutoModelSwitch: (val: boolean) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  activeProvider, activeModelId, setActiveModelId, autoModelSwitch, setAutoModelSwitch 
}) => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icons.Cpu className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900 text-sm">Model Selection</h3>
            </div>
            
            {/* Model Switching Toggle */}
             <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 hidden sm:block">Auto-Switch Models</span>
                <button
                    onClick={() => setAutoModelSwitch(!autoModelSwitch)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 ${autoModelSwitch ? 'bg-blue-600' : 'bg-gray-200'}`}
                    title="If enabled, the system will try other models if the selected one fails."
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoModelSwitch ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
        
        <div className="p-6">
            <div className="space-y-3">
            {AVAILABLE_MODELS.filter(m => m.provider === activeProvider).map(model => {
                const isSelected = activeModelId === model.id;
                return (
                    <label 
                    key={model.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                        ? 'bg-gray-900 text-white shadow-md border-gray-900 ring-1 ring-gray-900' 
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                    >
                    <div className="mt-1">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-white' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input 
                            type="radio" 
                            name="model" 
                            className="hidden"
                            checked={isSelected}
                            onChange={() => setActiveModelId(model.id)}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">{model.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>~{model.rpm} RPM</span>
                        </div>
                        <div className={`text-xs mt-1 flex items-center gap-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            <span>{model.description || "General Purpose Model"}</span>
                            {autoModelSwitch && !isSelected && (
                                <span className="ml-auto flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100 uppercase font-bold tracking-wide">
                                    Fallback
                                </span>
                            )}
                        </div>
                    </div>
                    </label>
            )})}
            </div>
            
            {autoModelSwitch && (
                <div className="mt-4 flex gap-2 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-lg items-start">
                    <Icons.Zap className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                        <strong>Auto-Switch Active:</strong> If the selected model fails (e.g., Rate Limit), the system will automatically attempt generation using other available models in the list above.
                    </p>
                </div>
            )}
        </div>
    </section>
  );
};