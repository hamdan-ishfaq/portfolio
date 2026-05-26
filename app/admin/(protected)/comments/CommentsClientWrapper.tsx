'use client';

import { useState } from 'react';
import type { ProjectComment } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  approveComment,
  rejectComment,
  deleteComment,
  bulkUpdateCommentStatus,
} from '@/lib/actions/comments';
import { formatDate } from '@/lib/format-date';

type CommentWithProject = ProjectComment & {
  project_title: string;
  project_slug: string;
};

type CommentsClientWrapperProps = {
  initialComments: CommentWithProject[];
};

export function CommentsClientWrapper({ initialComments }: CommentsClientWrapperProps) {
  const [comments, setComments] = useState(initialComments);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { show: toast } = useToast();

  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleApprove = async (comment: CommentWithProject) => {
    const res = await approveComment(comment.id, comment.project_slug);
    if (!res.success) {
      toast(res.error ?? 'Failed to approve comment', 'error');
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, status: 'approved' as const } : c))
    );
    toast('Comment approved', 'success');
  };

  const handleReject = async (comment: CommentWithProject) => {
    const res = await rejectComment(comment.id);
    if (!res.success) {
      toast(res.error ?? 'Failed to reject comment', 'error');
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, status: 'rejected' as const } : c))
    );
    toast('Comment rejected', 'success');
  };

  const handleBulkUpdate = async (status: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) return;

    const idsArray = Array.from(selectedIds);
    const slugs = comments.filter((c) => idsArray.includes(c.id)).map((c) => c.project_slug);

    const res = await bulkUpdateCommentStatus(idsArray, status, slugs);
    if (!res.success) {
      toast(res.error ?? 'Failed to update comments', 'error');
      return;
    }

    setComments((prev) => prev.map((c) => (idsArray.includes(c.id) ? { ...c, status } : c)));
    setSelectedIds(new Set());
    toast(`${idsArray.length} comments ${status}`, 'success');
  };

  const handleDelete = async (id: string) => {
    const res = await deleteComment(id);
    if (!res.success) {
      toast(res.error ?? 'Failed to delete comment', 'error');
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast('Comment deleted', 'success');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-2xl relative h-full">
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-md md:px-xl pt-lg md:pt-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div>
            <div className="flex items-center gap-sm mb-2">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tighter">
                Comment Moderation
              </h1>
              <span className="bg-error/10 text-error border border-error/20 px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                {pendingCommentsCount} Pending
              </span>
            </div>
            <p className="text-on-surface-variant max-w-2xl">
              Review, approve, or remove user comments across all active projects.
            </p>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2xl text-center glass-card rounded-xl mt-lg border border-dashed border-white/10">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              No comments found
            </h3>
            <p className="text-on-surface-variant max-w-[24rem]">
              There are no comments on any projects yet.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="bg-surface-container-low/50 border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    className="rounded border-outline-variant bg-transparent focus:ring-primary/50 text-primary"
                    checked={selectedIds.size === comments.length && comments.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                  <label
                    htmlFor="selectAll"
                    className="text-sm text-on-surface-variant select-none cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
                <span className="text-sm text-on-surface-variant">
                  <span className="font-bold text-on-surface">{selectedIds.size}</span> selected
                </span>
              </div>
              <div
                className={`flex items-center gap-2 ${selectedIds.size === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <button
                  onClick={() => handleBulkUpdate('rejected')}
                  className="px-3 py-1.5 rounded-md text-sm border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => handleBulkUpdate('approved')}
                  className="px-3 py-1.5 rounded-md text-sm bg-gradient-to-r from-primary-container/20 to-primary/20 border border-primary/30 text-primary"
                >
                  Approve Selected
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest/30 border-b border-white/5 text-on-surface-variant font-label-caps text-label-caps">
                    <th className="p-4 w-[48px]"></th>
                    <th className="p-4 font-semibold">Author</th>
                    <th className="p-4 font-semibold">Comment</th>
                    <th className="p-4 font-semibold">Context</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className={`group hover:bg-surface-container-lowest/50 transition-colors ${comment.status === 'pending' ? 'bg-surface-container-low/20' : ''}`}
                    >
                      <td className="p-4 align-top">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant mt-1 bg-transparent focus:ring-primary/50 text-primary"
                          checked={selectedIds.has(comment.id)}
                          onChange={(e) => toggleSelect(comment.id, e.target.checked)}
                        />
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-medium text-on-surface flex items-center gap-2">
                          {comment.author_name}
                          {comment.status === 'pending' && (
                            <span className="bg-error/20 text-error px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                              Pending
                            </span>
                          )}
                          {comment.status === 'approved' && (
                            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                              Approved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top w-2/5">
                        <p className="text-sm text-on-surface leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                          {comment.content}
                        </p>
                      </td>
                      <td className="p-4 align-top">
                        <span className="text-xs text-secondary">{comment.project_title}</span>
                        <div className="text-xs text-on-surface-variant mt-1">
                          {formatDate(comment.created_at)}
                        </div>
                      </td>
                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          {comment.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(comment)}
                              className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10"
                              title="Approve"
                            >
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                          )}
                          {comment.status === 'pending' && (
                            <button
                              onClick={() => handleReject(comment)}
                              className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
