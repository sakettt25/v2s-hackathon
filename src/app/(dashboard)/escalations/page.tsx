"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Clock, ArrowUpRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/escalate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEscalations(data.escalations);
      }
    } catch (err) {
      console.error("Escalation fetch failed", err);
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };

  const urgencyStyles: Record<string, string> = {
    critical: "border-l-slate-900",
    high: "border-l-slate-600",
    medium: "border-l-slate-400",
  };

  return (
    <div className="flex flex-col p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-slate-500" />
            AI Escalation Engine
          </h1>
          <p className="text-slate-500 mt-1">
            AI identifies stale issues that need immediate attention and recommends escalation paths.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
          {isLoading ? "Scanning Database..." : hasGenerated ? "Re-scan" : "Scan for Stale Issues"}
        </Button>
      </div>

      {!hasGenerated && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-sm text-slate-500 max-w-md">
            Click "Scan for Stale Issues" to let AI analyze your database for open issues older than 3 days 
            that haven't received any municipal action. It will generate urgency justifications and 
            recommend specific escalation paths.
          </p>
        </div>
      )}

      {hasGenerated && escalations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No stale issues found. All reported issues are within the 3-day SLA.</p>
        </div>
      )}

      <div className="space-y-3">
        {escalations.map((item: any, idx: number) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <Card className={`border border-slate-200 shadow-sm rounded-md border-l-4 ${urgencyStyles[item.urgency] || urgencyStyles.medium}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/issues/${item.id}`} className="text-sm font-semibold text-slate-900 hover:underline truncate">
                        {item.title}
                      </Link>
                      <Badge variant="outline" className="rounded-sm text-[10px] font-bold uppercase tracking-wider border-slate-300 text-slate-600 flex-shrink-0">
                        {item.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{item.justification}</p>
                    
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.days_open} days open
                      </span>
                      <span>Severity: {item.severity}/10</span>
                      <span>Pressure Score: {item.community_pressure}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Escalate To</div>
                    <div className="text-xs font-bold text-slate-900">{item.target_authority}</div>
                    <div className="text-[11px] text-slate-500 max-w-[200px]">{item.recommended_action}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
