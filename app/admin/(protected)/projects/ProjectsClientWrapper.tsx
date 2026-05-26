'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { deleteProject, toggleProjectPublished } from '@/lib/actions/projects';
import { formatDate } from '@/lib/format-date';

type ProjectsClientWrapperProps = {
  initialProjects: Project[];
};

export function ProjectsClientWrapper({ initialProjects }: ProjectsClientWrapperProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { show: toast } = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.short_description ?? '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    const res = await deleteProject(projectToDelete);
    setDeleting(false);
    if (!res.success) {
      toast(res.error ?? 'Delete failed', 'error');
      return;
    }
    setProjects(projects.filter((p) => p.id !== projectToDelete));
    setDeleteModalOpen(false);
    setProjectToDelete(null);
    toast('Project deleted', 'success');
  };

  const handleTogglePublished = async (project: Project) => {
    if (togglingId) return;
    setTogglingId(project.id);
    const nextPublished = !project.published;
    const res = await toggleProjectPublished(project.id, nextPublished);
    setTogglingId(null);

    if (!res.success) {
      toast(res.error ?? 'Failed to update publish status', 'error');
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, published: nextPublished } : p))
    );
    toast(nextPublished ? 'Project published' : 'Project unpublished', 'success');
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto p-md md:p-xl flex-1 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-lg md:mb-xl mt-4 md:mt-0">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
            Projects
          </h2>
          <p className="text-on-surface-variant font-body-base mt-2">
            Manage portfolio entries and technical case studies.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-semibold hover:scale-[1.02] transition-transform duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Project
        </Link>
      </div>

      {/* Data Table Container (Glassmorphism Card) */}
      <div className="glass-card rounded-xl overflow-hidden flex-1 flex flex-col relative z-10">
        {/* Table Controls / Filters */}
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-surface-container/30">
          <div className="relative flex-1 max-w-[28rem]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-highest border border-white/10 rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/70"
              placeholder="Search projects..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
            <button className="p-2 rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">view_column</span>
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-surface-container-low/50 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold w-12">
                  <input
                    className="rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/50 focus:ring-offset-0"
                    type="checkbox"
                  />
                </th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold w-32">Tier</th>
                <th className="p-4 font-semibold w-32">Status</th>
                <th className="p-4 font-semibold w-32 text-center">Published</th>
                <th className="p-4 font-semibold w-40">Created</th>
                <th className="p-4 font-semibold w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    No projects found.
                  </td>
                </tr>
              )}
              {filtered.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <input
                      className="rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/50 focus:ring-offset-0 opacity-50 group-hover:opacity-100 transition-opacity"
                      type="checkbox"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-surface-container-highest border border-white/5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          terminal
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {project.title}
                        </div>
                        <div className="text-on-surface-variant text-[12px] truncate max-w-[250px] mt-0.5">
                          {project.short_description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-tertiary-container/20 text-tertiary border border-tertiary-container/30">
                      Tier {project.tier}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[12px] font-medium text-on-surface bg-surface-container-highest border border-white/5 capitalize">
                      <span
                        className={`w-2 h-2 rounded-full ${project.project_status === 'active' ? 'bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.6)]' : project.project_status === 'completed' ? 'bg-primary' : 'bg-outline'}`}
                      ></span>
                      {project.project_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={project.published}
                          disabled={togglingId === project.id}
                          onChange={() => handleTogglePublished(project)}
                        />
                        <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container border border-white/10 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-code-base text-[13px]">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button
                        onClick={() => confirmDelete(project.id)}
                        className="p-1.5 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-surface-container/20 text-body-sm text-on-surface-variant mt-auto">
          <div>
            Showing {filtered.length} of {projects.length} results
          </div>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Prev
            </button>
            <button className="px-3 py-1 rounded border border-primary/30 bg-primary/10 text-primary">
              1
            </button>
            <button
              className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          ></div>
          <div className="relative glass-card w-full max-w-[28rem] rounded-xl p-lg shadow-2xl m-4 transform transition-all border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center shrink-0 border border-error-container/50">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] text-on-surface mb-2">
                  Delete Project
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  Are you sure you want to delete this project? This action cannot be undone and
                  will permanently remove all associated data and assets from the server.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container-highest transition-colors font-medium text-body-sm"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 transition-colors font-medium text-body-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
