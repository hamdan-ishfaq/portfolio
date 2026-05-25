export default function Home() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-2xl font-bold mb-4">Environment Setup Check</h1>
      <p className="text-lg">
        Firebase Project ID:
        <span className="ml-2 font-mono bg-zinc-800 text-green-400 p-1 rounded">
          {projectId || 'NOT FOUND - CHECK .ENV.LOCAL'}
        </span>
      </p>
    </main>
  );
}
