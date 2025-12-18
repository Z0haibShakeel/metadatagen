
import React from 'react';
import { Icons } from '../ui/Icons';

export const HistoryView = () => {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8 animate-fade-in-up">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">History Coming Soon</h2>
            <p className="text-gray-500 text-sm mb-6">
                We are building a comprehensive history log where you can review, export, and manage your previously generated metadata batches.
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                Feature In Development
            </div>
        </div>
    </div>
  );
};