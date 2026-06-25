"use client";

import { motion } from "framer-motion";
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

const DEMO_ISSUES = [
  {
    id: "demo-1",
    title: "Massive pothole on Outer Ring Road",
    category: "infrastructure",
    status: "verifying",
    severity_score: 9,
    formatted_address: "Outer Ring Road, Marathahalli, Bengaluru",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    profiles: { full_name: "Rahul S." }
  },
  {
    id: "demo-2",
    title: "Broken streetlight causing blind spot",
    category: "lighting",
    status: "open",
    severity_score: 6,
    formatted_address: "MG Road Metro Station, New Delhi",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    profiles: { full_name: "Priya M." }
  },
  {
    id: "demo-3",
    title: "Overflowing garbage dump near market",
    category: "waste",
    status: "resolved",
    severity_score: 4,
    formatted_address: "Dadar West Market, Mumbai",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    profiles: { full_name: "Anonymous" }
  }
];

export function LiveIssueFeed({ issues }: { issues: any[] }) {
  const displayIssues = issues && issues.length > 0 ? issues : DEMO_ISSUES;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-lg font-semibold tracking-tight uppercase text-muted-foreground">Live Crisis Feed</h3>
      </div>
      <div className="space-y-3">
        {displayIssues.slice(0, 5).map((issue, i) => {
          const categoryObj = ISSUE_CATEGORIES.find(c => c.value === issue.category);
          const statusObj = ISSUE_STATUSES.find(s => s.value === issue.status);
          
          return (
            <motion.div 
              key={issue.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Link href={`/issues/${issue.id}`} className="block border rounded-md p-4 bg-background hover:bg-muted/50 transition-colors shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold truncate flex items-center gap-1.5">
                        {categoryObj?.icon} {issue.title}
                      </span>
                      {issue.severity_score >= 8 && (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                         <span className="font-medium text-foreground">{issue.profiles?.full_name || "Anonymous"}</span>
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.created_at)}</span>
                      {issue.formatted_address && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{issue.formatted_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {statusObj && (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold shrink-0 uppercase tracking-wider`}>
                      {statusObj.label}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
