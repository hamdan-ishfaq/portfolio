'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { submitComment } from '@/lib/actions/comments';
import { useLocale } from '@/components/providers/LocaleProvider';

type ProjectCommentFormProps = {
  projectId: string;
};

export function ProjectCommentForm({ projectId }: ProjectCommentFormProps) {
  const { t } = useLocale();
  const toast = useToast();
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!authorName.trim()) {
      toast.show(t('comments.nameRequired'), 'error');
      return;
    }
    if (content.trim().length < 20) {
      toast.show(t('comments.contentMin'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitComment(projectId, {
        author_name: authorName.trim(),
        content: content.trim(),
      });

      if (res.success) {
        toast.show(t('comments.success'), 'success');
        setAuthorName('');
        setContent('');
      } else if (res.error === 'rate_limited') {
        toast.show(t('comments.rateLimited'), 'error');
      } else {
        toast.show(t('comments.failed'), 'error');
      }
    } catch {
      toast.show(t('comments.unexpected'), 'error');
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
          placeholder={t('comments.namePlaceholder')}
          maxLength={100}
          className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[100px] placeholder:text-on-surface-variant/50"
          placeholder={t('comments.contentPlaceholder')}
          maxLength={1000}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-md py-sm bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps hover:bg-primary transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('comments.submitting') : t('comments.post')}
          </button>
        </div>
      </div>
    </div>
  );
}
