"use client";

import { useRef, useState, useCallback } from "react";

export function InteractiveGridBackground({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // This accurately calculates position even when the page is scrolled
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-slate-50 flex flex-col group"
    >
      {/* Subtle base grid for the whole page */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Dynamic Bright Grid - Very bold indigo (#4f46e5) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:24px_24px] transition-opacity duration-300 opacity-0 group-hover:opacity-60"
        style={{
          maskImage: `radial-gradient(800px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(800px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
        }}
      ></div>

      {/* The content sits above the absolute grid layers */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
}
