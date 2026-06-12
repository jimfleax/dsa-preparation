import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, shortcut, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If there's less than 50px above the element, show tooltip below
      if (rect.top < 50) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    }
    setIsVisible(true);
  };

  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              y: position === "top" ? 5 : -5,
              x: "-50%" 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: "-50%"
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: position === "top" ? 5 : -5,
              x: "-50%"
            }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={`absolute left-1/2 px-2 py-1 bg-white text-neutral-800 text-[10px] font-bold rounded-lg shadow-lg border border-neutral-100 whitespace-nowrap z-[100] pointer-events-none flex items-center gap-2 ${
              position === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <span className="tracking-tight">{content}</span>
            {shortcut && (
              <span className="px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold border border-indigo-100/50 font-mono">
                {shortcut}
              </span>
            )}
            
            {/* Tooltip Arrow */}
            {position === "top" ? (
              <>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-white" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[3.5px] border-[5px] border-transparent border-t-neutral-100 -z-10" />
              </>
            ) : (
              <>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-[5px] border-transparent border-b-white" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[3.5px] border-[5px] border-transparent border-b-neutral-100 -z-10" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
