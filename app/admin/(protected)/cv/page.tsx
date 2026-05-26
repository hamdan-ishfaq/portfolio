import { getGlobalSettings } from '@/lib/actions/settings';
import { verifyAdminSession } from '@/lib/auth/verify-session';
import { CvClientWrapper } from './CvClientWrapper';
import { notFound } from 'next/navigation';

export default async function AdminCvPage() {
  await verifyAdminSession();
  const settings = await getGlobalSettings();
  if (!settings) notFound();

  return <CvClientWrapper settings={settings} />;
}
