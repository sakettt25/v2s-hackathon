"use client";

import { useRef, useState, useCallback } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseEnter = useCallback(() => setOpacity(1), []);
  const handleMouseLeave = useCallback(() => setOpacity(0), []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border bg-background transition-colors ${className}`}
    >
      {/* The spotlight gradient overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(120, 119, 198, 0.12), transparent 40%)`,
        }}
      />
      {/* The border glow overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(120, 119, 198, 0.15), transparent 40%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "inherit",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * A container that creates the shared spotlight glow effect across a grid of cards.
 * Wrap a CSS grid of SpotlightCards with this component.
 */
interface SpotlightGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightGrid({ children, className = "" }: SpotlightGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
      style={
        {
          "--spotlight-x": `${position.x}px`,
          "--spotlight-y": `${position.y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
