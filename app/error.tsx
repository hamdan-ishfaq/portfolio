'use client';

import Link from 'next/link';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="glass-card rounded-2xl p-8 sm:p-10 max-w-md w-full space-y-6">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <div className="space-y-2">
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Something went wrong
          </h1>
          <p className="text-sm text-on-surface-variant">
            An unexpected error occurred while loading this page.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <p className="text-xs font-mono text-error/80 break-all pt-2">{error.message}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-secondary px-6 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center justify-center"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
