
import React, { useState, useCallback } from 'react';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

interface UploadZoneProps {
  onUpload: () => void;
  onFilesAdded: (files: File[]) => void;
  isUploading: boolean;
}

const SUPPORTED_TYPES = [
  { ext: 'JPG', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { ext: 'PNG', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { ext: 'WEBP', color: 'bg-green-100 text-green-700 border-green-200' },
  { ext: 'SVG', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { ext: 'MP4', color: 'bg-red-100 text-red-700 border-red-200' },
  { ext: 'MOV', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { ext: 'MKV', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, onFilesAdded, isUploading }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  return (
    <div 
      onClick={!isUploading ? onUpload : undefined}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative h-full w-full flex flex-col items-center justify-center p-12 text-center transition-all duration-300 group select-none ${
        isUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'
      }`}
    >
      {/* Animated Background Border */}
      <div className={`absolute inset-4 rounded-3xl border-2 transition-all duration-300 ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50/50 scale-[0.99] border-dashed' 
          : 'border-dashed border-gray-300 hover:border-gray-400 hover:bg-white/50 bg-white/30'
      }`} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md">
        
        {/* Animated Icon Container */}
        <div className={`w-24 h-24 rounded-3xl mb-8 flex items-center justify-center transition-all duration-500 ${
            isDragActive 
              ? 'bg-blue-100 text-blue-600 scale-110 rotate-3 shadow-xl' 
              : 'bg-white shadow-sm border border-gray-100 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100 group-hover:shadow-md'
        }`}>
          {isUploading ? (
            <Icons.Loader className="w-10 h-10 animate-spin text-blue-600" />
          ) : (
            <div className="relative">
               <Icons.Image className={`w-10 h-10 transition-all duration-300 ${isDragActive ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
               <Icons.Download className={`w-10 h-10 absolute inset-0 transition-all duration-300 ${isDragActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
               
               {/* Decorative elements */}
               {!isDragActive && (
                 <>
                   <Icons.Plus className="w-4 h-4 absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5" />
                   <Icons.Play className="w-4 h-4 absolute -bottom-1 -left-1 bg-purple-500 text-white rounded-full p-0.5 fill-current" />
                 </>
               )}
            </div>
          )}
        </div>
        
        {/* Main Text */}
        <h3 className={`text-2xl font-bold transition-colors ${isDragActive ? 'text-blue-600' : 'text-gray-900'}`}>
            {isUploading ? 'Processing Assets...' : (isDragActive ? 'Drop files now!' : 'Upload Media')}
        </h3>
        
        <p className="text-gray-500 mt-3 mb-8 text-sm leading-relaxed max-w-xs">
          {isUploading 
            ? 'We are generating thumbnails and preparing your files for analysis.' 
            : 'Drag & drop your images or videos here, or click to browse your computer.'}
        </p>

        {/* Buttons (Hidden on drag) */}
        {!isUploading && (
           <div className={`transition-all duration-300 ${isDragActive ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <Button variant="secondary" className="shadow-sm border-gray-200 hover:border-blue-300 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onUpload(); }}>
                <Icons.Upload className="w-4 h-4 mr-2"/> Select Files
              </Button>
           </div>
        )}

        {/* Supported Tags */}
        <div className={`mt-10 transition-all duration-500 delay-75 ${isDragActive ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Supported Formats</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUPPORTED_TYPES.map((type) => (
              <span 
                key={type.ext} 
                className={`px-2 py-1 rounded-md text-[10px] font-bold border ${type.color} select-none transition-transform hover:scale-105`}
              >
                {type.ext}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
