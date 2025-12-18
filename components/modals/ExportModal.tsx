
import React from 'react';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

interface ExportModalProps {
  onClose: () => void;
  onExport: (platformId: string) => void;
}

interface Platform {
  id: string;
  name: string;
  status: 'ready' | 'upcoming';
  desc: string;
}

const PLATFORMS: Platform[] = [
  { id: 'generic', name: 'Standard CSV', status: 'ready', desc: 'Universal format for general use' },
  { id: 'adobe', name: 'Adobe Stock', status: 'ready', desc: 'Optimized for Adobe Stock' },
  { id: 'freepik', name: 'Freepik', status: 'upcoming', desc: 'Optimized for Freepik' },
  { id: 'vecteezy', name: 'Vecteezy', status: 'upcoming', desc: 'Optimized for Vecteezy' },
  { id: 'shutterstock', name: 'Shutterstock', status: 'upcoming', desc: 'Optimized for Shutterstock' },
  { id: 'istock', name: 'iStock (Getty)', status: 'upcoming', desc: 'Optimized for ESP/iStock' },
  { id: '123rf', name: '123RF', status: 'upcoming', desc: 'Optimized for 123RF' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm animate-fade-in duration-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Metadata</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a target platform for your CSV file.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/30 max-h-[60vh] overflow-y-auto">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              disabled={p.status === 'upcoming'}
              onClick={() => {
                onExport(p.id);
                onClose();
              }}
              className={`
                relative flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200 group
                ${p.status === 'ready' 
                  ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer' 
                  : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-sm
                ${p.status === 'ready' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}
              `}>
                {p.id === 'generic' ? <Icons.FileText className="w-5 h-5" /> : <Icons.Globe className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <h3 className={`text-sm font-bold ${p.status === 'ready' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {p.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                  {p.desc}
                </p>
              </div>

              {p.status === 'upcoming' && (
                <div className="absolute top-3 right-3 px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-wider rounded border border-gray-200">
                  Soon
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
           <Button variant="secondary" onClick={onClose} size="sm">
             Cancel
           </Button>
        </div>
      </div>
    </div>
  );
};
