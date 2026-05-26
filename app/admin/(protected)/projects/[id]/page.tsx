import { notFound } from 'next/navigation';
import { getProjectByIdAdmin } from '@/lib/actions/projects';
import { getDevlogEntries } from '@/lib/actions/devlog';
import { ProjectFormClient } from './ProjectFormClient';

export default async function AdminProjectFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === 'new';

  if (isNew) {
    return <ProjectFormClient initialProject={null} isNew />;
  }

  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();

  const devlogEntries = await getDevlogEntries(project.id, true);

  return <ProjectFormClient initialProject={project} isNew={false} devlogEntries={devlogEntries} />;
}
