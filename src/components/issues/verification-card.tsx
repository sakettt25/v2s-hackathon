"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import type { Issue } from "@/lib/types";
// In a real app, this would use a server action
// import { submitVerification } from "@/app/actions/issues";

interface VerificationCardProps {
  issue: Partial<Issue>;
  distanceMeters: number;
}

export default function VerificationCard({ issue, distanceMeters }: VerificationCardProps) {
  const [status, setStatus] = useState<"approve" | "dispute" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!status) return;
    
    setIsSubmitting(true);
    try {
      // await submitVerification(issue.id!, status, comment);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="p-4 flex flex-col items-center justify-center py-8">
          <ThumbsUp className="h-8 w-8 text-emerald-500 mb-2" />
          <h3 className="font-semibold text-emerald-700">Verification Submitted</h3>
          <p className="text-sm text-emerald-600/80 text-center mt-1">
            Thank you! You earned +5 reputation points.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base leading-tight">
            Verify: {issue.title}
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          <span className="font-medium text-primary">{distanceMeters}m away</span> • Needs community verification
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {issue.media_url && (
          <div className="rounded-md overflow-hidden bg-muted h-32 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={issue.media_url} alt="Issue" className="w-full h-full object-cover" />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {issue.description}
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Button
              variant={status === "approve" ? "default" : "outline"}
              className={`flex-1 ${status === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              onClick={() => setStatus("approve")}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant={status === "dispute" ? "default" : "outline"}
              className={`flex-1 ${status === "dispute" ? "bg-rose-600 hover:bg-rose-700" : ""}`}
              onClick={() => setStatus("dispute")}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Dispute
            </Button>
          </div>

          {status && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Textarea
                placeholder={status === "approve" ? "Optional: Add a comment..." : "Required: Why are you disputing this?"}
                className="h-16 text-xs resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                className="w-full" 
                size="sm" 
                onClick={handleSubmit}
                disabled={isSubmitting || (status === "dispute" && comment.trim().length < 5)}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Verification
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
