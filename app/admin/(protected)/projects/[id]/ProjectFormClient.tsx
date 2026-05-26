'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DevlogEntry, Project } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';
import { FileUploadInput } from '@/components/admin/FileUploadInput';
import { DevlogEditor } from '@/components/admin/DevlogEditor';
import { upsertProject } from '@/lib/actions/projects';
import { parseLoomVideoId } from '@/lib/loom';

type ProjectFormClientProps = {
  initialProject: Project | null;
  isNew: boolean;
  devlogEntries?: DevlogEntry[];
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProjectFormClient({
  initialProject,
  isNew,
  devlogEntries = [],
}: ProjectFormClientProps) {
  const router = useRouter();
  const { show: toast } = useToast();
  const [slugManual, setSlugManual] = useState(!isNew);

  const [formData, setFormData] = useState<Partial<Project>>(
    initialProject || {
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      published: false,
      project_status: 'active',
      tier: 1,
      order: 0,
      loom_video_id_demo: '',
      loom_video_id_arch: '',
      github_repo: '',
      live_demo_url: '',
      linkedin_url: '',
      cover_image_url: null,
      tech_stack: [],
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'title' && !slugManual) {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slugify(value),
      }));
      return;
    }

    if (name === 'slug') {
      setSlugManual(true);
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'tier' || name === 'order') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!formData.title?.trim()) {
      toast('Title is required', 'error');
      return;
    }
    if (!formData.slug?.trim()) {
      toast('Slug is required', 'error');
      return;
    }

    const loomId =
      parseLoomVideoId(formData.loom_video_id_demo ?? '') ??
      (formData.loom_video_id_demo?.trim() || null);

    const dataToSave = {
      ...formData,
      published: publish,
      tier: (formData.tier ?? 1) as 0 | 1 | 2 | 3,
      loom_video_id_demo: loomId,
      loom_video_id_arch: null,
    };

    const res = await upsertProject(
      dataToSave as Parameters<typeof upsertProject>[0],
      initialProject?.id
    );

    if (!res.success) {
      toast(res.error ?? 'Save failed', 'error');
      return;
    }

    toast(`Project ${publish ? 'published' : 'saved as draft'}.`, 'success');

    if (isNew && res.projectId) {
      router.push(`/admin/projects/${res.projectId}`);
      router.refresh();
    } else {
      router.push('/admin/projects');
      router.refresh();
    }
  };

  const detailsForm = (
    <div className="space-y-xl">
      <section className="glass-card rounded-xl p-lg">
        <h3 className="font-headline-md text-headline-md text-primary mb-lg border-b border-white/5 pb-sm">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Title</label>
            <input
              name="title"
              value={formData.title ?? ''}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
            />
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Slug</label>
            <input
              name="slug"
              value={formData.slug ?? ''}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm font-mono text-sm"
            />
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">
              Status
            </label>
            <select
              name="project_status"
              value={formData.project_status}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Tier</label>
            <select
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
            >
              <option value={0}>Tier 0 (Hidden)</option>
              <option value={1}>Tier 1 (Hero)</option>
              <option value={2}>Tier 2 (Grid)</option>
              <option value={3}>Tier 3 (List)</option>
            </select>
          </div>
          <div className="space-y-xs md:col-span-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">
              Short description
            </label>
            <textarea
              name="short_description"
              value={formData.short_description ?? ''}
              onChange={handleChange}
              rows={2}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm resize-y"
            />
          </div>
          <div className="space-y-xs md:col-span-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">
              Full description (Markdown)
            </label>
            <textarea
              name="full_description"
              value={formData.full_description ?? ''}
              onChange={handleChange}
              rows={8}
              className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm font-mono text-sm resize-y"
            />
          </div>
        </div>
      </section>

      <section className="glass-card rounded-xl p-lg">
        <h3 className="font-headline-md text-headline-md text-primary mb-lg border-b border-white/5 pb-sm">
          Media &amp; Links
        </h3>
        <div className="space-y-lg">
          {initialProject?.id ? (
            <FileUploadInput
              bucket="images"
              path={`projects/${initialProject.id}-cover.webp`}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={5}
              currentUrl={formData.cover_image_url}
              label="Cover image"
              onUploadComplete={async (url) => {
                setFormData((prev) => ({ ...prev, cover_image_url: url }));
                const res = await upsertProject(
                  {
                    ...formData,
                    cover_image_url: url,
                    tier: (formData.tier ?? 1) as 0 | 1 | 2 | 3,
                    slug: formData.slug!,
                    title: formData.title!,
                  },
                  initialProject.id
                );
                if (res.success) toast('Cover image saved', 'success');
                else toast(res.error ?? 'Failed to save cover URL', 'error');
              }}
            />
          ) : (
            <p className="text-sm text-on-surface-variant">
              Save the project first, then upload a cover image.
            </p>
          )}
          <div className="grid grid-cols-1 gap-md">
            <div className="space-y-xs md:col-span-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">
                Loom video URL or ID
              </label>
              <input
                name="loom_video_id_demo"
                value={formData.loom_video_id_demo ?? ''}
                onChange={handleChange}
                placeholder="https://www.loom.com/share/abc123 or abc123"
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
              />
              <p className="text-xs text-on-surface-variant">
                Paste a Loom share link or video ID. One demo video per project.
              </p>
            </div>
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant">
                GitHub repo (URL or owner/repo)
              </label>
              <input
                name="github_repo"
                value={formData.github_repo ?? ''}
                onChange={handleChange}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant">
                Live demo URL
              </label>
              <input
                name="live_demo_url"
                value={formData.live_demo_url ?? ''}
                onChange={handleChange}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
              />
            </div>
            <div className="space-y-xs md:col-span-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">
                LinkedIn URL
              </label>
              <input
                name="linkedin_url"
                value={formData.linkedin_url ?? ''}
                onChange={handleChange}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg px-md py-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex-grow flex flex-col min-h-0 relative">
      <div className="flex-grow overflow-y-auto pb-[100px]">
        <div className="max-w-[1200px] mx-auto px-md md:px-xl py-xl space-y-xl">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              {isNew ? 'New Project' : 'Edit Project'}
            </h2>
            <p className="font-body-base text-body-base text-on-surface-variant mt-sm">
              {isNew
                ? 'Create a portfolio entry, then add devlog entries.'
                : 'Update project details and devlog.'}
            </p>
          </div>

          {!isNew && initialProject?.id ? (
            <Tabs
              defaultTab="details"
              tabs={[
                { id: 'details', label: 'Details', content: detailsForm },
                {
                  id: 'devlog',
                  label: 'Devlog',
                  content: (
                    <DevlogEditor projectId={initialProject.id} initialEntries={devlogEntries} />
                  ),
                },
              ]}
            />
          ) : (
            detailsForm
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-surface-container-highest/90 backdrop-blur-xl border-t border-white/5 p-md px-xl flex justify-end gap-md z-50">
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="bg-transparent border border-outline-variant/30 text-on-surface hover:bg-surface-container-high rounded-lg px-lg py-sm font-label-caps text-label-caps"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          className="bg-gradient-to-r from-primary to-secondary text-on-primary rounded-lg px-lg py-sm font-label-caps text-label-caps hover:scale-[1.02] transition-transform"
        >
          Save &amp; Publish
        </button>
      </div>
    </div>
  );
}
