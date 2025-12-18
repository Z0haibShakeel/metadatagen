

import React from 'react';
import { UserProfile, Provider } from '../../types/index';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { APIKeyManager } from '../settings/APIKeyManager';
import { ModelSelector } from '../settings/ModelSelector';
import { ProviderSelector } from '../settings/ProviderSelector';
import { getRemainingCredits, getEffectiveCreditsUsed, DAILY_FREE_CREDITS } from '../../services/creditService';

export type ProfileTab = 'overview' | 'api' | 'preferences';

interface ProfileViewProps {
  user: any;
  profile: UserProfile | null;
  onSignOut: () => void;
  // Routing Props
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  // Settings Props
  keys: { groq: string[]; gemini: string[]; openai: string[] };
  setKeys: (keys: { groq: string[]; gemini: string[]; openai: string[] }) => void;
  activeProvider: Provider;
  setActiveProvider: (p: Provider) => void;
  activeModelId: string;
  setActiveModelId: (m: string) => void;
  autoSwitch: Record<Provider, boolean>;
  setAutoSwitch: (v: Record<Provider, boolean>) => void;
  autoModelSwitch: Record<Provider, boolean>;
  setAutoModelSwitch: (v: Record<Provider, boolean>) => void;
  selectedKeyIndices: Record<Provider, number>;
  setSelectedKeyIndices: (v: Record<Provider, number>) => void;
}

