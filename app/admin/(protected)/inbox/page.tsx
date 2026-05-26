import { getContactSubmissionsAdmin, getDemoRequestsAdmin } from '@/lib/actions/inbox';
import { InboxClientWrapper } from './InboxClientWrapper';

export default async function AdminInboxPage() {
  const [contacts, demos] = await Promise.all([
    getContactSubmissionsAdmin(),
    getDemoRequestsAdmin(),
  ]);

  return <InboxClientWrapper contacts={contacts} demos={demos} />;
}
