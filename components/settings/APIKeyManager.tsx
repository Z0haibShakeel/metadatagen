import React, { useState } from 'react';
import { Provider } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { verifyApiKey } from '../../services/ai/index';
import { maskKey } from '../../services/utils';

interface APIKeyManagerProps {
  provider: Provider;
  providerName: string;
  providerUrl: string;
  isActive: boolean;
  keys: string[];
  setKeys: (newKeys: string[]) => void;
  autoSwitch: boolean;
  setAutoSwitch: (val: boolean) => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
}

export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ 
  provider, providerName, providerUrl, isActive, keys, setKeys,
  autoSwitch, setAutoSwitch, selectedIndex, setSelectedIndex
}) => {
  const [newKey, setNewKey] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleAddKey = async () => {
    if (!newKey.trim()) return;
    if (keys.includes(newKey.trim())) {
        alert("This key is already added.");
        return;
    }
    setVerifying(true);
    const isValid = await verifyApiKey(provider, newKey.trim());
    setVerifying(false);
    if (isValid) {
      setKeys([...keys, newKey.trim()]);
      setNewKey("");
    } else {
      alert(`Invalid ${providerName} API Key`);
    }
  };

  const removeKey = (keyToRemove: string, index: number) => {
    const newKeys = keys.filter(k => k !== keyToRemove);
    setKeys(newKeys);
    if (index < selectedIndex) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (index === selectedIndex) {
        setSelectedIndex(0);
    }
  };

  if (!isActive) return null;

  return (
    <div className="block space-y-5 animate-in fade-in duration-300">
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-between bg-white p-1 rounded-lg">
            <div>
                <span className="block text-sm font-medium text-gray-900">Auto-Switch Keys</span>
                <span className="text-xs text-gray-500">Cycle through keys on failure</span>
            </div>
            <button
                onClick={() => setAutoSwitch(!autoSwitch)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 ${autoSwitch ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoSwitch ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
            <Input 
                id={`${provider}-key`}
                type="password"
                placeholder={`Paste new ${providerName} API Key...`}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="font-mono text-xs h-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                disabled={keys.length >= 10}
            />
            <Button 
                onClick={handleAddKey} 
                disabled={!newKey || verifying || keys.length >= 10}
                className="shrink-0 h-9 px-3"
                variant="primary"
            >
                {verifying ? <Icons.Loader className="w-3.5 h-3.5 animate-spin" /> : <span className="text-xs">Add</span>}
            </Button>
        </div>

        {/* List */}
        {keys.length > 0 ? (
            <div className="space-y-2">
                {keys.map((k, idx) => {
                    const isSelected = !autoSwitch && selectedIndex === idx;
                    return (
                        <div 
                            key={idx} 
                            onClick={() => !autoSwitch && setSelectedIndex(idx)}
                            className={`flex items-center justify-between px-3 py-2 border rounded-lg group transition-all ${
                                isSelected
                                ? 'bg-gray-50 border-gray-900 ring-1 ring-gray-900/5' 
                                : 'bg-white border-gray-100 hover:border-gray-300'
                            } ${!autoSwitch ? 'cursor-pointer' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Indicator / Radio */}
                                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono shrink-0 transition-colors ${
                                    isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 border border-gray-200 text-gray-500'
                                }`}>
                                    {autoSwitch ? (idx + 1) : (isSelected ? <Icons.Check className="w-3 h-3" /> : (idx + 1))}
                                </div>
                                <span className={`font-mono text-xs ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{maskKey(k)}</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeKey(k, idx); }}
                                className="text-gray-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <Icons.Layout className="w-6 h-6 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No API keys added yet</p>
            </div>
        )}
    </div>
  );
};