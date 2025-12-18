
import React, { useState, useEffect } from 'react';
import { Icons } from './components/ui/Icons';
import { Button } from './components/ui/Button';
import { Header, AppView } from './components/layout/Header';
import { AssetList } from './components/assets/AssetList';
import { ConfigPanel } from './components/config/ConfigPanel';
import { MetadataEditor } from './components/editor/MetadataEditor';
import { HistoryView } from './components/history/HistoryView';
import { ProfileView, ProfileTab } from './components/profile/ProfileView';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ExportModal } from './components/modals/ExportModal'; 
import { useSettings } from './hooks/useSettings';
import { useBatchProcessor } from './hooks/useBatchProcessor';
import { supabase } from './services/supabase';
import { userService } from './services/userService';
import { UserProfile } from './types/index';
import { getRemainingCredits } from './services/creditService';

// Import Exporters
import { generateStandardCSV } from './services/export/standardExporter';
import { generateAdobeCSV } from './services/export/adobeExporter';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, title, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showExportModal, setShowExportModal] = useState(false);

  // Mobile Menu States
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // --- Auth & Session Management ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
          userService.ensureUserProfile(session.user).then(setUserProfile);
      }
      setIsAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          setShowAuthModal(false);
          userService.ensureUserProfile(session.user).then(setUserProfile);
      } else {
          setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
      addToast("Login Failed", "Could not connect to Google Login.", 'error');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    handleNavigate('metadata');
    addToast("Signed Out", "You have been signed out successfully.", 'info');
  };

  const openAuth = (view: 'login' | 'register') => {
      setAuthView(view);
      setShowAuthModal(true);
  };

  // --- Navigation & Routing ---
  const [currentView, setCurrentView] = useState<AppView>('metadata');
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('overview');

  // URL Hash Router
  useEffect(() => {
      const handleHashChange = () => {
          const hash = window.location.hash.slice(1);
          if (hash === 'history') setCurrentView('history');
          else if (hash === 'profile') {
              setCurrentView('profile');
              setActiveProfileTab('overview');
          }
          else if (hash === 'api-keys' || hash === 'settings') {
              setCurrentView('profile');
              setActiveProfileTab('api');
          }
          else if (hash === 'preferences') {
              setCurrentView('profile');
              setActiveProfileTab('preferences');
          }
          else {
              setCurrentView('metadata');
          }
      };
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: AppView, subPath?: string) => {
      let hash = '';
      if (view === 'metadata') hash = ''; 
      else if (view === 'profile') {
          if (subPath === 'api') hash = 'api-keys';
          else if (subPath === 'preferences') hash = 'preferences';
          else hash = 'profile';
      }
      else hash = view;
      window.location.hash = hash;
  };

  const handleProfileTabChange = (tab: ProfileTab) => {
      if (tab === 'api') window.location.hash = 'api-keys';
      else if (tab === 'preferences') window.location.hash = 'preferences';
      else window.location.hash = 'profile';
  };

  const { 
    keys, setKeys, 
    activeProvider, setActiveProvider, 
    activeModelId, setActiveModelId, 
    customization, setCustomization,
    activeModel,
    autoSwitch, setAutoSwitch,
    autoModelSwitch, setAutoModelSwitch,
    selectedKeyIndices, setSelectedKeyIndices
  } = useSettings();

  const {
    items, selectedId, setSelectedId, isProcessing, isUploading,
    addFiles, removeItem, clearAll, updateMetadata, captureSnapshot,
    startQueue, stopQueue, regenerateSingle, undo, redo
  } = useBatchProcessor(
      activeProvider, 
      activeModelId, 
      keys, 
      customization,
      autoSwitch[activeProvider],
      selectedKeyIndices[activeProvider],
      autoModelSwitch[activeProvider],
      (title, msg, type) => addToast(title, msg, type),
      userProfile,
      setUserProfile
  );

  const selectedItem = items.find(i => i.id === selectedId);
  const hasGeneratedMetadata = items.some(i => i.status === 'completed');

  // Credit Calculation
  const pendingItemsCount = items.filter(i => i.status === 'idle' || i.status === 'error').length;
  const isPremium = userProfile?.role === 'premium';
  const availableCredits = userProfile ? getRemainingCredits(userProfile) : 0;
  const queueCost = pendingItemsCount;
  const canAfford = isPremium || availableCredits >= queueCost;

  const handleExport = (platformId: string) => {
    try {
        if (platformId === 'generic') {
            generateStandardCSV(items, customization);
            addToast("Export Success", "Standard CSV file has been generated.", 'success');
        } else if (platformId === 'adobe') {
            generateAdobeCSV(items, customization);
            addToast("Export Success", "Adobe Stock CSV file has been generated.", 'success');
        } else {
             addToast("Not Available", "This platform export is coming soon.", 'info');
        }
    } catch (e) {
        console.error(e);
        addToast("Export Failed", "An error occurred while generating the CSV.", 'error');
    }
  };

  const handleQueueStart = () => {
    if (!session) { openAuth('register'); return; }
    const hasKeys = keys[activeProvider].length > 0;
    if (!hasKeys) {
        handleNavigate('profile', 'api');
        addToast("Missing API Key", `Please configure your ${activeProvider} API key.`, 'warning');
        return;
    }
    startQueue();
  };

  const renderContent = () => {
    switch (currentView) {
        case 'history':
            return <HistoryView />;
        case 'profile':
            return (
                <ProfileView 
                    user={session?.user} 
                    profile={userProfile} 
                    onSignOut={handleSignOut}
                    activeTab={activeProfileTab}
                    onTabChange={handleProfileTabChange}
                    keys={keys} setKeys={setKeys}
                    activeProvider={activeProvider} setActiveProvider={setActiveProvider}
                    activeModelId={activeModelId} setActiveModelId={setActiveModelId}
                    autoSwitch={autoSwitch} setAutoSwitch={setAutoSwitch}
                    autoModelSwitch={autoModelSwitch} setAutoModelSwitch={setAutoModelSwitch}
                    selectedKeyIndices={selectedKeyIndices} setSelectedKeyIndices={setSelectedKeyIndices}
                />
            );
        case 'metadata':
        default:
            const hasActiveKey = keys[activeProvider].length > 0;
            return (
                <div className="flex-1 flex overflow-hidden animate-fade-in-up">
                    {isUploading && <LoadingOverlay />}

                    {/* 1. LEFT NAVIGATOR (Assets) */}
                    <div className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col shrink-0 hidden lg:flex transition-all duration-300`}>
                        <div className={`h-12 flex items-center border-b border-gray-100 bg-gray-50/30 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
                            {!isSidebarCollapsed && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigator</span>}
                            <button 
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                                className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500"
                                title={isSidebarCollapsed ? "Expand Navigator" : "Collapse Navigator"}
                            >
                                {isSidebarCollapsed ? <Icons.ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <Icons.Menu className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <AssetList 
                                items={items} 
                                selectedId={selectedId} 
                                onSelect={setSelectedId} 
                                onRemove={removeItem}
                                onAdd={addFiles}
                                isUploading={isUploading}
                                isCollapsed={isSidebarCollapsed}
                            />
                        </div>
                        <div className={`p-4 border-t border-gray-100 bg-white ${isSidebarCollapsed ? 'px-2' : ''}`}>
                            {!session ? (
                                <Button className={`w-full h-10 text-xs bg-gray-900 text-white ${isSidebarCollapsed ? 'px-0' : ''}`} onClick={() => openAuth('register')}>
                                    {isSidebarCollapsed ? <Icons.Lock className="w-3.5 h-3.5" /> : <><Icons.Lock className="w-3.5 h-3.5 mr-2" /> Login to Start</>}
                                </Button>
                            ) : !hasActiveKey ? (
                                <Button className={`w-full h-10 text-xs bg-orange-500 hover:bg-orange-600 text-white ${isSidebarCollapsed ? 'px-0' : ''}`} onClick={() => handleNavigate('profile', 'api')}>
                                     {isSidebarCollapsed ? <Icons.Key className="w-3.5 h-3.5" /> : <><Icons.Key className="w-3.5 h-3.5 mr-2" /> Connect API</>}
                                </Button>
                            ) : !isProcessing ? (
                                <Button 
                                    className={`w-full h-10 text-xs shadow-lg bg-gray-900 hover:bg-black text-white ${isSidebarCollapsed ? 'px-0' : ''}`}
                                    onClick={handleQueueStart}
                                    disabled={items.length === 0 || isUploading || !canAfford}
                                    title="Start Generation"
                                >
                                    {isSidebarCollapsed ? (
                                        <div className="relative">
                                            <Icons.Play className="w-3.5 h-3.5 fill-current" />
                                            {pendingItemsCount > 0 && <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full" />}
                                        </div>
                                    ) : (
                                        <><Icons.Play className="w-3.5 h-3.5 mr-2 fill-current" /> Generate ({pendingItemsCount})</>
                                    )}
                                </Button>
                            ) : (
                                <Button className={`w-full h-10 text-xs ${isSidebarCollapsed ? 'px-0' : ''}`} variant="danger" onClick={stopQueue}>
                                    {isSidebarCollapsed ? <Icons.Loader className="w-3.5 h-3.5 animate-spin" /> : <><Icons.Loader className="w-3.5 h-3.5 mr-2 animate-spin" /> Stop</>}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* 2. CENTER WORKSPACE (Editor) */}
                    <main className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden relative">
                        {/* Editor Header / Context */}
                        <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                   <Icons.Terminal className="w-3 h-3" /> Workspace
                                </div>
                                <span className="text-xs font-medium text-gray-400">/</span>
                                <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{selectedItem?.file.name || "No selection"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    onClick={() => setShowExportModal(true)} 
                                    disabled={!hasGeneratedMetadata}
                                    className="h-8 text-xs bg-white shadow-sm border-gray-200"
                                >
                                    <Icons.Share2 className="w-3.5 h-3.5 mr-1.5" /> Export All
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                             <MetadataEditor 
                                item={selectedItem}
                                customization={customization}
                                onUpdate={updateMetadata}
                                onSnapshot={captureSnapshot}
                                onRegenerate={regenerateSingle}
                                onUndo={undo}
                                onRedo={redo}
                                isProcessing={isProcessing}
                                isLoggedIn={!!session}
                                userProfile={userProfile}
                                onUploadClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                onFilesAdded={addFiles}
                            />
                        </div>
                    </main>

                    {/* 3. RIGHT SIDEBAR (Intelligence/Config) */}
                    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 hidden xl:flex">
                        <div className="h-12 flex items-center px-5 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-2">
                                <Icons.Zap className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Intelligence Config</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                             <ConfigPanel 
                                customization={customization} 
                                setCustomization={setCustomization} 
                                activeModel={activeModel}
                                disabled={isProcessing}
                            />
                        </div>
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 font-medium">Model: {activeModel?.name || "None"}</p>
                        </div>
                    </aside>
                </div>
            );
    }
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <Icons.Loader className="w-8 h-8 text-gray-900 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Initializing workspace...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col font-sans text-gray-900 bg-gray-50 overflow-hidden">
      <Header 
        activeProvider={activeProvider}
        hasKeys={keys[activeProvider].length > 0}
        currentView={currentView}
        onNavigate={handleNavigate}
        hasItems={items.length > 0}
        isProcessing={isProcessing}
        user={session?.user}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        onSignIn={() => openAuth('login')}
        onSignUp={() => openAuth('register')}
      />
      {renderContent()}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} onExport={handleExport} />}
      {(!session && showAuthModal) && (
          <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="w-full max-w-md relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform animate-fade-in-up">
                 <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-gray-900"><Icons.X className="w-4 h-4" /></button>
                 {authView === 'login' ? <LoginPage onLogin={handleLogin} onNavigate={() => setAuthView('register')} /> : <RegisterPage onLogin={handleLogin} onNavigate={() => setAuthView('login')} />}
             </div>
          </div>
       )}
    </div>
  );
}
