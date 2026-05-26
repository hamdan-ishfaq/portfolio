'use client';

import { useState, useRef } from 'react';
import { uploadAdminFile } from '@/lib/actions/upload';

type FileUploadInputProps = {
  bucket: string;
  path: string;
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  label?: string;
  onUploadComplete: (url: string) => void;
};

export function FileUploadInput({
  bucket,
  path,
  accept = 'image/*',
  maxSizeMB = 10,
  currentUrl,
  label = 'Upload file',
  onUploadComplete,
}: FileUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadAdminFile(formData, bucket, path);

    if (!res.success) {
      setError(res.error);
      setUploading(false);
      return;
    }

    onUploadComplete(res.url);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline break-all"
        >
          Current file
        </a>
      )}
      <label className="font-label-caps text-label-caps text-on-surface-variant block">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-container file:text-on-primary-container hover:file:opacity-90 disabled:opacity-50"
      />
      {uploading && <p className="text-sm text-on-surface-variant">Uploading…</p>}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
