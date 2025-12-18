
import React, { useState } from 'react';
import { BatchItem, CustomizationConfig, Metadata, CATEGORIES, UserProfile } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Chip } from '../ui/Chip';
import { UploadZone } from '../assets/UploadZone';

interface MetadataEditorProps {
  item: BatchItem | undefined;
  customization: CustomizationConfig;
  onUpdate: (id: string, field: keyof Metadata, value: any) => void;
  onSnapshot: (id: string) => void;
  onRegenerate: (id: string) => void;
  onUndo: (id: string) => void;
  onRedo: (id: string) => void;
  isProcessing: boolean;
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  onUploadClick: () => void;
  onFilesAdded: (files: File[]) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ 
  item, customization, onUpdate, onSnapshot, onRegenerate, onUndo, onRedo, 
  isProcessing, isLoggedIn, userProfile, onUploadClick, onFilesAdded
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!item) {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-dot-pattern">
            <UploadZone onUpload={onUploadClick} onFilesAdded={onFilesAdded} isUploading={false} />
        </div>
    );
  }

  const isPremium = userProfile?.role === 'premium';
  const isRegenerateLocked = isLoggedIn && !isPremium;

  const handleCopy = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
  };

  const getFullTitle = () => `${customization.titlePrefix || ''}${item.metadata.title}${customization.titleSuffix || ''}`;
  const getFullDesc = () => `${customization.descriptionPrefix || ''}${item.metadata.description}${customization.descriptionSuffix || ''}`;

  const FieldHeader = ({ label, count, limit, fieldName, textToCopy }: any) => {
      const isOverLimit = limit && count > limit;
      return (
          <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
              <div className="flex items-center gap-2">
                  {limit && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isOverLimit ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {count}/{limit}
                      </span>
                  )}
                  <button 
                    onClick={() => handleCopy(textToCopy, fieldName)}
                    className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {copiedField === fieldName ? <Icons.Check className="w-3.5 h-3.5 text-green-500"/> : <Icons.Copy className="w-3.5 h-3.5"/>}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Workspace Hero Header */}
        <div className="shrink-0 p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-6 items-start">
            {/* Visual Preview */}
            <div className="w-full md:w-64 aspect-video md:aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-white shrink-0 group relative">
                <img src={item.previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {item.mediaType === 'video' && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-bold text-white flex items-center gap-1">
                        <Icons.Play className="w-2.5 h-2.5 fill-white" /> VIDEO
                    </div>
                )}
            </div>

            {/* Quick Context & Actions */}
            <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 truncate mb-1">{item.file.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                            item.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-500'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                            {item.status}
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button 
                        size="sm" 
                        variant="primary" 
                        className={`h-9 px-4 text-xs shadow-md ${isRegenerateLocked ? 'opacity-50 grayscale' : 'bg-blue-600 hover:bg-blue-700'}`} 
                        onClick={() => onRegenerate(item.id)} 
                        disabled={isProcessing || isRegenerateLocked}
                    >
                        {isProcessing ? <Icons.Loader className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Icons.Sparkles className="w-3.5 h-3.5 mr-2" />}
                        Regenerate Metadata
                    </Button>
                    <div className="h-9 w-px bg-gray-200 mx-1" />
                    <button onClick={() => onUndo(item.id)} disabled={item.historyIndex <= 0} className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20"><Icons.ArrowLeft className="w-4 h-4"/></button>
                    <button onClick={() => onRedo(item.id)} disabled={item.historyIndex >= item.history.length - 1} className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20"><Icons.ArrowLeft className="w-4 h-4 scale-x-[-1]"/></button>
                </div>
            </div>
        </div>

        {/* Scrollable Workspace Form */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Title */}
            <div className="max-w-4xl">
                <FieldHeader label="Title" count={getFullTitle().length} limit={customization.titleLength} fieldName="title" textToCopy={getFullTitle()} />
                <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all bg-white shadow-sm">
                    {customization.titlePrefix && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-mono text-gray-500 select-none">
                            {customization.titlePrefix}
                        </div>
                    )}
                    <textarea
                        className="w-full text-xl font-bold text-gray-900 bg-white border-none focus:ring-0 placeholder:text-gray-200 resize-none leading-tight p-4 block"
                        value={item.metadata.title}
                        onChange={e => onUpdate(item.id, 'title', e.target.value)}
                        onBlur={() => onSnapshot(item.id)}
                        placeholder="Enter descriptive title..."
                        rows={2}
                    />
                    {customization.titleSuffix && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs font-mono text-gray-500 select-none text-right">
                            {customization.titleSuffix}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl">
                {/* Description */}
                <div>
                    <FieldHeader label="Description" count={getFullDesc().length} limit={customization.descriptionLength} fieldName="description" textToCopy={getFullDesc()} />
                    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all bg-white shadow-sm h-full">
                         {customization.descriptionPrefix && (
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-mono text-gray-500 select-none">
                                {customization.descriptionPrefix}
                            </div>
                        )}
                        <textarea
                            className="w-full flex-1 p-4 text-sm text-gray-600 bg-white border-none focus:ring-0 outline-none transition-all placeholder:text-gray-300 leading-relaxed resize-none"
                            value={item.metadata.description}
                            onChange={e => onUpdate(item.id, 'description', e.target.value)}
                            onBlur={() => onSnapshot(item.id)}
                            placeholder="Detailed visual description..."
                        />
                         {customization.descriptionSuffix && (
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs font-mono text-gray-500 select-none text-right">
                                {customization.descriptionSuffix}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sub-Col (Category & Tags) */}
                <div className="space-y-8">
                    <div>
                        <FieldHeader label="Stock Category" fieldName="category" textToCopy={item.metadata.category} />
                        <div className="relative">
                            <select
                                className="w-full h-11 px-4 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-xl outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-300"
                                value={item.metadata.category || ""}
                                onChange={e => { onUpdate(item.id, 'category', e.target.value); onSnapshot(item.id); }}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <FieldHeader label={`Keywords (${item.metadata.keywords.length})`} limit={customization.keywordCount} fieldName="keywords" textToCopy={item.metadata.keywords.join(', ')} />
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 focus-within:bg-white focus-within:border-blue-300 transition-all">
                            {item.metadata.keywords.map(k => (
                                <Chip 
                                    key={k} 
                                    label={k} 
                                    onRemove={() => { onUpdate(item.id, 'keywords', item.metadata.keywords.filter(x => x!==k)); onSnapshot(item.id); }} 
                                    onCopy={() => handleCopy(k, `kw-${k}`)}
                                />
                            ))}
                            <input
                                type="text"
                                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm h-8 placeholder:text-gray-400"
                                placeholder="Add..."
                                value={keywordInput}
                                onChange={e => setKeywordInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && keywordInput.trim()) {
                                        e.preventDefault();
                                        if (!item.metadata.keywords.includes(keywordInput.trim())) {
                                            onUpdate(item.id, 'keywords', [...item.metadata.keywords, keywordInput.trim()]);
                                            onSnapshot(item.id);
                                        }
                                        setKeywordInput("");
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
