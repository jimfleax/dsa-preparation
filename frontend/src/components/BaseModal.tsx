import { ReactNode } from "react";
import { X } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";
import FormAlert from "./FormAlert";

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
  error?: ReactNode | null;
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
  error = null,
}: BaseModalProps) {
  useEscapeKey(isOpen, onClose, 50, modalId);

  if (!isOpen) return null;

  const closeButtonClasses =
    "p-2 rounded-xl text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer hover:bg-neutral-100 shrink-0";

  return (
    <>
      <div
        id={`${modalId}-backdrop`}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-[#F4F1FA]/60 backdrop-blur-md transition-opacity"
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
          className={`bg-white/80 backdrop-blur-2xl w-full ${maxWidthClass} rounded-[40px] shadow-clay-surface border-2 border-white/60 flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200 relative`}
        >
          {absoluteClose && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className={`absolute right-4 top-4 z-10 ${closeButtonClasses}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {!hideHeader && (
            <div className="flex items-center justify-between px-6 py-4 shrink-0 rounded-t-[40px]">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shadow-clay-button border border-white/80">
                    {icon}
                  </div>
                )}
                <div>
                  <h2
                    id={`${modalId}-title`}
                    className="text-sm font-bold text-neutral-900 line-clamp-1"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <div className="text-[11px] text-neutral-400 font-medium line-clamp-1 mt-0.5">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={`ml-4 ${closeButtonClasses}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {error && (
            <div className="px-6 pt-4 pb-0 shrink-0 relative z-20">
              <FormAlert type="error" message={error} />
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
}
