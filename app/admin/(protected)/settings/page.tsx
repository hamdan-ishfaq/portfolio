import { getGlobalSettings } from '@/lib/actions/settings';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { SettingsClientWrapper } from './SettingsClientWrapper';
import { notFound } from 'next/navigation';

export default async function AdminSettingsPage() {
  await verifyAdminSession();
  const settings = await getGlobalSettings();
  if (!settings) notFound();

  return <SettingsClientWrapper initialSettings={settings} />;
}
