import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useFitnessData } from './hooks/useFitnessData';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { LayoutDashboard, ListVideo, Settings as SettingsIcon, User, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'settings'>('dashboard');
  
  const { state, setThemeColor, addVideo, deleteVideo, savePlan, setActivePlan, updateDayRecord, toggleTask } = useFitnessData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 挂载主题色
  useEffect(() => {
    const color = state.themeColor || '#10b981';
    document.documentElement.style.setProperty('--theme-color', color);
  }, [state.themeColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-theme-500" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 md:pb-0">
      
      {/* 桌面端顶部导航栏 */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 修复：使用 bg-theme-500 */}
            <div className="h-8 w-8 bg-theme-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold text-gray-900">FitJourney</span>
          </div>
          <nav className="flex space-x-2">
            {/* 修复：选中时使用 text-theme-600 */}
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-theme-600 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
              <LayoutDashboard className="w-5 h-5"/> Dashboard
            </button>
            <button onClick={() => setActiveTab('library')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'library' ? 'text-theme-600 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
              <ListVideo className="w-5 h-5"/> Library
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-theme-600 font-medium bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
              <SettingsIcon className="w-5 h-5"/> Settings
            </button>
          </nav>
        </div>
      </header>

      {/* 手机端顶部 Logo */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-center shadow-sm">
        <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {/* 修复：使用 bg-theme-500 */}
          <span className="h-6 w-6 bg-theme-500 rounded flex items-center justify-center text-white text-xs">F</span>
          FitJourney
        </span>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard state={state} onSavePlan={savePlan} onSetActivePlan={setActivePlan} onUpdateDayRecord={updateDayRecord} onToggleTask={toggleTask} />
          </div>
        )}
        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Library videos={state.videos} onAddVideo={addVideo} onDeleteVideo={deleteVideo} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto space-y-6">
            <Settings themeColor={state.themeColor} onColorChange={setThemeColor} />
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-theme-600 bg-gray-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current User</p>
                    <p className="font-medium text-gray-900">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-medium shadow-sm"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 手机端底部导航栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-6 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {/* 修复：使用 text-theme-600 */}
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'text-theme-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'library' ? 'text-theme-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <ListVideo className="w-6 h-6" />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'text-theme-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
      
    </div>
  );
}
