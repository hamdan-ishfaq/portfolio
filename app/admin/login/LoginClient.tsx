'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export function LoginClient() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft > 0) return;

    setError('');

    startTransition(async () => {
      try {
        const result = await loginAction(email, password);

        if (result?.error === 'rate_limited') {
          setError('Too many login attempts. Please try again in 15 minutes.');
          setTimeLeft(900);
          return;
        }

        if (result?.error === 'invalid_credentials') {
          setError(
            'Invalid email or password. If this persists, check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
          );
          return;
        }
      } catch (err) {
        if (err && typeof err === 'object' && 'digest' in err) {
          router.replace('/admin/dashboard');
          router.refresh();
          return;
        }
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <div className="admin-login">
      <main className="admin-login__card glass-card rounded-2xl p-8 flex flex-col gap-6">
        <div className="admin-login__accent" aria-hidden="true" />
        <div className="flex justify-center">
          <LanguageToggle />
        </div>

        <div className="text-center">
          <div className="admin-login__icon">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_lock
            </span>
          </div>
          <h1 className="type-section text-on-surface">{t('admin.loginTitle')}</h1>
          <p className="type-lead mx-auto mt-2 text-sm">{t('admin.loginLead')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="admin-form-field">
            <label className="type-label" htmlFor="email">
              {t('contact.email')}
            </label>
            <div className="admin-form-field__input-wrap">
              <span className="material-symbols-outlined">mail</span>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-field">
            <label className="type-label" htmlFor="password">
              {t('admin.password')}
            </label>
            <div className="admin-form-field__input-wrap">
              <span className="material-symbols-outlined">key</span>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={timeLeft > 0 || isPending}
            className="btn-primary w-full rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <span>{isPending ? t('admin.signingIn') : t('admin.signIn')}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg border border-error/20 bg-error/10 flex items-start gap-3">
            <span
              className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <div>
              <p className="text-sm text-error font-medium">{error}</p>
              {timeLeft > 0 && (
                <p className="type-label text-error/80 mt-1 normal-case tracking-normal">
                  Try again in {timeLeft}s.
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-center font-mono text-[11px] text-on-surface-variant/60">
          {t('admin.secureNote')}
        </p>
      </main>
    </div>
  );
}
