'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';

export function LoginClient() {
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
        // redirect() throws — successful login ends here
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
    <div className="min-h-screen flex items-center justify-center p-md md:p-lg text-on-surface antialiased overflow-hidden">
      {/* Atmospheric Mesh Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-[128px]"></div>
      </div>

      <main className="w-full max-w-[420px] relative z-10">
        {/* Login Card */}
        <div className="bg-surface-container-high/70 backdrop-blur-[16px] border border-white/10 rounded-xl shadow-2xl p-xl flex flex-col gap-lg relative overflow-hidden">
          {/* Glow Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary opacity-50"></div>

          {/* Header */}
          <div className="text-center space-y-sm mb-md">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high border border-white/5 mb-sm">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_lock
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Admin Access</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Secure authentication required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Email Input */}
            <div className="space-y-xs">
              <label
                className="font-label-caps text-label-caps text-on-surface-variant block"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-surface-container/60 border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all rounded-lg py-3 pl-10 pr-4 text-on-surface font-body-base text-body-base placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label
                  className="font-label-caps text-label-caps text-on-surface-variant block"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  key
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container/60 border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all rounded-lg py-3 pl-10 pr-4 text-on-surface font-body-base text-body-base placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={timeLeft > 0 || isPending}
              className="bg-gradient-to-r from-secondary to-primary border-t border-white/40 hover:scale-[1.02] transition-transform w-full rounded-lg py-3 px-4 font-body-base text-body-base text-on-primary font-semibold mt-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isPending ? 'Signing In...' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Error state */}
          {error && (
            <div className="mt-4 p-3 rounded-lg border border-error/20 bg-error-container/10 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-error text-[20px] mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <div>
                <p className="font-body-sm text-body-sm text-error font-medium">{error}</p>
                {timeLeft > 0 && (
                  <p className="font-label-caps text-label-caps text-error/80 mt-1">
                    Try again in <span>{timeLeft}</span>s.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-lg text-center">
          <p className="font-code-base text-code-base text-on-surface-variant opacity-60">
            System v2.4.1 · Session ID: <span className="text-primary">a8f9-2c</span>
          </p>
        </div>
      </main>
    </div>
  );
}
