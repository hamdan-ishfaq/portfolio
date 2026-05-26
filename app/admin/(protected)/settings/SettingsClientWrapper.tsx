'use client';

import { useState } from 'react';
import type { GlobalSettings, HeroTechItem } from '@/types';
import { DEFAULT_HERO_TECH_STACK } from '@/lib/defaults/hero-tech-stack';
import { FileUploadInput } from '@/components/admin/FileUploadInput';
import { useToast } from '@/components/ui/Toast';
import { updateGlobalSettings } from '@/lib/actions/settings';

type SettingsClientWrapperProps = {
  initialSettings: GlobalSettings;
};

function normalizeHeroStack(stack: HeroTechItem[] | null | undefined): HeroTechItem[] {
  if (stack && stack.length > 0) return stack;
  return DEFAULT_HERO_TECH_STACK;
}

export function SettingsClientWrapper({ initialSettings }: SettingsClientWrapperProps) {
  const [form, setForm] = useState({
    ...initialSettings,
    hero_tech_stack: normalizeHeroStack(initialSettings.hero_tech_stack),
  });
  const [saving, setSaving] = useState(false);
  const { show: toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateTechItem = (index: number, field: keyof HeroTechItem, value: string) => {
    setForm((prev) => ({
      ...prev,
      hero_tech_stack: prev.hero_tech_stack.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addTechItem = () => {
    setForm((prev) => ({
      ...prev,
      hero_tech_stack: [...prev.hero_tech_stack, { label: 'New skill', icon: 'code' }],
    }));
  };

  const removeTechItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      hero_tech_stack: prev.hero_tech_stack.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateGlobalSettings({
      display_name: form.display_name,
      tagline: form.tagline,
      sub_headline: form.sub_headline,
      avatar_url: form.avatar_url,
      email: form.email,
      github: form.github,
      linkedin: form.linkedin,
      twitter: form.twitter,
      seo_title_suffix: form.seo_title_suffix,
      meta_description: form.meta_description,
      hero_tech_stack: form.hero_tech_stack.filter((item) => item.label.trim()),
    });
    setSaving(false);
    if (!res.success) {
      toast(res.error ?? 'Failed to save settings', 'error');
      return;
    }
    toast('Settings saved', 'success');
  };

  return (
    <div className="max-w-[800px] mx-auto p-md md:p-xl space-y-xl">
      <div>
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
          Settings
        </h2>
        <p className="text-on-surface-variant font-body-base mt-2">
          Global identity, social links, and SEO defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-xl p-lg space-y-6">
        <FileUploadInput
          bucket="avatars"
          path="profile.webp"
          accept="image/*"
          maxSizeMB={2}
          currentUrl={form.avatar_url}
          label="Avatar"
          onUploadComplete={async (url) => {
            setForm((prev) => ({ ...prev, avatar_url: url }));
            const res = await updateGlobalSettings({ avatar_url: url });
            if (res.success) toast('Avatar uploaded', 'success');
            else toast(res.error ?? 'Failed to save avatar', 'error');
          }}
        />

        <div className="grid grid-cols-1 gap-4">
          {(
            [
              { name: 'display_name' as const, label: 'Display name' },
              { name: 'tagline' as const, label: 'Tagline' },
              { name: 'sub_headline' as const, label: 'Sub-headline' },
              { name: 'email' as const, label: 'Contact email' },
              { name: 'github' as const, label: 'GitHub URL' },
              { name: 'linkedin' as const, label: 'LinkedIn URL' },
              { name: 'twitter' as const, label: 'Twitter URL (optional)' },
              { name: 'seo_title_suffix' as const, label: 'SEO title suffix' },
            ] as const
          ).map(({ name, label }) => (
            <div key={name}>
              <label htmlFor={name} className="text-xs uppercase text-on-surface-variant">
                {label}
              </label>
              <input
                id={name}
                name={name}
                value={form[name] ?? ''}
                onChange={handleChange}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
              />
            </div>
          ))}
          <div>
            <label htmlFor="meta_description" className="text-xs uppercase text-on-surface-variant">
              Meta description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
            />
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Homepage tech stack
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Shown in the hero grid. Icon names from{' '}
                <a
                  href="https://fonts.google.com/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Material Symbols
                </a>{' '}
                (e.g. <code className="text-xs">code</code>, <code className="text-xs">cloud</code>
                ).
              </p>
            </div>
            <button
              type="button"
              onClick={addTechItem}
              className="text-sm px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 shrink-0"
            >
              Add item
            </button>
          </div>

          <ul className="space-y-3">
            {form.hero_tech_stack.map((item, index) => (
              <li
                key={index}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end rounded-lg border border-white/10 bg-surface-container/50 p-3"
              >
                <div>
                  <label className="text-xs uppercase text-on-surface-variant">Label</label>
                  <input
                    value={item.label}
                    onChange={(e) => updateTechItem(index, 'label', e.target.value)}
                    className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm"
                    placeholder="Python"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-on-surface-variant">Icon</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-primary text-xl shrink-0">
                      {item.icon || 'code'}
                    </span>
                    <input
                      value={item.icon}
                      onChange={(e) => updateTechItem(index, 'icon', e.target.value)}
                      className="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm font-mono"
                      placeholder="code"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTechItem(index)}
                  className="text-sm text-error hover:underline px-2 py-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
