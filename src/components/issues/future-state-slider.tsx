"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FutureStateSliderProps {
  beforeImage: string;
  afterImage: string;
}

export function FutureStateSlider({ beforeImage, afterImage }: FutureStateSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Visionary Mode
        </h3>
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          Simulated Future
        </Badge>
      </div>
      
      <p className="text-muted-foreground text-sm">
        See how this space could look if this issue is resolved. Slide to compare the current state with the AI-generated future.
      </p>
      
      <div 
        ref={containerRef}
        className="relative w-full h-[400px] rounded-xl overflow-hidden cursor-ew-resize select-none border-4 border-muted shadow-lg"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseMove={onMouseMove}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        onTouchMove={onTouchMove}
      >
        {/* Before Image (Underneath) */}
        <div className="absolute inset-0">
          <img 
            src={beforeImage} 
            alt="Before" 
            className="w-full h-full object-cover"
            draggable={false}
          />
          <Badge className="absolute top-4 right-4 bg-black/50 text-white backdrop-blur-md">
            Current
          </Badge>
        </div>

        {/* After Image (On Top, Clipped) */}
        <div 
          className="absolute inset-0 border-r-4 border-white"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={afterImage} 
            alt="After" 
            className="w-full h-full object-cover"
            draggable={false}
          />
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-md">
            Resolved
          </Badge>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
            <div className="w-4 h-4 text-primary flex items-center justify-between">
              <div className="w-[2px] h-3 bg-primary rounded-full"></div>
              <div className="w-[2px] h-3 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 w-full">
        <Button variant="outline" className="w-full gap-2">
          <ImageIcon className="w-4 h-4" />
          Share Vision
        </Button>
        <Button className="w-full">
          Support This Project
        </Button>
      </div>
    </div>
  );
}
