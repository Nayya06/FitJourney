import React, { useState } from 'react';
import { Settings as SettingsIcon, Check, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient'; // 必须引入这个来操作密码

interface SettingsProps {
  themeColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#64748b' },
];

export default function Settings({ themeColor, onColorChange }: SettingsProps) {
  // --- 新增：密码修改相关的状态 ---
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少需要 6 位' });
      return;
    }
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setMessage({ type: 'error', text: '设置失败: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '密码设置成功！下次可用密码模式登录。' });
      setNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-theme-500" />
          Settings
        </h2>
        <p className="text-gray-500">Customize your FitJourney experience.</p>
      </div>

      {/* 1. 主题颜色设置 (保留你原有的功能) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Color</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Preset Colors</p>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onColorChange(color.value)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      backgroundColor: color.value,
                      boxShadow: themeColor === color.value ? `0 0 0 2px white, 0 0 0 4px ${color.value}` : 'none'
                    }}
                    title={color.name}
                  >
                    {themeColor === color.value && <Check className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-3">Custom Color</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  {themeColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 新增：安全设置卡片 (设置密码入口) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-900">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-medium">Security Settings</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          设置密码后，下次您可以直接通过“密码模式”登录，无需等待验证码邮件。
        </p>
        
        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Enter new password"
              className="block w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleUpdatePassword}
            disabled={loading || !newPassword}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md"
          >
            {loading ? 'Updating...' : 'Save Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