const providersInfo: { id: Provider; name: string; url: string }[] = [
    { id: 'groq', name: 'Groq', url: 'https://console.groq.com/keys' },
    { id: 'gemini', name: 'Gemini', url: 'https://aistudio.google.com/app/apikey' },
    { id: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    user, profile, onSignOut, activeTab, onTabChange,
    keys, setKeys, activeProvider, setActiveProvider, activeModelId, setActiveModelId,
    autoSwitch, setAutoSwitch, autoModelSwitch, setAutoModelSwitch, selectedKeyIndices, setSelectedKeyIndices
}) => {
  
  const isPremium = profile?.role === 'premium';
  const roleName = isPremium ? 'Pro Member' : 'Free Member';
  const currentProviderInfo = providersInfo.find(p => p.id === activeProvider);
  
  const remainingCredits = profile ? getRemainingCredits(profile) : 0;
  const usedCredits = profile ? getEffectiveCreditsUsed(profile) : 0;
  const creditPercent = isPremium ? 100 : Math.min(100, Math.max(0, (remainingCredits / DAILY_FREE_CREDITS) * 100));


  const TabButton = ({ id, label, icon: Icon }: { id: ProfileTab, label: string, icon: any }) => (
      <button
        onClick={() => onTabChange(id)}
        className={`flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all relative ${
            activeTab === id 
            ? 'text-gray-900' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
        }`}
      >
          <Icon className={`w-4 h-4 ${activeTab === id ? 'text-gray-900' : 'text-gray-400'}`} />
          {label}
          {activeTab === id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
          )}
      </button>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto animate-fade-in-up">
      {/* Header Profile Section */}
      <div className="pt-12 pb-2 px-8 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto">
             <div className="flex flex-col md:flex-row items-start md:items-end gap-8 mb-10">
                
                {/* Avatar */}
                <div className="relative group">
                    <div className={`w-24 h-24 rounded-full p-1 bg-white border shadow-md ${isPremium ? 'border-amber-200' : 'border-gray-100'}`}>
                        <img 
                            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} 
                            className="w-full h-full rounded-full object-cover"
                            alt="Profile" 
                        />
                    </div>
                    {isPremium && (
                        <div className="absolute top-0 right-0 z-10 translate-x-1 -translate-y-1">
                            <div className="relative flex items-center justify-center w-8 h-8">
                                <div className="absolute inset-0 bg-white rounded-full shadow-md"></div>
                                <div className="absolute inset-1 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                                    <Icons.Crown className="w-3.5 h-3.5 text-white fill-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Name & Plan Info */}
                <div className="flex-1 mb-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profile?.full_name || user.email}</h1>
                        <Icons.BadgeCheck className={`w-6 h-6 ${isPremium ? 'text-amber-500 fill-amber-50' : 'text-gray-300'}`} />
                        
                        {/* Desktop Tag */}
                        <span className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ml-2 ${
                            isPremium 
                            ? 'bg-gray-900 text-amber-400 border-gray-900' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                            {roleName}
                        </span>
                    </div>
                    <p className="text-gray-500 text-base font-medium">{user.email}</p>
                </div>

                {/* Status Badge for Mobile / Alternate Desktop */}
                <div className="mb-2 block md:hidden">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${isPremium ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {isPremium ? <Icons.Crown className="w-3 h-3 fill-amber-500 text-amber-500" /> : <Icons.User className="w-3 h-3" />}
                        {roleName}
                     </span>
                </div>
            </div>
            
            <div className="flex gap-4">
                <TabButton id="overview" label="Overview" icon={Icons.Layout} />
                <TabButton id="api" label="API Configuration" icon={Icons.Key} />
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                 
                 {/* LEFT COLUMN (Main Content) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Membership Card - Premium Refined */}
                    <div className={`relative rounded-xl overflow-hidden shadow-xl transition-all ${
                        isPremium 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                        {/* Premium Decorations */}
                        {isPremium && (
                            <>
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-gray-800/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none"></div>
                                {/* Gold Accent Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-700"></div>
                            </>
                        )}

                        <div className="relative p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className={`text-xs font-bold uppercase tracking-widest ${isPremium ? 'text-amber-500' : 'text-gray-500'}`}>Current Plan</h3>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                                        {isPremium ? (
                                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">Pro Member</span>
                                        ) : (
                                            "Free Member"
                                        )}
                                    </h2>
                                    <p className={`text-sm max-w-md leading-relaxed ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {isPremium 
                                            ? "Enterprise-grade features unlocked. You have priority access to all tools and unlimited generations." 
                                            : "Standard access features active. Upgrade to unlock unlimited generations."}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                                    isPremium 
                                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-amber-400 shadow-black/50' 
                                    : 'bg-gray-50 border-gray-100 text-gray-400'
                                }`}>
                                    {isPremium ? <Icons.Crown className="w-7 h-7 fill-amber-400/20" /> : <Icons.User className="w-7 h-7" />}
                                </div>
                            </div>
                            
                            {/* Credits Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>Daily Credits</span>
                                    <span className={`text-sm font-mono ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                                        {isPremium ? 'Unlimited' : `${remainingCredits}/${DAILY_FREE_CREDITS}`}
                                    </span>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${isPremium ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div 
                                        className={`h-full transition-all duration-500 ${isPremium ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-blue-600'}`} 
                                        style={{ width: `${creditPercent}%` }}
                                    />
                                </div>
                                {!isPremium && (
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Credits reset daily at 00:00 UTC. Upgrade for unlimited access.
                                    </p>
                                )}
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {[
                                    { label: "Unlimited Batch Size", active: isPremium },
                                    { label: "GPT-4o & High-Tier Models", active: isPremium },
                                    { label: "Priority Queue Access", active: isPremium },
                                    { label: "Custom Export Formats", active: true },
                                    { label: "Metadata Customization", active: true },
                                    { label: "History & Analytics", active: false }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                            feature.active 
                                            ? (isPremium ? 'bg-amber-500 border-amber-500 text-gray-900' : 'bg-green-500 border-green-500 text-white') 
                                            : (isPremium ? 'bg-gray-800 border-gray-700 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-300')
                                        }`}>
                                            {feature.active ? <Icons.Check className="w-2.5 h-2.5 stroke-[3px]" /> : <Icons.Lock className="w-2.5 h-2.5" />}
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            isPremium 
                                            ? (feature.active ? 'text-gray-200' : 'text-gray-600') 
                                            : (feature.active ? 'text-gray-700' : 'text-gray-400')
                                        }`}>
                                            {feature.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {!isPremium && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <Button className="w-full sm:w-auto bg-gray-900 text-white shadow-lg shadow-gray-900/10 hover:bg-black transition-colors">
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Sidebar) */}
                <div className="space-y-6">
                    {/* Account Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                        <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Icons.User className="w-4 h-4 text-gray-400" />
                            Account Details
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">User ID</label>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 break-all">
                                    {user.id}
                                </div>
                            </div>
                             <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email Address</label>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Icons.Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <Button variant="danger" className="w-full bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200" onClick={onSignOut}>
                                 <Icons.LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        )}

        {/* API CONFIG TAB */}
        {activeTab === 'api' && (
            <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-320px)] min-h-[500px] animate-in slide-in-from-bottom-2 duration-300">
                {/* Provider List */}
                <div className="w-full md:w-72 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shrink-0 h-full shadow-sm">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Provider</h3>
                    </div>
                    <div className="p-3 space-y-1">
                        <ProviderSelector 
                            activeProvider={activeProvider}
                            setActiveProvider={setActiveProvider}
                            setActiveModelId={setActiveModelId}
                            keys={keys}
                        />
                    </div>
                </div>

                {/* Config Area */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-8 overflow-y-auto shadow-sm">
                    <div className="max-w-3xl mx-auto space-y-10">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl shadow-gray-900/10 ring-4 ring-gray-50">
                                    {activeProvider === 'openai' ? <Icons.Bot className="w-7 h-7"/> : activeProvider === 'gemini' ? <Icons.Sparkles className="w-7 h-7"/> : <Icons.Cpu className="w-7 h-7"/>}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">{activeProvider} Settings</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage connection strings and model preferences.</p>
                                </div>
                            </div>
                            <a href={currentProviderInfo?.url} target="_blank" rel="noopener noreferrer" className="hidden sm:flex group text-xs font-semibold text-blue-600 hover:text-blue-700 items-center gap-2 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg transition-all">
                                Get API Key <Icons.ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>

                        <div className="space-y-10">
                            {/* API Keys Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <h3 className="font-bold text-gray-900 text-sm">API Keys</h3>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-6">
                                    {providersInfo.map(p => (
                                        <APIKeyManager 
                                            key={p.id}
                                            provider={p.id}
                                            providerName={p.name}
                                            providerUrl={p.url}
                                            isActive={activeProvider === p.id}
                                            keys={keys[p.id]}
                                            setKeys={(k) => setKeys({...keys, [p.id]: k})}
                                            autoSwitch={autoSwitch[p.id]}
                                            setAutoSwitch={(val) => setAutoSwitch({...autoSwitch, [p.id]: val})}
                                            selectedIndex={selectedKeyIndices[p.id]}
                                            setSelectedIndex={(val) => setSelectedKeyIndices({...selectedKeyIndices, [p.id]: val})}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Models Section */}
                             <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <h3 className="font-bold text-gray-900 text-sm">Default Model</h3>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <ModelSelector 
                                    activeProvider={activeProvider}
                                    activeModelId={activeModelId}
                                    setActiveModelId={setActiveModelId}
                                    autoModelSwitch={autoModelSwitch[activeProvider]}
                                    setAutoModelSwitch={(val) => setAutoModelSwitch({...autoModelSwitch, [activeProvider]: val})}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};