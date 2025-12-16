import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Check if email confirmation is required by Supabase settings
        // Usually for simple setups it might auto-login or ask for confirmation
        // We'll show a generic success or let the auth state change handle the redirect
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">GATED.</h1>
          <p className="text-neutral-500 text-sm tracking-widest uppercase">Member Access</p>
        </div>

        {/* Auth Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-4 mb-8 border-b border-neutral-800 pb-1">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`pb-3 text-sm font-medium transition-all relative ${!isSignUp ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Sign In
              {!isSignUp && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`pb-3 text-sm font-medium transition-all relative ${isSignUp ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Sign Up
              {isSignUp && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder-neutral-600 text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neutral-500 transition-colors placeholder-neutral-600 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Enter Gated'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-xs mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;