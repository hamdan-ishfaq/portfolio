import { getAllProjectsAdmin } from '@/lib/actions/projects';
import { ProjectsClientWrapper } from './ProjectsClientWrapper';

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();
  return <ProjectsClientWrapper initialProjects={projects} />;
}
