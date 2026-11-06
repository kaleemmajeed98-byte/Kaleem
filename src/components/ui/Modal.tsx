// src/components/ui/Modal.tsx
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-stone-900 text-stone-100 rounded-lg w-full max-w-lg mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-200"
          aria-label="Close modal"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div className="mb-4">{children}</div>
        {footer && <div className="flex justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );
};
