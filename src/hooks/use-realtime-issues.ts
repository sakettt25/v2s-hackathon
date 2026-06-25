"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Issue } from "@/lib/types";

export function useRealtimeIssues(initialIssues: Issue[] = []) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to all changes on the issues table
    const channel = supabase
      .channel("public:issues")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newIssue = payload.new as Issue;
            setIssues((current) => [newIssue, ...current]);
          } else if (payload.eventType === "UPDATE") {
            const updatedIssue = payload.new as Issue;
            setIssues((current) =>
              current.map((issue) =>
                issue.id === updatedIssue.id ? { ...issue, ...updatedIssue } : issue
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setIssues((current) => current.filter((issue) => issue.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { issues, setIssues };
}
