import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

interface FormAlertProps {
  type: "error" | "success" | "warning";
  message: ReactNode;
  className?: string;
}

export default function FormAlert({ type, message, className = "" }: FormAlertProps) {
  if (!message) return null;

  if (type === "error") {
    return (
      <div className={`flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium shrink-0 ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    );
  }

  if (type === "success") {
    return (
      <div className={`flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium shrink-0 ${className}`}>
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (type === "warning") {
    return (
      <div className={`flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium shrink-0 ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <span>{message}</span>
      </div>
    );
  }

  return null;
}
