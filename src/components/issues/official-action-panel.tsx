"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Send, AlertTriangle } from "lucide-react";
import type { Issue } from "@/lib/types";

interface OfficialActionPanelProps {
  issue: Partial<Issue>;
  isOfficial: boolean;
}

export default function OfficialActionPanel({ issue, isOfficial }: OfficialActionPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  if (!isOfficial) return null;

  const handleGenerateComplaint = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: issue.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setPdfUrl(data.pdfUrl);
      }
    } catch (error) {
      console.error("Failed to generate", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-indigo-200 shadow-sm mt-6">
      <CardHeader className="bg-indigo-50/50 pb-4">
        <div className="flex items-center gap-2 text-indigo-700">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle className="text-lg">Official Action Required</CardTitle>
        </div>
        <CardDescription>
          This issue has reached consensus ({issue.upvote_count} upvotes) and is ready for municipal escalation.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {pdfUrl ? (
          <div className="bg-muted p-4 rounded-md border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-rose-500" />
              <div>
                <p className="font-medium text-sm">Formal Complaint Generated</p>
                <p className="text-xs text-muted-foreground">Ready for dispatch to city officials</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
              </Button>
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-3 w-3" />
                Dispatch
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full gap-2" 
            variant="secondary"
            onClick={handleGenerateComplaint}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {isGenerating ? "Drafting Complaint with AI..." : "Auto-Draft Formal Complaint"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
