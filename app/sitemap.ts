import type { MetadataRoute } from 'next';
import { adminSupabase } from '@/lib/supabase/admin';
import { PROFILE } from '@/lib/content/profile';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data: projects } = await adminSupabase
    .from('projects')
    .select('slug, updated_at')
    .eq('published', true);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const project of projects ?? []) {
    entries.set(project.slug, {
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const item of PROFILE.caseStudies.items) {
    if (!item.published || entries.has(item.slug)) continue;
    entries.set(item.slug, {
      url: `${baseUrl}/projects/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...entries.values(),
  ];
}
