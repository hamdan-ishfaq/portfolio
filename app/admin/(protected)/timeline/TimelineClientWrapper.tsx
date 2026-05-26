'use client';

import { useState } from 'react';
import type { TimelineEvent } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { upsertTimelineEvent, deleteTimelineEvent } from '@/lib/actions/timeline';

type TimelineClientWrapperProps = {
  initialEvents: TimelineEvent[];
};

const emptyForm: Partial<TimelineEvent> = {
  type: 'corporate',
  title: '',
  organization: '',
  location: '',
  date_range: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: null,
  description: [],
  logo_url: null,
  order: 0,
};

export function TimelineClientWrapper({ initialEvents }: TimelineClientWrapperProps) {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<TimelineEvent>>(emptyForm);
  const [descriptionText, setDescriptionText] = useState('');
  const { show: toast } = useToast();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDescriptionText('');
    setModalOpen(true);
  };

  const openEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setForm(event);
    setDescriptionText((event.description ?? []).join('\n'));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      description: descriptionText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    };
    const res = await upsertTimelineEvent(payload, editingId ?? undefined);
    if (!res.success) {
      toast(res.error ?? 'Failed to save event', 'error');
      return;
    }
    toast('Timeline event saved', 'success');
    setModalOpen(false);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTimelineEvent(id);
    if (!res.success) {
      toast(res.error ?? 'Failed to delete', 'error');
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast('Event deleted', 'success');
  };

  return (
    <div className="max-w-[1200px] mx-auto p-md md:p-xl space-y-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
            Timeline
          </h2>
          <p className="text-on-surface-variant font-body-base mt-2">
            Manage academic, corporate, and achievement history.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-semibold hover:scale-[1.02] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Event
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {events.length === 0 ? (
          <p className="p-8 text-on-surface-variant text-center">No timeline events yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/30"
              >
                <div>
                  <p className="font-semibold text-on-surface">{event.title}</p>
                  <p className="text-sm text-on-surface-variant">
                    {event.organization} · {event.date_range || event.start_date}
                  </p>
                  <span className="inline-block mt-1 text-xs uppercase tracking-wide text-primary">
                    {event.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1.5 rounded-lg border border-error/30 text-error text-sm hover:bg-error/10"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Event' : 'New Event'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-on-surface-variant">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as TimelineEvent['type'] })
                }
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
              >
                <option value="academic">Academic</option>
                <option value="corporate">Corporate</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-on-surface-variant">Order</label>
              <input
                type="number"
                value={form.order ?? 0}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase text-on-surface-variant">Title</label>
            <input
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-on-surface-variant">Organization</label>
              <input
                value={form.organization ?? ''}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-on-surface-variant">Location</label>
              <input
                value={form.location ?? ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase text-on-surface-variant">
              Date range (display)
            </label>
            <input
              value={form.date_range ?? ''}
              onChange={(e) => setForm({ ...form, date_range: e.target.value })}
              placeholder="2022 — Present"
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-on-surface-variant">
              Description (one bullet per line)
            </label>
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              rows={4}
              className="w-full mt-1 bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold"
          >
            Save Event
          </button>
        </div>
      </Modal>
    </div>
  );
}
