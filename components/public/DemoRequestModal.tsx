'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitDemoRequest } from '@/lib/actions/demo';
import { sendDemoRequestEmail } from '@/lib/email-client';
import { useLocale } from '@/components/providers/LocaleProvider';

type DemoRequestFormValues = {
  name: string;
  email: string;
  message?: string;
};

type DemoRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
};

export function DemoRequestModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: DemoRequestModalProps) {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const demoSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('demoModal.validation.nameRequired')).max(100),
        email: z.string().email(t('demoModal.validation.emailRequired')),
        message: z.string().max(2000).optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DemoRequestFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', email: '', message: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: DemoRequestFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await submitDemoRequest({
        name: data.name,
        email: data.email,
        message: data.message?.trim() || undefined,
        project_id: projectId,
      });

      if (!res.success) {
        if (res.error === 'rate_limited') {
          toast.show(t('demoModal.rateLimited'), 'error');
        } else if (res.error === 'validation_failed') {
          toast.show(t('demoModal.invalid'), 'error');
        } else {
          toast.show(t('demoModal.failed'), 'error');
        }
        return;
      }

      try {
        await sendDemoRequestEmail({
          requester_name: data.name,
          requester_email: data.email,
          project_title: projectTitle,
          message: data.message,
        });
      } catch (emailErr) {
        console.warn('[demo] Email notification failed:', emailErr);
      }

      toast.show(t('demoModal.success'), 'success');
      reset();
      onClose();
    } catch (err) {
      console.error('[demo] submit error:', err);
      toast.show(t('contact.unexpected'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('demoModal.title')} id="demo-request">
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
        {t('demoModal.lead', { project: projectTitle })}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1 text-left">
          <label htmlFor="demo-name" className="text-xs font-medium text-on-surface-variant">
            {t('demoModal.name')}
          </label>
          <input
            id="demo-name"
            autoComplete="name"
            {...register('name')}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            placeholder={t('demoModal.namePlaceholder')}
          />
          {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="demo-email" className="text-xs font-medium text-on-surface-variant">
            {t('demoModal.email')}
          </label>
          <input
            id="demo-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            placeholder={t('demoModal.emailPlaceholder')}
          />
          {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="demo-message" className="text-xs font-medium text-on-surface-variant">
            {t('demoModal.message')}
          </label>
          <textarea
            id="demo-message"
            {...register('message')}
            rows={3}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y text-sm"
            placeholder={t('demoModal.messagePlaceholder')}
          />
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? t('demoModal.submitting') : t('demoModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
