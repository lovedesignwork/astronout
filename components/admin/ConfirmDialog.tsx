'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Control dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      confirmButtonRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle escape key and backdrop click
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = (e: Event) => {
      if (!isLoading) {
        e.preventDefault();
        onClose();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog && !isLoading) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleClose);
    dialog.addEventListener('click', handleClick);
    
    return () => {
      dialog.removeEventListener('cancel', handleClose);
      dialog.removeEventListener('click', handleClick);
    };
  }, [isLoading, onClose]);

  const variantConfig = {
    danger: {
      icon: (
        <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      iconBg: 'bg-error/10 text-error',
      button: 'btn-error',
    },
    warning: {
      icon: (
        <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      iconBg: 'bg-warning/10 text-warning',
      button: 'btn-warning',
    },
    info: {
      icon: (
        <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
      iconBg: 'bg-info/10 text-info',
      button: 'btn-info',
    },
  };

  const config = variantConfig[variant];

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-md">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-base-content">
              {title}
            </h3>
            <p className="mt-2 text-sm text-base-content/70">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn ${config.button}`}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={isLoading} onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
