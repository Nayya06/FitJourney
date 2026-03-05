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
  const [authLoading, setAuthLoading] = useState(true);
  // 从本地缓存读取上次停留的页面，默认是 dashboard
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'settings'>(() => {
    return (localStorage.getItem('fitjourney_current_tab') as any) || 'dashboard';
  });

  // 每次切换标签页时，自动存入本地缓存
  useEffect(() => {
    localStorage.setItem('fitjourney_current_tab', activeTab);
  }, [activeTab]);
  
  const { state, isDataLoading, setThemeColor, addVideo, deleteVideo, savePlan, setActivePlan, updateDayRecord, toggleTask } = useFitnessData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const color = state.themeColor || '#10b981';
    document.documentElement.style.setProperty('--theme-color', color);
  }, [state.themeColor]);

  // 这里的逻辑修复了“空页面闪烁”问题
  if (authLoading || (session && isDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-theme-500" />
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 md:pb-0">
      {/* 桌面端导航 */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-theme-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-theme-200">F</div>
            <span className="text-xl font-bold tracking-tight">FitJourney</span>
          </div>
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'library', icon: ListVideo, label: 'Library' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-theme-600 font-semibold bg-theme-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                <tab.icon className="w-5 h-5"/> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 移动端顶部 (放大 Logo 和字体，保持高度不变) */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-center shadow-sm">
        <span className="text-xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
          {/* Logo 尺寸从 w-6 升级到 w-7，字体从 text-[10px] 升级到 text-sm */}
          <span className="h-7 w-7 bg-theme-500 rounded-[8px] flex items-center justify-center text-white text-sm font-black shadow-sm">
            F
          </span>
          FitJourney
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'dashboard' && <Dashboard state={state} onSavePlan={savePlan} onSetActivePlan={setActivePlan} onUpdateDayRecord={updateDayRecord} onToggleTask={toggleTask} />}
        {activeTab === 'library' && <Library videos={state.videos} onAddVideo={addVideo} onDeleteVideo={deleteVideo} />}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto space-y-6">
            <Settings themeColor={state.themeColor} onColorChange={setThemeColor} />
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-theme-600 bg-white shadow-sm"><User className="w-6 h-6" /></div>
                <div className="overflow-hidden"><p className="text-xs text-gray-500 uppercase font-semibold">Logged in as</p><p className="font-medium text-gray-900 truncate">{session?.user?.email}</p></div>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-bold tracking-wide">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 移动端底栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-20 px-6 z-50 pb-safe shadow-2xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'library', icon: ListVideo, label: 'Library' },
          { id: 'settings', icon: SettingsIcon, label: 'Settings' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-theme-600' : 'text-gray-400'}`}>
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-theme-50' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
