import { ExternalLink, Github, Heart, User } from "lucide-react";
import BaseModal from "./BaseModal";

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="about-me-modal"
      title="About the Creator"
      icon={<User className="w-4 h-4" />}
    >
      {/* Content */}
      <div className="p-8 text-center overflow-y-auto">
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
      
      <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-50 text-center shrink-0">
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
          Have feedback? I'd love to hear it!
        </p>
      </div>
    </BaseModal>
  );
}
