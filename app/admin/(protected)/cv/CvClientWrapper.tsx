'use client';

import type { GlobalSettings } from '@/types';
import { FileUploadInput } from '@/components/admin/FileUploadInput';
import { useToast } from '@/components/ui/Toast';
import { updateGlobalSettings } from '@/lib/actions/settings';
import { formatDateTime } from '@/lib/format-date';

type CvClientWrapperProps = {
  settings: GlobalSettings;
};

export function CvClientWrapper({ settings }: CvClientWrapperProps) {
  const { show: toast } = useToast();

  const handleUpload = async (url: string) => {
    const res = await updateGlobalSettings({ cv_file_url: url });
    if (!res.success) {
      toast(res.error ?? 'Failed to update CV URL', 'error');
      return;
    }
    toast('CV uploaded and linked on homepage', 'success');
  };

  return (
    <div className="max-w-[720px] mx-auto p-md md:p-xl space-y-xl">
      <div>
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
          CV Upload
        </h2>
        <p className="text-on-surface-variant font-body-base mt-2">
          Upload your resume PDF. The navbar download button uses this file.
        </p>
      </div>

      <div className="glass-card rounded-xl p-lg space-y-6">
        {settings.cv_file_url ? (
          <div className="rounded-lg border border-white/10 p-4 bg-surface-container/50">
            <p className="text-sm text-on-surface-variant mb-2">Current CV</p>
            <a
              href={settings.cv_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {settings.cv_file_url}
            </a>
            <p className="text-xs text-on-surface-variant mt-2">
              Last settings update: {formatDateTime(settings.updated_at)}
            </p>
          </div>
        ) : (
          <p className="text-on-surface-variant text-sm">No CV uploaded yet.</p>
        )}

        <FileUploadInput
          bucket="cv"
          path="resume.pdf"
          accept="application/pdf"
          maxSizeMB={5}
          currentUrl={settings.cv_file_url}
          label="Upload PDF (replaces resume.pdf)"
          onUploadComplete={handleUpload}
        />
      </div>
    </div>
  );
}
