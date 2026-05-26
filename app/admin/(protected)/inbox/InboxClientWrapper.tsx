'use client';

import { useState } from 'react';
import type { ContactSubmission } from '@/types';
import type { DemoRequestWithProject } from '@/lib/actions/inbox';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { updateContactSubmissionStatus, updateDemoRequestStatus } from '@/lib/actions/inbox';
import { formatDateTime } from '@/lib/format-date';

type InboxClientWrapperProps = {
  contacts: ContactSubmission[];
  demos: DemoRequestWithProject[];
};

export function InboxClientWrapper({
  contacts: initialContacts,
  demos: initialDemos,
}: InboxClientWrapperProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [demos, setDemos] = useState(initialDemos);
  const [contactFilter, setContactFilter] = useState<'all' | ContactSubmission['status']>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { show: toast } = useToast();

  const filteredContacts =
    contactFilter === 'all' ? contacts : contacts.filter((c) => c.status === contactFilter);

  const updateContact = async (id: string, status: ContactSubmission['status']) => {
    const res = await updateContactSubmissionStatus(id, status);
    if (!res.success) {
      toast(res.error ?? 'Update failed', 'error');
      return;
    }
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast('Contact updated', 'success');
  };

  const updateDemo = async (id: string, status: 'pending' | 'processed') => {
    const res = await updateDemoRequestStatus(id, status);
    if (!res.success) {
      toast(res.error ?? 'Update failed', 'error');
      return;
    }
    setDemos((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    toast('Demo request updated', 'success');
  };

  return (
    <div className="max-w-[1200px] mx-auto p-md md:p-xl space-y-xl">
      <div>
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
          Inbox
        </h2>
        <p className="text-on-surface-variant font-body-base mt-2">
          Contact messages and live demo requests.
        </p>
      </div>

      <Tabs
        defaultTab="contact"
        tabs={[
          {
            id: 'contact',
            label: `Contact (${contacts.length})`,
            content: (
              <div className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setContactFilter(f)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        contactFilter === f
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'border-white/10 text-on-surface-variant'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="glass-card rounded-xl divide-y divide-white/5">
                  {filteredContacts.length === 0 ? (
                    <p className="p-8 text-center text-on-surface-variant">No messages.</p>
                  ) : (
                    filteredContacts.map((c) => (
                      <div key={c.id} className="p-4">
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        >
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-on-surface">{c.name}</span>
                            <span className="text-xs uppercase text-on-surface-variant">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant">
                            {c.email} · {formatDateTime(c.created_at)}
                          </p>
                        </button>
                        {expandedId === c.id && (
                          <div className="mt-3 space-y-3">
                            <p className="text-sm text-on-surface whitespace-pre-wrap">
                              {c.message}
                            </p>
                            <div className="flex gap-2">
                              {c.status !== 'read' && (
                                <button
                                  type="button"
                                  onClick={() => updateContact(c.id, 'read')}
                                  className="px-3 py-1 text-sm rounded-lg border border-white/10 hover:bg-white/5"
                                >
                                  Mark read
                                </button>
                              )}
                              {c.status !== 'archived' && (
                                <button
                                  type="button"
                                  onClick={() => updateContact(c.id, 'archived')}
                                  className="px-3 py-1 text-sm rounded-lg border border-white/10 hover:bg-white/5"
                                >
                                  Archive
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ),
          },
          {
            id: 'demo',
            label: `Demo requests (${demos.length})`,
            content: (
              <div className="glass-card rounded-xl divide-y divide-white/5 mt-4">
                {demos.length === 0 ? (
                  <p className="p-8 text-center text-on-surface-variant">No demo requests.</p>
                ) : (
                  demos.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-on-surface">{d.name}</p>
                        <a
                          href={`mailto:${d.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {d.email}
                        </a>
                        <p className="text-sm text-on-surface-variant mt-1">
                          Project: {d.project_title}
                        </p>
                        {d.message && <p className="text-sm text-on-surface mt-2">{d.message}</p>}
                        <p className="text-xs text-on-surface-variant mt-1">
                          {formatDateTime(d.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase text-on-surface-variant">
                          {d.status}
                        </span>
                        {d.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateDemo(d.id, 'processed')}
                            className="px-3 py-1.5 text-sm rounded-lg bg-primary/20 text-primary border border-primary/30"
                          >
                            Mark processed
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
