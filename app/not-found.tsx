import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center px-lg py-2xl">
      <section className="glass-card w-full max-w-2xl rounded-2xl p-8 md:p-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-high border border-white/10 mx-auto">
          <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
        </div>
        <div className="space-y-3">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">
            404
          </p>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            This route does not exist.
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-prose mx-auto">
            The page you were looking for is unavailable. Return to the portfolio or browse the
            featured projects instead.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="btn-primary px-6 py-3 rounded-lg font-body-base font-semibold" href="/">
            Back Home
          </Link>
          <Link
            className="btn-secondary px-6 py-3 rounded-lg font-body-base font-semibold"
            href="/#projects"
          >
            View Projects
          </Link>
        </div>
      </section>
    </main>
  );
}
