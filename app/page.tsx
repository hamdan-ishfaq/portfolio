import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Skills } from '@/components/public/Skills';
import { Certifications } from '@/components/public/Certifications';
import { ProjectSections } from '@/components/public/ProjectSections';
import { Timeline } from '@/components/public/Timeline';
import { ContactForm } from '@/components/public/ContactForm';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { DEFAULT_TIMELINE } from '@/lib/content/portfolio';
import type { GlobalSettings } from '@/types';

export const revalidate = 300;

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const { data: settingsData } = await supabase.from('settings').select('*').single();

  const settings = (settingsData as GlobalSettings) ?? null;
  // Curated static timeline for the public rebrand (same pattern as case studies).
  const events = DEFAULT_TIMELINE;

  return (
    <>
      <Navbar settings={settings} />
      <main id="main-content" className="pt-20 sm:pt-24 pb-16 sm:pb-32">
        <Hero settings={settings} />
        <About />
        <Timeline events={events} />
        <Skills />
        <Certifications />
        <ProjectSections />
        <ContactForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
