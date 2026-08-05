import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminSupabase } from '@/lib/supabase/admin';
import { Footer } from '@/components/public/Footer';
import { ProjectClientWrapper } from './ProjectClientWrapper';
import { PORTFOLIO_CASE_STUDIES } from '@/lib/content/portfolio';
import type { Project, DevlogEntry, ProjectComment, GlobalSettings } from '@/types';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

function getStaticCase(slug: string): Project | null {
  const match = PORTFOLIO_CASE_STUDIES.find((p) => p.slug === slug && p.published);
  return match ? (match as Project) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: project } = await supabase
    .from('projects')
    .select('title, short_description, cover_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const fallback = getStaticCase(slug);
  const resolved = project ?? fallback;

  if (!resolved) {
    return { title: 'Project Not Found' };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/projects/${slug}`;

  return {
    title: resolved.title,
    description: resolved.short_description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: resolved.title,
      description: resolved.short_description,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: `${pageUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: resolved.title,
        },
        ...(resolved.cover_image_url ? [{ url: resolved.cover_image_url }] : []),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolved.title,
      description: resolved.short_description,
    },
  };
}

function buildProjectJsonLd(project: Project, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.short_description,
    url: `${siteUrl}/projects/${project.slug}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    ...(project.github_repo ? { codeRepository: project.github_repo } : {}),
    ...(project.cover_image_url ? { image: project.cover_image_url } : {}),
    author: {
      '@type': 'Person',
      name: 'Hamdan Ishfaq',
      url: siteUrl,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const siteUrl = getSiteUrl();

  const { data: settings } = await supabase.from('settings').select('*').single();

  const { data: dbProject } = await supabase.from('projects').select('*').eq('slug', slug).single();

  const project = dbProject && dbProject.published ? (dbProject as Project) : getStaticCase(slug);

  if (!project) {
    notFound();
  }

  const { data: devlogs } = dbProject?.id
    ? await supabase
        .from('devlog_entries')
        .select('*')
        .eq('project_id', dbProject.id)
        .eq('published', true)
        .order('entry_date', { ascending: false })
    : { data: [] };

  const { data: comments } = dbProject?.id
    ? await supabase
        .from('project_comments')
        .select('*')
        .eq('project_id', dbProject.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
    : { data: [] };

  const jsonLd = buildProjectJsonLd(project, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectClientWrapper
        project={project}
        devlogs={(devlogs as DevlogEntry[]) ?? []}
        comments={(comments as ProjectComment[]) ?? []}
      />
      <Footer settings={settings as GlobalSettings | null} />
    </>
  );
}

export async function generateStaticParams() {
  const { data: projects } = await adminSupabase
    .from('projects')
    .select('slug')
    .eq('published', true);

  const dbSlugs = (projects || []).map((project) => ({ slug: project.slug }));
  const staticSlugs = PORTFOLIO_CASE_STUDIES.map((p) => ({ slug: p.slug }));
  const seen = new Set<string>();
  return [...dbSlugs, ...staticSlugs].filter(({ slug }) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}
