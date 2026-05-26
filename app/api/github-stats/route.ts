import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo');

  if (!repo) {
    return NextResponse.json({ error: 'Missing repo parameter' }, { status: 400 });
  }

  let ownerRepo = repo;
  if (repo.startsWith('http')) {
    try {
      const parts = new URL(repo).pathname.split('/').filter(Boolean);
      if (parts.length >= 2) ownerRepo = `${parts[0]}/${parts[1]}`;
    } catch {
      return NextResponse.json({ error: 'Invalid repo URL' }, { status: 400 });
    }
  }

  if (!ownerRepo.includes('/')) {
    return NextResponse.json({ error: 'Use owner/repo format' }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [repoRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${ownerRepo}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/repos/${ownerRepo}/commits?per_page=1`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);

    const stars = repoRes.ok ? (await repoRes.json()).stargazers_count : null;

    let commits: number | null = null;
    if (commitsRes.ok) {
      const link = commitsRes.headers.get('Link');
      const match = link?.match(/page=(\d+)>; rel="last"/);
      commits = match ? parseInt(match[1], 10) : 1;
    }

    return NextResponse.json({ stars, commits });
  } catch {
    return NextResponse.json({ stars: null, commits: null, error: true });
  }
}
