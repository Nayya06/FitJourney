import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useFitnessData } from './hooks/useFitnessData';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { LayoutDashboard, ListVideo, Settings as SettingsIcon, Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'settings'>('dashboard');
  
  const { state, setThemeColor, addVideo, deleteVideo, savePlan, setActivePlan, updateDayRecord, toggleTask } = useFitnessData();

  useEffect(() => {
    // 初始化检查 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 监听登录状态变化
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-theme-500" />
      </div>
    );
  }

  // 核心：如果没有登录，展示登录组件
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-theme-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="font-semibold text-xl">FitJourney</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-theme-600' : 'text-gray-500'}>Dashboard</button>
            <button onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'text-theme-600' : 'text-gray-500'}>Library</button>
            <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-theme-600' : 'text-gray-500'}>Settings</button>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">{session.user.email}</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard state={state} onSavePlan={savePlan} onSetActivePlan={setActivePlan} onUpdateDayRecord={updateDayRecord} onToggleTask={toggleTask} />}
        {activeTab === 'library' && <Library videos={state.videos} onAddVideo={addVideo} onDeleteVideo={deleteVideo} />}
        {activeTab === 'settings' && <Settings themeColor={state.themeColor} onColorChange={setThemeColor} />}
      </main>
    </div>
  );
}
