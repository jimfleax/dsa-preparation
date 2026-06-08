import { Loader2, RefreshCw } from "lucide-react";

interface SyncToastProps {
  count: number;
  onTrack: () => void;
  onDismiss: () => void;
  isProcessing: boolean;
}

export default function SyncToast({ count, onTrack, onDismiss, isProcessing }: SyncToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-2xl p-5 w-[340px] flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{count} new LeetCode submissions found</h3>
            <p className="text-xs text-neutral-500 mt-1">Track them in your problem list?</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-50">
          <button
            onClick={onDismiss}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50"
          >
            No, Dismiss
          </button>
          <button
            onClick={onTrack}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing</> : "Yes, Track All"}
          </button>
        </div>
      </div>
    </div>
  );
}
