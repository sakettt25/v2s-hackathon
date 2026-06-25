"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { generateSmartTriageAction } from "@/app/(dashboard)/dashboard/actions";
import Link from "next/link";

const urgencyConfig: Record<string, { color: string; icon: React.ReactNode; border: string }> = {
  critical: {
    color: "bg-red-50 text-red-700",
    border: "border-red-200",
    icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
  },
  high: {
    color: "bg-amber-50 text-amber-700",
    border: "border-amber-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
  },
  medium: {
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
  },
};

export default function SmartTriagePanel() {
  const [triage, setTriage] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const result = await generateSmartTriageAction();
    setIsLoading(false);
    setHasGenerated(true);
    if (result.success && result.triage) {
      setTriage(result.triage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="font-semibold tracking-tight text-sm">AI Smart Triage</h2>
        </div>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isLoading} className="h-7 text-xs">
          {isLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
          {isLoading ? "Analyzing..." : hasGenerated ? "Refresh" : "Generate"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {!hasGenerated && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Zap className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Click Generate to let AI prioritize your open issues by urgency and impact.
            </p>
          </div>
        )}
        {triage.map((item, idx) => {
          const config = urgencyConfig[item.urgency] || urgencyConfig.medium;
          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link href={`/issues/${item.id}`} className={`block p-3 border rounded-lg ${config.border} hover:shadow-sm transition-shadow`}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold truncate">{item.title}</span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
                        {item.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{item.reason}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {hasGenerated && triage.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-xs text-muted-foreground">No open issues to triage. All clear! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
