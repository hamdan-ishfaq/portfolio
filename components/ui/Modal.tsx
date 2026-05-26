'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  id?: string;
};

export function Modal({ isOpen, onClose, title, children, id }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, [isOpen]);

  const handleBackdropClose = () => {
    if (Date.now() - openedAtRef.current < 200) return;
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleBackdropClose}
      />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id ?? 'modal'}-title`}
          className="pointer-events-auto w-[min(100vw,32rem)] max-h-[90vh] overflow-y-auto glass-card rounded-t-2xl sm:rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />

          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
            <h2
              id={`${id ?? 'modal'}-title`}
              className="text-base font-semibold text-on-surface pr-4"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 sm:px-6 py-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
