import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Building, UserPlus, KeyRound } from 'lucide-react';
import { authClient } from '../services/auth.service';
import { UserProfile } from '../types/auth.types';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserProfile) => void;
}

export function AuthModal({ initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await authClient.login({ email, password });
        localStorage.setItem('authentra_token', response.data.token);
        localStorage.setItem('authentra_user', JSON.stringify(response.data.user));
        setSuccessMsg('Session authenticated. Loading workspace...');
        setTimeout(() => {
          onSuccess(response.data.user);
        }, 500);
      } else {
        const response = await authClient.register({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          organizationName: organizationName || undefined,
        });
        localStorage.setItem('authentra_token', response.data.token);
        localStorage.setItem('authentra_user', JSON.stringify(response.data.user));
        setSuccessMsg('Account registered & DID derived. Initializing...');
        setTimeout(() => {
          onSuccess(response.data.user);
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setMode('login');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-7 bg-white dark:bg-[#101014] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl font-sans">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 mb-1">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {mode === 'login' ? 'Authenticate Session' : 'Initialize Enterprise Account'}
        </h2>
        <p className="text-xs font-mono text-zinc-500">
          {mode === 'login'
            ? 'Cryptographic identity & RBAC verification'
            : 'Automated DID derivation & Aptos wallet binding'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-5 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${
            mode === 'login'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          LOGIN
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${
            mode === 'register'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          REGISTER
        </button>
      </div>

      {/* Error & Success Feedback */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">FIRST NAME</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alice"
                  className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 mb-1">LAST NAME</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3" /> ORGANIZATION NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Authentra Enterprise Trust"
                className="w-full px-3 py-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-[11px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3" /> EMAIL IDENTIFIER
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@authentra.io"
            className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> PASSWORD KEY
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3 py-2 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 btn-primary py-2.5 px-4 font-mono text-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">VERIFYING WITH ARGON2ID...</span>
          ) : mode === 'login' ? (
            <>
              <span>AUTHENTICATE SESSION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTER & DERIVE DID</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Seed Fill Helpers */}
      <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 mb-2">
          <KeyRound className="w-3 h-3" />
          <span>QUICK SEED CREDENTIALS:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@authentra.io', 'Admin@Authentra2026!')}
            className="p-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('manager@authentra.io', 'Admin@Authentra2026!')}
            className="p-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Manager
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('user@authentra.io', 'User@Authentra2026!')}
            className="p-1.5 rounded bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            User
          </button>
        </div>
      </div>
    </div>
  );
}
