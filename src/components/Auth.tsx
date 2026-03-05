import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Hash, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // 用于存放 6 位验证码
  const [showOtpInput, setShowOtpInput] = useState(false); // 是否显示验证码框
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 第一步：发送验证码邮件
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setShowOtpInput(true);
      setMessage({ type: 'success', text: '6-digit code sent to your email!' });
    }
    setLoading(false);
  };

  // 第二步：验证验证码
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-2xl">F</div>
          <h2 className="text-3xl font-extrabold text-gray-900">FitJourney</h2>
          <p className="mt-2 text-sm text-gray-600">
            {showOtpInput ? 'Enter the code from your email' : 'Sign in with your email'}
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              disabled={showOtpInput}
              className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-gray-50"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {showOtpInput && (
            <div className="relative">
              <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                maxLength={6}
                className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm tracking-widest font-mono"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 shadow-md transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (showOtpInput ? 'Verify Code' : 'Send Code')}
          </button>
        </form>
        
        {showOtpInput && (
          <button 
            onClick={() => setShowOtpInput(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Back to email
          </button>
        )}
      </div>
    </div>
  );
}
