import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { Home, BookOpen, Settings as SettingsIcon, User, LogOut } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 如果没登录，显示你刚才做好的验证码登录页
  if (!session) {
    return <Auth />;
  }

  // 登录后的主界面
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0"> 
      {/* --- 桌面端顶部导航栏 (手机端隐藏) --- */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold text-gray-900">FitJourney</span>
          </div>
          <nav className="flex space-x-2">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Home className="w-5 h-5"/> Dashboard
            </button>
            <button onClick={() => setActiveTab('library')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'library' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <BookOpen className="w-5 h-5"/> Library
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              <SettingsIcon className="w-5 h-5"/> Settings
            </button>
          </nav>
        </div>
      </header>

      {/* --- 手机端顶部 Logo (仅展示，无按钮) --- */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-center shadow-sm">
        <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="h-6 w-6 bg-emerald-500 rounded flex items-center justify-center text-white text-xs">F</span>
          FitJourney
        </span>
      </header>

      {/* --- 主内容区域 --- */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Dashboard 页面 */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500">这里是你的健身数据面板...</p>
              {/* 这里可以放你之前的 Dashboard 组件内容 */}
            </div>
          </div>
        )}

        {/* Library 页面 */}
        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Library</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500">这里是你的动作库和训练计划...</p>
            </div>
          </div>
        )}

        {/* Settings 页面 (包含个人信息和退出登录) */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
            
            {/* 账号信息卡片 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current User</p>
                  <p className="font-medium text-gray-900">{session.user.email}</p>
                </div>
              </div>
            </div>

            {/* 退出登录按钮 */}
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all font-medium shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </main>

      {/* --- 手机端底部导航栏 (桌面端隐藏) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-6 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <Home className={`w-6 h-6 ${activeTab === 'dashboard' ? 'fill-emerald-100' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'library' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
          <BookOpen className={`w-6 h-6 ${activeTab === 'library' ? 'fill-emerald-100' : ''}`} />
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
