import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Login link sent! Please check your email inbox (and spam).' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-theme-500 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-2xl">F</div>
          <h2 className="text-3xl font-extrabold text-gray-900">FitJourney</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email to receive a login link</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl focus:ring-theme-500 focus:border-theme-500 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-theme-500 hover:bg-theme-600 disabled:opacity-50 shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
