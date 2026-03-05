import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Hash, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) setMessage({ type: 'error', text: error.message });
    else setShowOtpInput(true);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) setMessage({ type: 'error', text: error.message });
    setLoading(false);
  };

  // 密码登录函数
  const [password, setPassword] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ type: 'error', text: error.message });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto text-white font-bold text-2xl mb-4">F</div>
          <h2 className="text-3xl font-extrabold text-gray-900">FitJourney</h2>
          <p className="mt-2 text-sm text-gray-600">{isPasswordMode ? '使用密码登录' : '验证码快捷登录'}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={isPasswordMode ? handlePasswordLogin : (showOtpInput ? handleVerifyOtp : handleSendOtp)}>
          <input type="email" required className="block w-full px-3 py-3 border border-gray-300 rounded-xl" placeholder="邮箱地址" value={email} onChange={e => setEmail(e.target.value)} />
          
          {isPasswordMode ? (
            <input type="password" required className="block w-full px-3 py-3 border border-gray-300 rounded-xl" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} />
          ) : (
            showOtpInput && <input type="text" required maxLength={6} className="block w-full px-3 py-3 border border-gray-300 rounded-xl font-mono text-center tracking-widest" placeholder="000000" value={token} onChange={e => setToken(e.target.value)} />
          )}

          {message && <div className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-600 transition-all flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isPasswordMode ? '登录' : (showOtpInput ? '验证并进入' : '获取验证码'))}
          </button>
        </form>

        <button onClick={() => setIsPasswordMode(!isPasswordMode)} className="w-full text-center text-sm text-emerald-600 font-medium">
          切换到 {isPasswordMode ? '验证码登录' : '密码登录'}
        </button>
      </div>
    </div>
  );
}
