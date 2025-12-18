import React from 'react';
import { Icons } from './Icons';

export const Chip: React.FC<{ label: string; onRemove: () => void; onCopy: () => void }> = ({ label, onRemove, onCopy }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all max-w-full group">
    <span onClick={onCopy} className="cursor-pointer select-all truncate max-w-[150px]" title={label}>{label}</span>
    <button onClick={onRemove} className="text-gray-400 hover:text-red-500 focus:outline-none flex items-center justify-center shrink-0 opacity-50 group-hover:opacity-100">
      <Icons.X className="w-3 h-3" />
    </button>
  </span>
);