import React from 'react';
import { Icons } from './Icons';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-wait">
      
      {/* Minimal Card - Editor Style */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100/50 p-8 w-[320px] flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative w-14 h-14 mb-6 flex items-center justify-center">
             {/* Static Ring */}
             <div className="absolute inset-0 border-[3px] border-gray-100 rounded-full"></div>
             {/* Spinning Arc */}
             <div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent border-l-transparent rounded-full animate-spin"></div>
             
             {/* Center Icon */}
             <Icons.Image className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-1.5 mb-6">
           <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Importing Media</h3>
           <p className="text-xs text-gray-500 font-medium px-4 leading-relaxed">
             Optimizing thumbnails and preparing workspace...
           </p>
        </div>

        {/* Indeterminate Progress Bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden relative">
           <div className="absolute inset-y-0 left-0 w-[30%] bg-gray-900 rounded-full animate-indeterminate"></div>
        </div>

        {/* Status Text Footer */}
        <div className="mt-3 w-full flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
           <span>Processing</span>
           <span>Please Wait</span>
        </div>

      </div>
    </div>
  );
};