

import React from 'react';
import { BatchItem } from '../../types/index';
import { UploadZone } from '../assets/UploadZone';
import { Icons } from '../ui/Icons';

interface ImageCanvasProps {
  item: BatchItem | undefined;
  onUpload: () => void;
  onFilesAdded: (files: File[]) => void;
  canUndo: boolean; // New prop
  canRedo: boolean; // New prop
  onUndo: (() => void) | undefined; // New prop, can be undefined if no item
  onRedo: (() => void) | undefined; // New prop, can be undefined if no item
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ item, onUpload, onFilesAdded, canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <div className="flex-1 bg-dot-pattern relative flex items-center justify-center p-8 overflow-hidden z-0">
        {item ? (
            <>
                <div className="relative group max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden ring-1 ring-gray-900/5 bg-white transition-all duration-300 animate-in zoom-in-95 duration-200">
                    <img src={item.previewUrl} className="max-w-full max-h-[calc(100vh-8rem)] object-contain" />
                    
                    {/* Filename Overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-200 z-10">
                        {item.file.name}
                    </div>

                    {/* Video Indicator Overlay */}
                    {item.mediaType === 'video' && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                            <Icons.Play className="w-3 h-3 fill-white" />
                            VIDEO PREVIEW
                        </div>
                    )}
                </div>

                {/* Undo / Redo Floating Buttons */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-lg z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button 
                        onClick={onUndo} 
                        disabled={!canUndo}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Undo Change"
                    >
                        <Icons.ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button 
                        onClick={onRedo}
                        disabled={!canRedo} 
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Redo Change"
                    >
                        <Icons.ArrowLeft className="w-4 h-4 scale-x-[-1]" />
                    </button>
                </div>
            </>
        ) : (
            <UploadZone onUpload={onUpload} onFilesAdded={onFilesAdded} isUploading={false} />
        )}
    </div>
  );
};