import IssueFeed from "@/components/issues/issue-feed";
import { getIssues } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ActivityPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  let issues = await getIssues();

  // If there's a search query, filter the issues locally (since we fetch all of them anyway in getIssues)
  const query = searchParams?.q?.toLowerCase();
  if (query) {
    issues = issues.filter((issue: any) => 
      issue.title?.toLowerCase().includes(query) || 
      issue.description?.toLowerCase().includes(query) ||
      issue.category?.toLowerCase().includes(query)
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] p-6 bg-slate-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {query ? `Search Results for "${searchParams.q}"` : "Community Activity"}
        </h1>
        <p className="text-slate-500 mt-1">
          {query ? `Found ${issues.length} issues matching your search.` : "A real-time feed of all reported issues and validations in your area."}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto rounded-xl border bg-white shadow-sm">
        <IssueFeed initialIssues={issues} />
      </div>
    </div>
  );
}
