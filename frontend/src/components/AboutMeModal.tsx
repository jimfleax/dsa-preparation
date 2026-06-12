import { X, ExternalLink, Github, Heart, User } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  useEscapeKey(isOpen, onClose, 50, "about-me-modal");

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden pointer-events-auto flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50 bg-neutral-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-neutral-900">About the Creator</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
               <Heart className="w-10 h-10 fill-current" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Hi! I'm Reetabrata</h3>
            
            <p className="text-sm text-neutral-600 leading-relaxed mb-8 font-medium">
              I built this tool to structure my own DSA journey and keep track of my progress effectively. 
              Seeing it come together, I realized it could be just as helpful for fellow developers. 
              I hope it helps you stay consistent and crush your preparation!
            </p>

            <div className="grid gap-3">
              <a 
                href="https://jimfleax.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Portfolio
              </a>
              <a 
                href="https://github.com/jimfleax/dsa-preparation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-2xl font-bold text-sm transition-all active:scale-95"
              >
                <Github className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-50 text-center">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              Have feedback? I'd love to hear it!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
