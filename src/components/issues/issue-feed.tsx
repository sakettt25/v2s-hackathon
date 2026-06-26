import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from "@/lib/constants";
import { ThumbsUp, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function IssueFeed({ initialIssues = [] }: { initialIssues?: any[] }) {
  if (!initialIssues || initialIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mb-2 opacity-20" />
        <p>No issues reported yet.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 p-4"
    >
      {initialIssues.map((issue) => {
        const categoryObj = ISSUE_CATEGORIES.find(c => c.value === issue.category);
        const statusObj = ISSUE_STATUSES.find(s => s.value === issue.status);

        return (
          <motion.div key={issue.id} variants={item} layout>
            <Link href={`/issues/${issue.id}`} className="block group outline-none">
              <Card className="cursor-pointer border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200 h-full active:scale-[0.99]">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-tight font-semibold">
                      {categoryObj?.icon} {issue.title}
                    </CardTitle>
                    {statusObj && (
                      <Badge variant="secondary" className={`${statusObj.color} rounded-sm font-medium`}>
                        {statusObj.label}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex flex-col gap-1 text-xs mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">{issue.profiles?.full_name || "Anonymous"}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500">{formatRelativeTime(issue.created_at)}</span>
                    </div>
                    {issue.formatted_address && (
                      <span className="text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {issue.formatted_address}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-zinc-600 line-clamp-2 mb-3 leading-relaxed">
                    {issue.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{issue.upvote_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                          Severity {issue.severity_score || 5}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
