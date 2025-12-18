

import React, { useState, useRef, useEffect } from 'react';
import { Provider, UserProfile } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { getRemainingCredits, DAILY_FREE_CREDITS } from '../../services/creditService';

export type AppView = 'metadata' | 'settings' | 'history' | 'profile';

interface HeaderProps {
  activeProvider: Provider;
  hasKeys: boolean;
  currentView: AppView;
  onNavigate: (view: AppView, subPath?: string) => void;
  hasItems: boolean;
  isProcessing: boolean;
  user?: any;
  userProfile: UserProfile | null; // Added prop
  onSignOut?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeProvider, hasKeys, currentView, onNavigate, isProcessing, user, userProfile, onSignOut, onSignIn, onSignUp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('button[aria-label="Toggle Menu"]')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavItem = ({ view, label, icon: Icon, isMobile = false }: { view: AppView; label: string; icon: any, isMobile?: boolean }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => {
                if (!isProcessing) {
                    onNavigate(view);
                    if (isMobile) setMobileMenuOpen(false);
                }
            }}
            disabled={isProcessing}
            className={`
                group flex items-center gap-2 transition-all duration-200
                ${isMobile 
                    ? 'w-full px-4 py-3 text-sm font-medium border-l-2' 
                    : 'relative px-4 py-2 text-xs font-semibold rounded-full' 
                }
                ${isActive 
                    ? (isMobile ? 'bg-gray-50 border-gray-900 text-gray-900' : 'text-white bg-gray-900') 
                    : (isMobile ? 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                }
            `}
        >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
            <span>{label}</span>
        </button>
    );
  };

  // Determine Plan Name based on profile role
  const isPremium = userProfile?.role === 'premium';
  const userPlan = isPremium ? 'Pro Member' : 'Free Member';
  
  // Calculate Credits
  const creditsRemaining = userProfile ? getRemainingCredits(userProfile) : 0;
  const creditDisplay = isPremium ? '∞' : `${creditsRemaining}/${DAILY_FREE_CREDITS}`;

  return (
    <>
        <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-[50] transition-all">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                
                {/* --- LEFT: Branding & Status --- */}
                <div className="flex items-center gap-5">
                    {/* Logo Area */}
                    <button 
                        onClick={() => onNavigate('metadata')}
                        className="flex items-center gap-3 group focus:outline-none"
                    >
                        <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/10 transition-transform group-hover:scale-105">
                            <Icons.Sparkles className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-sm font-bold text-gray-900 tracking-tight">MetadataGen</span>
                            <span className="text-[10px] text-gray-400 font-medium">AI Editor Workspace</span>
                        </div>
                    </button>

                    {/* Desktop Divider */}
                    <div className="h-6 w-px bg-gray-200 hidden md:block" />

                    {/* API Status Indicator (Desktop) */}
                    <div 
                        className="hidden md:flex items-center gap-2 cursor-help group relative"
                        title={`Using ${activeProvider} API`}
                    >
                        <div className={`w-2 h-2 rounded-full ${hasKeys ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-orange-500 animate-pulse'}`} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-800 transition-colors">
                            {activeProvider}
                        </span>
                    </div>
                </div>

                {/* --- CENTER: Navigation (Desktop) --- */}
                <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm"> {/* Changed rounded-xl to rounded-full */}
                        <NavItem view="metadata" label="Metadata" icon={Icons.Image} />
                        <NavItem view="history" label="History" icon={Icons.Clock} />
                    </div>
                </nav>

                {/* --- RIGHT: Actions & Profile --- */}
                <div className="flex items-center gap-3">
                    
                    {/* Credit Display */}
                    {user && userProfile && (
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                            isPremium ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}>
                            <Icons.Zap className={`w-3.5 h-3.5 ${isPremium ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">{creditDisplay} <span className="font-medium opacity-70">Credits</span></span>
                        </div>
                    )}

                    {/* User Profile / Auth */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={`flex items-center gap-3 p-1 rounded-full border transition-all duration-300 ${
                                    profileOpen 
                                        ? 'bg-gray-50 border-gray-300 ring-2 ring-gray-100' 
                                        : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {/* User Avatar */}
                                <div className="relative">
                                    <img 
                                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                                        className={`w-8 h-8 rounded-full shadow-sm object-cover transition-all ${
                                            isPremium 
                                                ? 'ring-2 ring-amber-500/30 ring-offset-1 ring-offset-white grayscale-[0.1]' 
                                                : 'border border-gray-200 ring-0'
                                        }`} 
                                        alt="User"
                                    />
                                    {isPremium && (
                                        <div className="absolute -top-1 -right-1 z-10">
                                            <div className="relative flex items-center justify-center w-3.5 h-3.5">
                                                <div className="absolute inset-0 bg-white rounded-full shadow-sm"></div>
                                                <div className="absolute inset-[1.5px] bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                                                    <Icons.Crown className="w-1.5 h-1.5 text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Text Info (Desktop) */}
                                <div className="hidden lg:block text-left pr-2">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[100px]">
                                            {user.user_metadata?.full_name || 'Creator'}
                                        </p>
                                    </div>
                                    
                                    {isPremium ? (
                                         <div className="mt-1 flex">
                                            <span className="inline-flex items-center px-1.5 py-[1px] rounded-[3px] bg-gray-900 text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none border border-gray-800 shadow-sm">
                                                PRO
                                            </span>
                                         </div>
                                    ) : (
                                        <p className="text-[10px] font-medium leading-none mt-1 text-gray-500">
                                            Free Member
                                        </p>
                                    )}
                                </div>
                                <Icons.ChevronDown className={`w-3.5 h-3.5 text-gray-400 mr-1 hidden lg:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {profileOpen && (
                                <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                    <div className={`p-5 border-b border-gray-100 ${isPremium ? 'bg-gradient-to-br from-gray-50 via-white to-white' : 'bg-gray-50/50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                            {isPremium && <Icons.BadgeCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-3">{user.email}</p>
                                        <div className="flex items-center justify-between">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                isPremium ? 'bg-gray-900 text-amber-400 border-gray-900' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {userPlan}
                                            </div>
                                            {!isPremium && (
                                                <span className="text-[10px] text-gray-500">{creditDisplay} Credits</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button 
                                            onClick={() => { onNavigate('profile'); setProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors text-left font-medium"
                                        >
                                            <Icons.User className="w-4 h-4 text-gray-400" /> My Profile
                                        </button>
                                        <button 
                                            onClick={() => { onNavigate('profile', 'api'); setProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors text-left font-medium"
                                        >
                                            <div className="relative">
                                                <Icons.Key className="w-4 h-4 text-gray-400" />
                                                {!hasKeys && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />}
                                            </div>
                                            API Configuration
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-gray-50">
                                        <button 
                                            onClick={() => { onSignOut?.(); setProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors text-left font-medium"
                                        >
                                            <Icons.LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-3">
                            <button 
                                onClick={onSignIn} 
                                className="hidden sm:block text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
                            >
                                Log in
                            </button>
                            <Button 
                                onClick={onSignUp} 
                                size="sm" 
                                className="bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/20 rounded-lg px-4 h-9 text-xs"
                            >
                                Get Started
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        aria-label="Toggle Menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <Icons.X className="w-5 h-5" /> : <Icons.Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* --- Mobile Menu Drawer --- */}
            {mobileMenuOpen && (
                <div className="absolute top-[65px] left-0 w-full bg-white border-b border-gray-200 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200" ref={mobileMenuRef}>
                    <div className="p-4 space-y-4">
                        {/* Mobile Status */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Provider</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 capitalize">{activeProvider}</span>
                                <div className={`w-2 h-2 rounded-full ${hasKeys ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                             </div>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="flex flex-col space-y-1">
                            <NavItem view="metadata" label="Metadata" icon={Icons.Image} isMobile />
                            <NavItem view="history" label="History" icon={Icons.Clock} isMobile />
                        </div>

                        {/* Mobile Auth Actions (if not logged in) */}
                        {!user && (
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <Button variant="secondary" onClick={() => { onSignIn?.(); setMobileMenuOpen(false); }}>
                                    Log In
                                </Button>
                                <Button onClick={() => { onSignUp?.(); setMobileMenuOpen(false); }}>
                                    Sign Up
                                </Button>
                            </div>
                        )}
                        
                        {/* Mobile Credits */}
                        {user && userProfile && (
                            <div className="pt-2 px-1 text-xs text-gray-500 font-medium">
                                Credits Remaining: <span className="font-bold text-gray-900">{creditDisplay}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    </>
  );
};