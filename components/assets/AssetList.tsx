
import React, { useRef } from 'react';
import { BatchItem } from '../../types/index';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { AssetItem } from './AssetItem';

interface AssetListProps {
  items: BatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
  onAdd: (files: File[]) => void;
  isUploading: boolean;
  isCollapsed?: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({ 
  items, selectedId, onSelect, onRemove, onAdd, isUploading, isCollapsed = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) onAdd(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Search / Filter Area */}
      <div className={`p-3 border-b border-gray-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-xs font-bold ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2.5'}`}
              title="Import Media"
            >
              <Icons.Plus className="w-3.5 h-3.5"/> 
              {!isCollapsed && (isUploading ? "Uploading..." : "Import Media")}
            </button>
            <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*,video/*,.svg" onChange={handleFileUpload} />
      </div>
      
      <div className={`flex-1 overflow-y-auto p-3 space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
          {items.map(item => (
            <AssetItem 
              key={item.id} 
              item={item} 
              isSelected={selectedId === item.id} 
              onSelect={() => onSelect(item.id)}
              onRemove={(e) => onRemove(item.id, e)}
              isCompact={isCollapsed}
            />
          ))}
          
          {items.length === 0 && !isUploading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30 mt-10">
                  <Icons.Image className="w-8 h-8 text-gray-400 mb-2" />
                  {!isCollapsed && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Empty Navigator</p>}
              </div>
          )}
      </div>
    </div>
  );
};
