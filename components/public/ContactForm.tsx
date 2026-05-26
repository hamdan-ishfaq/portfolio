'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitContactForm } from '@/lib/actions/contact';
import { sendContactEmail } from '@/lib/email-client';

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  company: z.string().max(100).optional(),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
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
        toast.show('Message sent successfully! I will get back to you soon.', 'success');
        reset();
      } else {
        if (res.error === 'rate_limited') {
          toast.show('You are sending messages too quickly. Please try again later.', 'error');
        } else {
          toast.show('Failed to send message. Please try again.', 'error');
        }
      }
    } catch (err) {
      toast.show('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-container py-12 sm:py-2xl relative" id="contact">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[460px] h-[460px] bg-primary/5 rounded-full blur-[110px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] bg-secondary/5 rounded-full blur-[90px]"></div>
      </div>

      <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
        <div className="space-y-md">
          <div className="inline-flex items-center gap-xs px-sm py-xs rounded-full border border-white/10 bg-white/5 font-label-caps text-label-caps text-primary">
            CONTACT
          </div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Let&apos;s build the next system.
          </h2>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-prose">
            Share your goals, timelines, and technical constraints. I will respond with a clear next
            step and a realistic plan.
          </p>
          <div className="glass-panel rounded-xl p-md text-on-surface-variant text-body-sm font-body-sm border border-white/10">
            Typical response time: 24-48 hours.
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 sm:p-8 md:p-10 border-t border-primary/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label
                  htmlFor="name"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  {...register('name')}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="email"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="company"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                Company (Optional)
              </label>
              <input
                id="company"
                {...register('company')}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm"
                placeholder="Acme Inc."
              />
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="message"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={5}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_0_2px_rgba(14,165,233,0.2)] transition-all font-body-sm resize-y"
                placeholder="How can I help you?"
              ></textarea>
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
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-on-primary inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
