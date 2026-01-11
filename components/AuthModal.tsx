import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Icon } from './Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'sign-in' | 'sign-up';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setNotice(null);
      setIsSubmitting(false);
      setEmail('');
      setPassword('');
      setMode('sign-in');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    if (mode === 'sign-in') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        onClose();
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (!data.session) {
        setNotice('Check your email to confirm your account.');
      } else {
        onClose();
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1720] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {mode === 'sign-in'
                ? 'Access your saved history.'
                : 'Save prompts across devices.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Close"
          >
            <Icon icon="close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111827] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#318ba2] focus:ring-2 focus:ring-[#318ba2]"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111827] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#318ba2] focus:ring-2 focus:ring-[#318ba2]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-lg border border-[#318ba2]/40 bg-[#318ba2]/10 px-3 py-2 text-sm text-[#1f5a67] dark:text-[#bfe9f3]">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#318ba2] py-2.5 text-sm font-semibold text-white hover:bg-[#2a7a8f] transition-colors disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            className="w-full text-sm text-[#318ba2] hover:text-[#2a7a8f] transition-colors"
          >
            {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
