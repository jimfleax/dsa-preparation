import { ReactNode } from "react";
import { X } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalId: string;
  children: ReactNode;

  // Header Props
  title?: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  
  // Options
  maxWidthClass?: string;
  hideHeader?: boolean;
  absoluteClose?: boolean;
}

export default function BaseModal({
  isOpen,
  onClose,
  modalId,
  children,
  title,
  subtitle,
  icon,
  maxWidthClass = "max-w-md",
  hideHeader = false,
  absoluteClose = false,
}: BaseModalProps) {
  useEscapeKey(isOpen, onClose, 50, modalId);

  if (!isOpen) return null;

  return (
    <>
      <div
        id={`${modalId}-backdrop`}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalId}-title` : undefined}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={`bg-white w-full ${maxWidthClass} rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200 relative`}
        >
          {absoluteClose && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {!hideHeader && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-neutral-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    {icon}
                  </div>
                )}
                <div>
                  <h2 id={`${modalId}-title`} className="text-sm font-bold text-neutral-900 line-clamp-1">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[11px] text-neutral-400 font-medium line-clamp-1 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer bg-white border border-neutral-200 shadow-sm ml-4 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
}
