import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from "@/lib/constants";
import { ThumbsUp, MapPin } from "lucide-react";
import Link from "next/link";

export default function IssueFeed({ initialIssues = [] }: { initialIssues?: any[] }) {
  if (!initialIssues || initialIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mb-2 opacity-20" />
        <p>No issues reported yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {initialIssues.map((issue) => {
        const categoryObj = ISSUE_CATEGORIES.find(c => c.value === issue.category);
        const statusObj = ISSUE_STATUSES.find(s => s.value === issue.status);

        return (
          <Link href={`/issues/${issue.id}`} key={issue.id} className="block group">
            <Card className="cursor-pointer border border-zinc-200 shadow-sm hover:-translate-y-[2px] hover:shadow-md hover:border-zinc-300 transition-all duration-200 h-full">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base leading-tight">
                    {categoryObj?.icon} {issue.title}
                  </CardTitle>
                  {statusObj && (
                    <Badge variant="secondary" className={statusObj.color}>
                      {statusObj.label}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex flex-col gap-1 text-xs mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{issue.profiles?.full_name || "Anonymous"}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(issue.created_at)}</span>
                  </div>
                  {issue.formatted_address && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {issue.formatted_address}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{issue.upvote_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-rose-500">
                        Severity {issue.severity_score || 5}/10
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
