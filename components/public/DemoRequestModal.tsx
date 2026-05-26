'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitDemoRequest } from '@/lib/actions/demo';
import { sendDemoRequestEmail } from '@/lib/email-client';

const DemoRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  message: z.string().max(2000).optional(),
});

type DemoRequestFormValues = z.infer<typeof DemoRequestSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DemoRequestFormValues>({
    resolver: zodResolver(DemoRequestSchema),
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
          toast.show('You are sending requests too quickly. Please try again later.', 'error');
        } else if (res.error === 'validation_failed') {
          toast.show('Please check your name and email, then try again.', 'error');
        } else {
          toast.show('Failed to submit request. Please try again.', 'error');
        }
        return;
      }

      // Email notification is best-effort — do not fail the request if EmailJS is not configured.
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

      toast.show('Demo request submitted successfully!', 'success');
      reset();
      onClose();
    } catch (err) {
      console.error('[demo] submit error:', err);
      toast.show('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Live Demo" id="demo-request">
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
        I&apos;m currently offering live guided walkthroughs of{' '}
        <strong className="text-on-surface">{projectTitle}</strong> to engineering teams. Fill out
        the form below to schedule a session.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1 text-left">
          <label htmlFor="demo-name" className="text-xs font-medium text-on-surface-variant">
            Name
          </label>
          <input
            id="demo-name"
            autoComplete="name"
            {...register('name')}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            placeholder="Your name"
          />
          {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="demo-email" className="text-xs font-medium text-on-surface-variant">
            Work Email
          </label>
          <input
            id="demo-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            placeholder="you@company.com"
          />
          {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="demo-message" className="text-xs font-medium text-on-surface-variant">
            Message (Optional)
          </label>
          <textarea
            id="demo-message"
            {...register('message')}
            rows={3}
            className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y text-sm"
            placeholder="Preferred time, team size, or questions..."
          />
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
