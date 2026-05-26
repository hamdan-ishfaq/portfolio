'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { submitComment } from '@/lib/actions/comments';

type ProjectCommentFormProps = {
  projectId: string;
};

export function ProjectCommentForm({ projectId }: ProjectCommentFormProps) {
  const toast = useToast();
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!authorName.trim()) {
      toast.show('Please enter your name', 'error');
      return;
    }
    if (content.trim().length < 20) {
      toast.show('Comment must be at least 20 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitComment(projectId, {
        author_name: authorName.trim(),
        content: content.trim(),
      });

      if (res.success) {
        toast.show('Comment submitted for moderation. Thank you!', 'success');
        setAuthorName('');
        setContent('');
      } else if (res.error === 'rate_limited') {
        toast.show('Too many comments. Please try again later.', 'error');
      } else {
        toast.show('Failed to submit comment. Please try again.', 'error');
      }
    } catch {
      toast.show('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-md rounded-xl flex gap-md">
      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 border border-white/10 flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined">person</span>
      </div>
      <div className="flex-grow space-y-sm">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[100px] placeholder:text-on-surface-variant/50"
          placeholder="Ask a question or leave a comment..."
          maxLength={1000}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-md py-sm bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps hover:bg-primary transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}
