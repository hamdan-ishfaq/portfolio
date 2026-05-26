import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CommentsClientWrapper } from './CommentsClientWrapper';
import type { ProjectComment } from '@/types';

type CommentRow = ProjectComment & {
  projects: { title: string; slug: string } | null;
};

export default async function AdminCommentsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: comments, error } = await supabase
    .from('project_comments')
    .select(
      `
      *,
      projects (
        title,
        slug
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
  }

  const formattedComments =
    (comments as CommentRow[] | null)?.map(({ projects, ...comment }) => ({
      ...comment,
      project_title: projects?.title ?? 'Unknown Project',
      project_slug: projects?.slug ?? '',
    })) ?? [];

  return <CommentsClientWrapper initialComments={formattedComments} />;
}
