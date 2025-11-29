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
        {/* Handle Bar */}
        <div className="flex justify-center pb-4 pt-2">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Title */}
        {title && (
          <h2 id="sheet-title" className="px-6 pb-4 text-xl font-semibold">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </>
  );
}
