'use client';

import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="bottom-sheet-overlay animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="bottom-sheet animate-slideUp max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
      >
        <div className="mx-auto max-w-md">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            {title && (
              <h2 id="sheet-title" className="text-2xl font-semibold">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-2 transition-smooth hover:bg-muted"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">{children}</div>
        </div>
      </div>
    </>
  );
}
