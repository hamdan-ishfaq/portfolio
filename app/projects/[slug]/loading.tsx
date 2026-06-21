export default function Loading() {
  return (
    <div className="public-page">
      <div className="public-page-nav">
        <div className="page-container py-3 sm:py-md">
          <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
      <main className="flex-grow pt-6 sm:pt-xl pb-12 sm:pb-2xl w-full">
        <div className="page-container space-y-8 animate-pulse">
          <div className="glass-card rounded-2xl p-8 md:p-10 space-y-5">
            <div className="h-4 w-24 rounded bg-white/5" />
            <div className="h-12 md:h-16 w-3/4 rounded bg-white/5" />
            <div className="h-5 w-1/2 rounded bg-white/5" />
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-7 w-20 rounded-full bg-white/5" />
              <div className="h-7 w-24 rounded-full bg-white/5" />
              <div className="h-7 w-28 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="glass-card rounded-2xl h-[420px]" />
            <div className="space-y-4">
              <div className="glass-card rounded-2xl h-40" />
              <div className="glass-card rounded-2xl h-40" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
