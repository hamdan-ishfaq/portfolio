import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Skills } from '@/components/public/Skills';
import { ProjectSections } from '@/components/public/ProjectSections';
import { Timeline } from '@/components/public/Timeline';
import { ContactForm } from '@/components/public/ContactForm';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { DEFAULT_TIMELINE } from '@/lib/content/portfolio';
import type { GlobalSettings, TimelineEvent } from '@/types';

export const revalidate = 300;

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const [settingsRes, timelineRes] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('timeline_events').select('*').order('start_date', { ascending: false }),
  ]);

  const settings = (settingsRes.data as GlobalSettings) ?? null;
  const dbEvents = (timelineRes.data as TimelineEvent[]) ?? [];
  const events = dbEvents.length > 0 ? dbEvents : DEFAULT_TIMELINE;

  return (
    <>
      <Navbar settings={settings} />
      <main id="main-content" className="pt-20 sm:pt-24 pb-16 sm:pb-32">
        <Hero settings={settings} />
        <About />
        <Timeline events={events} />
        <Skills />
        <ProjectSections />
        <ContactForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
