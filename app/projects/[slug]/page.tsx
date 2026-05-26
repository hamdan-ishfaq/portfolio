import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminSupabase } from '@/lib/supabase/admin';
import { Footer } from '@/components/public/Footer';
import { ProjectClientWrapper } from './ProjectClientWrapper';
import type { Project, DevlogEntry, ProjectComment, GlobalSettings } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

export const revalidate = 3600; // Cache for 1 hour

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: settings } = await supabase.from('settings').select('*').single();

  // Fetch project
  const { data: project } = await supabase.from('projects').select('*').eq('slug', slug).single();

  if (!project || !project.published) {
    notFound();
  }

  // Fetch devlogs (published only)
  const { data: devlogs } = await supabase
    .from('devlog_entries')
    .select('*')
    .eq('project_id', project.id)
    .eq('published', true)
    .order('entry_date', { ascending: false });

  // Fetch approved comments
  const { data: comments } = await supabase
    .from('project_comments')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  return (
    <ToastProvider>
      <ProjectClientWrapper
        project={project as Project}
        devlogs={(devlogs as DevlogEntry[]) ?? []}
        comments={(comments as ProjectComment[]) ?? []}
      />
      <Footer settings={settings as GlobalSettings | null} />
    </ToastProvider>
  );
}

// Build-time static params — use service role (no cookies at build time)
export async function generateStaticParams() {
  const { data: projects } = await adminSupabase
    .from('projects')
    .select('slug')
    .eq('published', true);

  return (projects || []).map((project) => ({
    slug: project.slug,
  }));
}
