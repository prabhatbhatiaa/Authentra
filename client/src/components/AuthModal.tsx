import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, KeyRound, Lock, Mail, UserPlus } from 'lucide-react';
import { authClient } from '../services/auth.service';
import { UserProfile } from '../types/auth.types';
import { StatusAlert } from './StatusAlert';
import { LogoMark } from './ui/Logo';
import { cn } from '../lib/cn';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserProfile) => void;
}

const demoAccounts = [
  { label: 'Admin', email: 'admin@authentra.io', password: 'Admin@Authentra2026!' },
  { label: 'Manager', email: 'manager@authentra.io', password: 'Admin@Authentra2026!' },
  { label: 'User', email: 'user@authentra.io', password: 'User@Authentra2026!' },
];

function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
      <input {...props} className={cn('input pl-10', props.className)} />
    </div>
  );
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
        setSuccessMsg('Session authenticated. Loading workspace…');
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
        setSuccessMsg('Account registered & DID derived. Initializing…');
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

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="relative overflow-hidden px-6 pb-7 pt-8 sm:px-8 sm:pt-9">
      <div className="relative mb-7 space-y-3 text-center">
        <LogoMark className="mx-auto h-8 w-8" />
        <h2 className="font-serif text-[34px] leading-none tracking-[-0.02em] text-fg">
          {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
        </h2>
        <p className="text-sm text-fg-muted">
          {mode === 'login'
            ? 'Authenticate with your cryptographic identity.'
            : 'We derive your W3C DID and bind an Aptos wallet automatically.'}
        </p>
      </div>

      {/* Segmented control */}
      <div className="relative mb-6 grid grid-cols-2 rounded-lg border border-line/10 p-0.5 text-sm">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'relative h-8 rounded-md font-medium transition-colors duration-150',
              mode === m ? 'text-canvas' : 'text-fg-muted hover:text-fg'
            )}
          >
            {mode === m && (
              <motion.span
                layoutId="auth-mode"
                className="absolute inset-0 rounded-md bg-fg"
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span className="relative">{m === 'login' ? 'Sign in' : 'Create account'}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {error && <StatusAlert type="error" message={error} onDismiss={() => setError(null)} />}
        {successMsg && <StatusAlert type="success" message={successMsg} />}
      </div>

      <form onSubmit={handleSubmit} className={cn('space-y-3.5', (error || successMsg) && 'mt-4')}>
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div
              key="register-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3.5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="auth-first">
                    First name
                  </label>
                  <input
                    id="auth-first"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alice"
                    autoComplete="given-name"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="auth-last">
                    Last name
                  </label>
                  <input
                    id="auth-last"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vance"
                    autoComplete="family-name"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="auth-org">
                  Organization <span className="text-fg-subtle">(optional)</span>
                </label>
                <IconInput
                  id="auth-org"
                  icon={Building2}
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Authentra Enterprise Trust"
                  autoComplete="organization"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="label" htmlFor="auth-email">
            Email
          </label>
          <IconInput
            id="auth-email"
            icon={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@authentra.io"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="auth-password">
            Password
          </label>
          <IconInput
            id="auth-password"
            icon={Lock}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg mt-2 w-full">
          {loading ? (
            <span className="animate-pulse">Verifying with Argon2id…</span>
          ) : mode === 'login' ? (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Register & derive DID
            </>
          )}
        </button>
      </form>

      {/* Seeded demo credentials */}
      <div className="mt-6 border-t border-line/[0.07] pt-5">
        <div className="meta mb-3 flex items-center justify-center gap-1.5">
          <KeyRound className="h-3 w-3" /> Demo accounts
        </div>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.label}
              type="button"
              onClick={() => handleQuickFill(acc.email, acc.password)}
              className={cn(
                'h-8 rounded-md border px-2 text-[13px] transition-colors duration-150',
                email === acc.email
                  ? 'border-fg/40 bg-fg/[0.05] text-fg'
                  : 'border-line/10 bg-fg/[0.03] text-fg-muted hover:border-line/20 hover:text-fg'
              )}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
