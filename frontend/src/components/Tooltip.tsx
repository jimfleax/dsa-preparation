import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, shortcut, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 bg-white text-neutral-800 text-[10px] font-bold rounded-xl shadow-lg border border-neutral-100 whitespace-nowrap z-[100] pointer-events-none flex items-center gap-2"
          >
            <span className="tracking-tight">{content}</span>
            {shortcut && (
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-bold border border-indigo-100/50 font-mono">
                {shortcut}
              </span>
            )}
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-[6px] border-transparent border-t-white" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] border-[6px] border-transparent border-t-neutral-100 -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
