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
  
  // 完美保留你原本的数据管理逻辑
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

  // 加载动画
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // 如果没有登录，展示验证码登录组件
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 md:pb-0">
      
      {/* --- 桌面端顶部导航栏 (手机端隐藏) --- */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold text-gray-900">FitJourney</span>
          </div>
          <nav className="flex space-x-2">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <LayoutDashboard className="w-5 h-5"/> Dashboard
            </button>
            <button onClick={() => setActiveTab('library')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <ListVideo className="w-5 h-5"/> Library
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <SettingsIcon className="w-5 h-5"/> Settings
            </button>
          </nav>
        </div>
      </header>

      {/* --- 手机端顶部 Logo (仅展示，无按钮，更加清爽) --- */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-center shadow-sm">
        <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="h-6 w-6 bg-emerald-500 rounded flex items-center justify-center text-white text-xs">F</span>
          FitJourney
        </span>
      </header>

      {/* --- 主内容区域 (你的真实内容回归) --- */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        
        {/* Dashboard 页面 */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard 
              state={state} 
              onSavePlan={savePlan} 
              onSetActivePlan={setActivePlan} 
              onUpdateDayRecord={updateDayRecord} 
              onToggleTask={toggleTask} 
            />
          </div>
        )}

        {/* Library 页面 */}
        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Library 
              videos={state.videos} 
              onAddVideo={addVideo} 
              onDeleteVideo={deleteVideo} 
            />
          </div>
        )}

        {/* Settings 页面 (原版主题设置 + 账号管理组合) */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto space-y-6">
            
            {/* 1. 你的原版设置组件 (选颜色等) */}
            <Settings themeColor={state.themeColor} onColorChange={setThemeColor} />

            {/* 2. 新加的账号信息与退出卡片 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
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

      {/* --- 手机端底部导航栏 (桌面端隐藏) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-6 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <LayoutDashboard className={`w-6 h-6 ${activeTab === 'dashboard' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'library' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <ListVideo className={`w-6 h-6 ${activeTab === 'library' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <SettingsIcon className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
      
    </div>
  );
}
