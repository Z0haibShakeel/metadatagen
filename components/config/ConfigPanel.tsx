
import React, { useState } from 'react';
import { CustomizationConfig, KeywordFormat, ModelConfig, GenerationSource } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';

interface ConfigPanelProps {
  customization: CustomizationConfig;
  setCustomization: (c: CustomizationConfig) => void;
  activeModel: ModelConfig | undefined;
  disabled?: boolean;
}

const ConfigSection = ({ title, icon: Icon, children, disabled }: any) => (
    <div className={`space-y-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 px-1">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ customization, setCustomization, activeModel, disabled = false }) => {
  const updateCust = (field: keyof CustomizationConfig, value: any) => {
    if (disabled) return;
    setCustomization({ ...customization, [field]: value });
  };

  return (
    <div className="space-y-10 pb-10">
       <ConfigSection title="Analysis Engine" icon={Icons.Cpu} disabled={disabled}>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['image', 'filename'] as GenerationSource[]).map((src) => (
                    <button
                        key={src}
                        onClick={() => updateCust('generationSource', src)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${
                        customization.generationSource === src ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {src}
                    </button>
                ))}
            </div>
       </ConfigSection>

       <ConfigSection title="Title Constraints" icon={Icons.Type} disabled={disabled}>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Label className="mb-0 text-[10px]">Max Chars</Label>
                    <span className="text-xs font-bold text-gray-900">{customization.titleLength}</span>
                </div>
                <input 
                    type="range" min={10} max={200} step={1}
                    value={customization.titleLength} 
                    onChange={(e) => updateCust('titleLength', parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Prefix..." value={customization.titlePrefix} onChange={(e) => updateCust('titlePrefix', e.target.value)} className="text-[10px] h-8 bg-gray-50" />
                    <Input placeholder="Suffix..." value={customization.titleSuffix} onChange={(e) => updateCust('titleSuffix', e.target.value)} className="text-[10px] h-8 bg-gray-50" />
                </div>
            </div>
       </ConfigSection>

       <ConfigSection title="Keywords Strategy" icon={Icons.Tag} disabled={disabled}>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Label className="mb-0 text-[10px]">Tag Count</Label>
                    <span className="text-xs font-bold text-gray-900">{customization.keywordCount}</span>
                </div>
                <input 
                    type="range" min={3} max={50}
                    value={customization.keywordCount} 
                    onChange={(e) => updateCust('keywordCount', parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div>
                    <Label className="mb-1.5 text-[10px]">Force Keywords</Label>
                    <Textarea 
                        placeholder="Comma separated..." value={customization.includeKeywords}
                        onChange={(e) => updateCust('includeKeywords', e.target.value)}
                        className="h-14 text-[10px] resize-none bg-gray-50 border-gray-100"
                    />
                </div>
                <div>
                    <Label className="mb-1.5 text-[10px]">Blacklist Words</Label>
                    <Textarea 
                        placeholder="Comma separated..." value={customization.excludeKeywords}
                        onChange={(e) => updateCust('excludeKeywords', e.target.value)}
                        className="h-14 text-[10px] resize-none bg-red-50/20 border-red-100 placeholder:text-red-200"
                    />
                </div>
            </div>
       </ConfigSection>
    </div>
  );
};
