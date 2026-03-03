"use client";

type ScrollRevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

// Simplified version of ScrollReveal: keeps API shape but does not depend on framer-motion.
export default function ScrollReveal({
  children,
  className,
}: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}

