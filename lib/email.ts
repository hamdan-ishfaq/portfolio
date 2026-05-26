import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, replyTo }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Simulating email sending.');
    console.log(`To: ${to}\nSubject: ${subject}\nText: ${text}`);
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to,
      subject,
      text,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Email failed' };
  }
}
