"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Check, X } from "lucide-react";

interface IssueProps {
  id: string;
  title: string;
  category: string;
  severity: number;
  location: string;
  imageUrl: string;
}

interface SwipeCardProps {
  issue: IssueProps;
  onSwipe: (direction: "left" | "right", id: string) => void;
}

export function SwipeCard({ issue, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const scale = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe("right", issue.id);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe("left", issue.id);
    }
  };

  return (
    <motion.div
      style={{ x, opacity, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full max-w-sm cursor-grab active:cursor-grabbing"
    >
      <Card className="overflow-hidden border border-slate-200 shadow-sm bg-card rounded-lg">
        {issue.imageUrl ? (
          <div className="relative h-52 w-full">
            <img 
              src={issue.imageUrl} 
              alt={issue.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Professional Swipe Indicators */}
            <motion.div 
              className="absolute top-4 left-4 bg-slate-900 text-slate-50 rounded-sm px-3 py-1 font-semibold text-xs border border-slate-700"
              style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
            >
              VALIDATE
            </motion.div>
            <motion.div 
              className="absolute top-4 right-4 bg-white text-slate-900 rounded-sm px-3 py-1 font-semibold text-xs border border-slate-200"
              style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
            >
              REJECT
            </motion.div>
          </div>
        ) : (
          <div className="h-52 w-full bg-slate-50 flex items-center justify-center border-b">
            <AlertTriangle className="h-12 w-12 text-slate-300" />
            <motion.div 
              className="absolute top-4 left-4 bg-slate-900 text-slate-50 rounded-sm px-3 py-1 font-semibold text-xs border border-slate-700"
              style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
            >
              VALIDATE
            </motion.div>
            <motion.div 
              className="absolute top-4 right-4 bg-white text-slate-900 rounded-sm px-3 py-1 font-semibold text-xs border border-slate-200"
              style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
            >
              REJECT
            </motion.div>
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl mb-1">{issue.title}</h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {issue.location}
              </div>
            </div>
            <Badge variant={issue.severity > 7 ? "destructive" : "secondary"}>
              Severity: {issue.severity}/10
            </Badge>
          </div>
          
          <Badge variant="outline" className="mb-4 text-slate-600 rounded-sm">{issue.category}</Badge>
          
          <div className="flex justify-between items-center mt-4 gap-4">
            <button 
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-md py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
              onClick={() => {
                setExitX(-200);
                setTimeout(() => onSwipe("left", issue.id), 200);
              }}
            >
               <X className="h-4 w-4" /> Reject
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-md py-3 text-sm font-semibold hover:bg-slate-800 transition-colors"
              onClick={() => {
                setExitX(200);
                setTimeout(() => onSwipe("right", issue.id), 200);
              }}
            >
               <Check className="h-4 w-4" /> Validate
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
