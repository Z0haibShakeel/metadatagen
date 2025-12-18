import React from 'react';
import { Icons } from '../ui/Icons';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-white relative overflow-hidden font-sans text-gray-900 p-8 sm:p-10">
      
      {/* Background Decor - Optional for modal, keeping simple */}
      <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10 mb-6">
            <Icons.Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card Content */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} MetadataGen. All rights reserved.
        </p>
      </div>
    </div>
  );
};