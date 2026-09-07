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
        setSuccessMsg('Authentication verified. Loading executive workspace...');
        setTimeout(() => {
          onSuccess(response.data.user);
        }, 600);
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
        setSuccessMsg('Account & Aptos DID created successfully. Initializing...');
        setTimeout(() => {
          onSuccess(response.data.user);
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {mode === 'login' ? 'Sign In to Authentra' : 'Create Enterprise Account'}
        </h2>
        <p className="text-xs font-mono text-slate-400">
          {mode === 'login'
            ? 'Cryptographic identity & access control verification'
            : 'Automated DID generation & Aptos wallet binding'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-all ${
            mode === 'login'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
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
          className={`flex-1 py-2.5 text-center font-medium border-b-2 transition-all ${
            mode === 'register'
              ? 'border-emerald-500 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          REGISTER
        </button>
      </div>

      {/* Error & Success Feedback */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">FIRST NAME</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alice"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LAST NAME</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3" /> ORGANIZATION NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Acme Cyber Security"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3" /> EMAIL ADDRESS
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@authentra.io"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> PASSWORD
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Min 8 chars (A-Z, a-z, 0-9, special)' : '••••••••••••'}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">VERIFYING WITH ARGON2ID...</span>
          ) : mode === 'login' ? (
            <>
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register & Derive DID</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Seed Fill Helpers */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Login with Seed Accounts:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@authentra.io', 'Admin@Authentra2026!')}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('manager@authentra.io', 'Admin@Authentra2026!')}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            Manager
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('user@authentra.io', 'User@Authentra2026!')}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            User
          </button>
        </div>
      </div>
    </div>
  );
}
