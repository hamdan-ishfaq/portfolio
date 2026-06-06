'use server';

import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import type { GlobalSettings } from '@/types';

const HeroTechItemSchema = z.object({
  label: z.string().min(1).max(40),
  icon: z.string().min(1).max(40),
});

const SettingsUpdateSchema = z
  .object({
    display_name: z.string().max(120).optional(),
    tagline: z.string().max(200).optional(),
    sub_headline: z.string().max(500).optional(),
    avatar_url: z.string().optional(),
    email: z.string().email().optional(),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().nullable().optional().or(z.literal('')),
    seo_title_suffix: z.string().max(120).optional(),
    meta_description: z.string().max(320).optional(),
    hero_tech_stack: z.array(HeroTechItemSchema).max(16).optional(),
  })
  .partial();

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from('settings').select('*').single();

  if (error) {
    console.error(error);
    return null;
  }
  return data as GlobalSettings;
}

export async function updateGlobalSettings(formData: Partial<GlobalSettings>) {
  const decoded = await verifyAdminSession();

  const parsed = SettingsUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    console.error('Validation failed for settings:', parsed.error.format());
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
    };
  }

  const { data: existing } = await adminSupabase.from('settings').select('id').single();

  if (!existing) return { success: false, error: 'No settings record found' };

  const { error } = await adminSupabase
    .from('settings')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', existing.id);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({ event: 'settings_updated', adminUid: decoded.uid });
  revalidatePath('/');
  return { success: true };
}
