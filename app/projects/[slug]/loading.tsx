export default function Loading() {
  return (
    <main className="min-h-screen mesh-bg px-lg py-2xl">
      <div className="max-w-[1200px] mx-auto space-y-8 animate-pulse">
        <div className="glass-card rounded-2xl p-8 md:p-10 space-y-5">
          <div className="h-4 w-24 rounded bg-surface-container-high" />
          <div className="h-12 md:h-16 w-3/4 rounded bg-surface-container-high" />
          <div className="h-5 w-1/2 rounded bg-surface-container-high" />
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-7 w-20 rounded-full bg-surface-container-high" />
            <div className="h-7 w-24 rounded-full bg-surface-container-high" />
            <div className="h-7 w-28 rounded-full bg-surface-container-high" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="glass-card rounded-2xl h-[420px] bg-surface-container-high/40" />
          <div className="space-y-4">
            <div className="glass-card rounded-2xl h-40 bg-surface-container-high/40" />
            <div className="glass-card rounded-2xl h-40 bg-surface-container-high/40" />
          </div>
        </div>
      </div>
    </main>
  );
}
