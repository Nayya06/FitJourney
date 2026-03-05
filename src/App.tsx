import React, { useState, useEffect } from 'react'; 
import { useFitnessData } from './hooks/useFitnessData';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Settings from './components/Settings';
import { LayoutDashboard, ListVideo, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'dashboard' | 'library' | 'settings';

export default function App() {
  const { state, setThemeColor, addVideo, deleteVideo, savePlan, setActivePlan, updateDayRecord, toggleTask } = useFitnessData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // 2. 新增这段代码：监听颜色变化，并将其挂载到全局的 document 上
  useEffect(() => {
    const color = state.themeColor || '#10b981'; // 默认是之前的翡翠绿
    document.documentElement.style.setProperty('--theme-color', color);
  }, [state.themeColor]);

  return (
    <div 
      className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans"
    >
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-theme-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="font-semibold text-xl tracking-tight">FitJourney</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'border-theme-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'library'
                      ? 'border-theme-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ListVideo className="w-4 h-4 mr-2" />
                  Library
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'border-theme-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation (Bottom) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'dashboard' ? 'text-theme-500' : 'text-gray-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'library' ? 'text-theme-500' : 'text-gray-500'
            }`}
          >
            <ListVideo className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'settings' ? 'text-theme-500' : 'text-gray-500'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            state={state}
            onSavePlan={savePlan}
            onSetActivePlan={setActivePlan}
            onUpdateDayRecord={updateDayRecord}
            onToggleTask={toggleTask}
          />
        )}
        {activeTab === 'library' && (
          <Library
            videos={state.videos}
            onAddVideo={addVideo}
            onDeleteVideo={deleteVideo}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            themeColor={state.themeColor}
            onColorChange={setThemeColor}
          />
        )}
      </main>
    </div>
  );
}
