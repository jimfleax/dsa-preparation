import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteUserModal({ 
  user, 
  onClose, 
  onConfirm 
}: { 
  user: any; 
  onClose: () => void; 
  onConfirm: (deleteProgress: boolean) => Promise<void> 
}) {
  const [deleteProgress, setDeleteProgress] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm(deleteProgress);
    // Don't need to setIsLoading(false) because modal will close
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Delete User Account</h2>
          <p className="text-sm text-neutral-500 font-medium mb-6">
            Are you sure you want to delete <strong className="text-neutral-900">{user.name || user.email}</strong>? This action is permanent and cannot be undone.
          </p>

          <label className="flex items-start gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
            <input 
              type="checkbox" 
              checked={deleteProgress}
              onChange={(e) => setDeleteProgress(e.target.checked)}
              disabled={isDeleting}
              className="mt-1 w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500"
            />
            <span className="text-sm font-medium text-rose-900">
              Also delete all progress problems the user has completed in the database.
            </span>
          </label>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}
