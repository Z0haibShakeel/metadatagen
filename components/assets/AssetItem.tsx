
import React from 'react';
import { BatchItem } from '../../types/index';
import { Icons } from '../ui/Icons';

interface AssetItemProps {
  item: BatchItem;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

export const AssetItem: React.FC<AssetItemProps> = ({ item, isSelected, onSelect, onRemove, isCompact = false }) => {
  if (isCompact) {
      return (
        <div 
            onClick={onSelect} 
            className={`group relative w-full aspect-square rounded-lg cursor-pointer transition-all duration-200 border overflow-hidden ${
                isSelected 
                ? 'border-gray-900 shadow-md ring-1 ring-gray-900/10' 
                : 'border-transparent hover:border-gray-200'
            }`}
            title={item.file.name}
        >
            <img src={item.previewUrl} className={`w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}`}/>
            {item.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Icons.Play className="w-3 h-3 text-white fill-white" />
                </div>
            )}
            <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'processing' ? 'bg-blue-500 animate-pulse' : 
                item.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
            }`} />
        </div>
      );
  }

  return (
    <div 
        onClick={onSelect} 
        className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
            isSelected 
            ? 'bg-gray-900 border-gray-900 shadow-md ring-1 ring-gray-900/10' 
            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
        }`}
    >
        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100 border border-gray-200 relative">
            <img src={item.previewUrl} className={`w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}`}/>
            {item.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Icons.Play className="w-2.5 h-2.5 text-white fill-white" />
                </div>
            )}
            <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'processing' ? 'bg-blue-500 animate-pulse' : 
                item.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
            }`} />
        </div>
        
        <div className="flex-1 min-w-0">
            <div className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{item.file.name}</div>
            <div className={`text-[9px] font-medium uppercase tracking-tighter ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                {item.status === 'completed' ? 'Optimized' : item.status}
            </div>
        </div>
        
        <button 
            onClick={(e) => { e.stopPropagation(); onRemove(e); }}
            className={`p-1 rounded-md transition-opacity ${isSelected ? 'text-gray-500 hover:text-white opacity-40 hover:opacity-100' : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'}`}
        >
            <Icons.X className="w-3 h-3"/>
        </button>
    </div>
  );
};
