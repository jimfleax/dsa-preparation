import { ElementType, ReactNode, ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

export interface CardProps<T extends ElementType = "div"> {
  as?: T;
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg" | "responsive";
  interactive?: boolean;
  hoverEffect?: "none" | "lift" | "glow";
  hoverColor?: "indigo" | "emerald" | "purple" | "rose" | "neutral";
  className?: string;
  gradientBackground?: boolean;
}

export function Card<T extends ElementType = "div">({
  as,
  children,
  padding = "md",
  interactive = false,
  hoverEffect = "none",
  hoverColor = "neutral",
  className,
  gradientBackground = false,
  ...props
}: CardProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof CardProps<T>>) {
  const Component = as || (interactive ? "button" : "div");

  const baseStyles =
    "bg-white/70 backdrop-blur-xl rounded-[32px] relative transition-all duration-500 text-left";

  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
    responsive: "p-6 sm:p-8",
  }[padding];

  const interactiveStyles = interactive
    ? "cursor-pointer group focus:outline-none block"
    : "";

  let borderStyles = "shadow-clay-card border-2 border-white/40";

  let effectStyles = "";
  if (hoverEffect === "lift" || hoverEffect === "glow") {
    effectStyles =
      "hover:-translate-y-2 hover:shadow-clay-surface active:shadow-clay-pressed active:scale-[0.98]";

    if (hoverEffect === "glow") {
      const colorMap = {
        indigo: "hover:border-indigo-300",
        emerald: "hover:border-emerald-300",
        purple: "hover:border-purple-300",
        rose: "hover:border-rose-300",
        neutral: "hover:border-neutral-200",
      };
      effectStyles += ` ${colorMap[hoverColor]}`;
    }
  }

  return (
    <Component
      className={cn(
        baseStyles,
        paddingStyles,
        interactiveStyles,
        borderStyles,
        effectStyles,
        className,
      )}
      {...props}
    >
      {gradientBackground && hoverEffect === "glow" && (
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl",
            {
              "bg-gradient-to-br from-indigo-50/50 to-transparent":
                hoverColor === "indigo",
              "bg-gradient-to-br from-emerald-50/50 to-transparent":
                hoverColor === "emerald",
              "bg-gradient-to-br from-purple-50/50 to-transparent":
                hoverColor === "purple",
              "bg-gradient-to-br from-rose-50/50 to-transparent":
                hoverColor === "rose",
              "bg-gradient-to-br from-neutral-50/50 to-transparent":
                hoverColor === "neutral",
            },
          )}
        />
      )}
      {children}
    </Component>
  );
}
