import emailjs from '@emailjs/browser';

type EmailResult = { success: true } | { success: false; skipped?: boolean; error?: string };

function getConfig() {
  return {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '',
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? '',
    contactTemplate: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '',
    demoTemplate: process.env.NEXT_PUBLIC_EMAILJS_DEMO_TEMPLATE_ID ?? '',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? process.env.CONTACT_EMAIL ?? '',
  };
}

function isConfigured(config: ReturnType<typeof getConfig>) {
  return Boolean(config.serviceId && config.publicKey && config.contactEmail);
}

export async function sendContactEmail(params: {
  from_name: string;
  from_email: string;
  company?: string;
  message: string;
}): Promise<EmailResult> {
  const config = getConfig();
  if (!isConfigured(config) || !config.contactTemplate) {
    return { success: false, skipped: true };
  }

  try {
    await emailjs.send(
      config.serviceId,
      config.contactTemplate,
      {
        to_email: config.contactEmail,
        from_name: params.from_name,
        from_email: params.from_email,
        company: params.company ?? '',
        message: params.message,
      },
      { publicKey: config.publicKey }
    );
    return { success: true };
  } catch (error) {
    console.error('EmailJS contact error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Email failed' };
  }
}

export async function sendDemoRequestEmail(params: {
  requester_name: string;
  requester_email: string;
  project_title: string;
  message?: string;
}): Promise<EmailResult> {
  const config = getConfig();
  const template = config.demoTemplate || config.contactTemplate;
  if (!isConfigured(config) || !template) {
    return { success: false, skipped: true };
  }

  try {
    await emailjs.send(
      config.serviceId,
      template,
      {
        to_email: config.contactEmail,
        requester_name: params.requester_name,
        requester_email: params.requester_email,
        project_title: params.project_title,
        message: params.message ?? '',
      },
      { publicKey: config.publicKey }
    );
    return { success: true };
  } catch (error) {
    console.error('EmailJS demo error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Email failed' };
  }
}
