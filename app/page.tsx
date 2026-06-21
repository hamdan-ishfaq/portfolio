import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Hero } from '@/components/public/Hero';
import { ProjectSections } from '@/components/public/ProjectSections';
import { Timeline } from '@/components/public/Timeline';
import { ContactForm } from '@/components/public/ContactForm';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import type { GlobalSettings, Project, TimelineEvent } from '@/types';

export const revalidate = 300;

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const [settingsRes, projectsRes, timelineRes] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('projects').select('*').eq('published', true).order('order', { ascending: true }),
    supabase.from('timeline_events').select('*').order('start_date', { ascending: false }),
  ]);

  const settings = (settingsRes.data as GlobalSettings) ?? null;
  const projects = (projectsRes.data as Project[]) ?? [];
  const events = (timelineRes.data as TimelineEvent[]) ?? [];

  return (
    <>
      <Navbar settings={settings} />
      <main id="main-content" className="pt-20 sm:pt-24 pb-16 sm:pb-32">
        <Hero settings={settings} />
        <ProjectSections projects={projects} />
        <Timeline events={events} />
        <ContactForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
