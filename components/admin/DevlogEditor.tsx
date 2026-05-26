'use client';

import { useState } from 'react';
import type { DevlogEntry, DevlogEntryType, DevlogEntryVersion } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format-date';
import {
  deleteDevlogEntry,
  getDevlogEntries,
  getDevlogVersions,
  upsertDevlogEntry,
} from '@/lib/actions/devlog';

const ENTRY_TYPES: { value: DevlogEntryType; label: string }[] = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'daily_log', label: 'Daily log' },
  { value: 'issue', label: 'Issue' },
  { value: 'fix', label: 'Fix' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'reflection', label: 'Reflection' },
];

type DevlogEditorProps = {
  projectId: string;
  initialEntries: DevlogEntry[];
};

const emptyEntry = {
  type: 'daily_log' as DevlogEntryType,
  title: '',
  content: '',
  entry_date: new Date().toISOString().slice(0, 10),
  linked_entry_id: null as string | null,
  published: false,
};

export function DevlogEditor({ projectId, initialEntries }: DevlogEditorProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyVersions, setHistoryVersions] = useState<DevlogEntryVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEntry);
  const { show: toast } = useToast();

  const issueEntries = entries.filter((e) => e.type === 'issue');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyEntry);
    setModalOpen(true);
  };

  const openEdit = (entry: DevlogEntry) => {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      title: entry.title,
      content: entry.content,
      entry_date: entry.entry_date.slice(0, 10),
      linked_entry_id: entry.linked_entry_id,
      published: entry.published,
    });
    setModalOpen(true);
  };

  const openHistory = async (entry: DevlogEntry) => {
    setHistoryTitle(entry.title);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryVersions([]);

    const versions = await getDevlogVersions(entry.id);
    setHistoryVersions(versions);
    setHistoryLoading(false);
  };

  const refreshEntries = async () => {
    const updated = await getDevlogEntries(projectId, true);
    setEntries(updated);
  };

  const handleSave = async () => {
    const res = await upsertDevlogEntry(projectId, form, editingId ?? undefined);
    if (!res.success) {
      toast(res.error ?? 'Failed to save devlog entry', 'error');
      return;
    }
    toast('Devlog entry saved', 'success');
    setModalOpen(false);
    await refreshEntries();
  };

  const handleDelete = async (entryId: string) => {
    const res = await deleteDevlogEntry(entryId, projectId);
    if (!res.success) {
      toast(res.error ?? 'Failed to delete', 'error');
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast('Entry deleted', 'success');
  };

  return (
    <section className="glass-card rounded-xl p-lg space-y-md">
      <div className="flex items-center justify-between border-b border-white/5 pb-sm">
        <h3 className="font-headline-md text-headline-md text-primary">Devlog</h3>
        <button
          type="button"
          onClick={openCreate}
          className="text-sm px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30"
        >
          New entry
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-4">No devlog entries yet.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {entries.map((entry) => (
            <li key={entry.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-on-surface">{entry.title}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {entry.type} · {entry.entry_date.slice(0, 10)} ·{' '}
                  {entry.published ? 'Published' : 'Draft'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => openHistory(entry)}
                  className="text-sm text-on-surface-variant hover:text-on-surface hover:underline"
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(entry)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="text-sm text-error hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit devlog entry' : 'New devlog entry'}
        id="devlog-editor"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="devlog-type" className="text-xs uppercase text-on-surface-variant">
                Type
              </label>
              <select
                id="devlog-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as DevlogEntryType })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm"
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="devlog-date" className="text-xs uppercase text-on-surface-variant">
                Date
              </label>
              <input
                id="devlog-date"
                type="date"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="devlog-title" className="text-xs uppercase text-on-surface-variant">
              Title
            </label>
            <input
              id="devlog-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm"
            />
          </div>
          {form.type === 'fix' && issueEntries.length > 0 && (
            <div>
              <label htmlFor="devlog-link" className="text-xs uppercase text-on-surface-variant">
                Link to issue
              </label>
              <select
                id="devlog-link"
                value={form.linked_entry_id ?? ''}
                onChange={(e) => setForm({ ...form, linked_entry_id: e.target.value || null })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm"
              >
                <option value="">None</option>
                {issueEntries.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="devlog-content" className="text-xs uppercase text-on-surface-variant">
              Content (Markdown)
            </label>
            <textarea
              id="devlog-content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface text-sm font-mono"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold"
          >
            Save entry
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={`Version history — ${historyTitle}`}
        id="devlog-history"
      >
        {historyLoading ? (
          <p className="text-sm text-on-surface-variant py-4">Loading versions…</p>
        ) : historyVersions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4">
            No prior versions saved yet. Versions are created automatically when you edit content.
          </p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {historyVersions.map((version, index) => (
              <li
                key={version.id}
                className="rounded-lg border border-white/10 bg-surface-container/50 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-primary">
                    Version {historyVersions.length - index}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {formatDateTime(version.saved_at)}
                  </span>
                </div>
                <pre className="text-xs text-on-surface-variant whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                  {version.content.length > 500
                    ? `${version.content.slice(0, 500)}…`
                    : version.content}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </section>
  );
}
