'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { useToast } from '@/components/ui/Toast';
import { submitContactForm } from '@/lib/actions/contact';
import { sendContactEmail } from '@/lib/email-client';
import { useLocale } from '@/components/providers/LocaleProvider';

type ContactFormValues = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

export function ContactForm() {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('contact.validation.nameRequired')).max(100),
        email: z.string().email(t('contact.validation.emailRequired')),
        company: z.string().max(100).optional(),
        message: z.string().min(20, t('contact.validation.messageMin')).max(2000),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await submitContactForm(data);
      if (res.success) {
        try {
          await sendContactEmail({
            from_name: data.name,
            from_email: data.email,
            company: data.company,
            message: data.message,
          });
        } catch (emailErr) {
          console.warn('[contact] Email notification failed:', emailErr);
        }
        toast.show(t('contact.success'), 'success');
        reset();
      } else {
        if (res.error === 'rate_limited') {
          toast.show(t('contact.rateLimited'), 'error');
        } else {
          toast.show(t('contact.failed'), 'error');
        }
      }
    } catch {
      toast.show(t('contact.unexpected'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container section-block relative" id="contact">
      <div className="section-divider mb-12 sm:mb-16" />

      <FadeIn>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
          <div className="space-y-5">
            <p className="type-label">{t('contact.label')}</p>
            <h2 className="type-section">
              {t('contact.titleBefore')}{' '}
              <span className="type-accent-serif">{t('contact.titleAccent')}</span>
              {t('contact.titleAfter')}
            </h2>
            <p className="type-lead">{t('contact.lead')}</p>
            <p className="font-mono text-xs text-on-surface-variant">{t('contact.replyTime')}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 sm:p-8 border border-white/10 card-interactive">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="name"
                    className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  >
                    {t('contact.name')}
                  </label>
                  <input
                    id="name"
                    {...register('name')}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                    placeholder={t('contact.namePlaceholder')}
                  />
                  {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="email"
                    className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  >
                    {t('contact.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="company"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                >
                  {t('contact.company')}
                </label>
                <input
                  id="company"
                  {...register('company')}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                  placeholder={t('contact.companyPlaceholder')}
                />
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="message"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                >
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={5}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm resize-y"
                  placeholder={t('contact.messagePlaceholder')}
                />
                {errors.message && <p className="text-xs text-error">{errors.message.message}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? t('common.sending') : t('contact.send')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
