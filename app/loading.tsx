export default function Loading() {
  return (
    <main className="min-h-screen mesh-bg px-lg py-2xl">
      <div className="max-w-[1200px] mx-auto space-y-6 animate-pulse">
        <div className="glass-card rounded-2xl p-8 md:p-10 space-y-6">
          <div className="h-4 w-32 rounded bg-surface-container-high" />
          <div className="h-12 md:h-16 w-3/4 rounded bg-surface-container-high" />
          <div className="h-5 w-2/3 rounded bg-surface-container-high" />
          <div className="flex gap-3 pt-4">
            <div className="h-11 w-32 rounded-lg bg-surface-container-high" />
            <div className="h-11 w-40 rounded-lg bg-surface-container-high" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-2xl p-6 h-72 bg-surface-container-high/40" />
          <div className="glass-card rounded-2xl p-6 h-72 bg-surface-container-high/40" />
        </div>
      </div>
    </main>
  );
}
