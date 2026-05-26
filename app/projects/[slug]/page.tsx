import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminSupabase } from '@/lib/supabase/admin';
import { Footer } from '@/components/public/Footer';
import { ProjectClientWrapper } from './ProjectClientWrapper';
import type { Project, DevlogEntry, ProjectComment, GlobalSettings } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
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

  if (!project) {
    return { title: 'Project Not Found' };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/projects/${slug}`;

  return {
    title: project.title,
    description: project.short_description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: project.title,
      description: project.short_description,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: `${pageUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
        ...(project.cover_image_url ? [{ url: project.cover_image_url }] : []),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.short_description,
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
    applicationCategory: 'DeveloperApplication',
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

  const { data: project } = await supabase.from('projects').select('*').eq('slug', slug).single();

  if (!project || !project.published) {
    notFound();
  }

  const { data: devlogs } = await supabase
    .from('devlog_entries')
    .select('*')
    .eq('project_id', project.id)
    .eq('published', true)
    .order('entry_date', { ascending: false });

  const { data: comments } = await supabase
    .from('project_comments')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const jsonLd = buildProjectJsonLd(project as Project, siteUrl);

  return (
    <ToastProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectClientWrapper
        project={project as Project}
        devlogs={(devlogs as DevlogEntry[]) ?? []}
        comments={(comments as ProjectComment[]) ?? []}
      />
      <Footer settings={settings as GlobalSettings | null} />
    </ToastProvider>
  );
}

export async function generateStaticParams() {
  const { data: projects } = await adminSupabase
    .from('projects')
    .select('slug')
    .eq('published', true);

  return (projects || []).map((project) => ({
    slug: project.slug,
  }));
}
