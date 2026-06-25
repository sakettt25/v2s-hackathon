import MapView from "@/components/map/map-view";
import IssueFeed from "@/components/issues/issue-feed";
import SmartTriagePanel from "@/components/dashboard/smart-triage";
import { getIssues } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const issues = await getIssues();

  return (
    <div className="flex h-[calc(100vh-100px)] w-full gap-4">
      {/* Map Section - 50% */}
      <div className="w-1/2 rounded-xl border bg-card text-card-foreground shadow overflow-hidden flex flex-col relative">
        <MapView initialIssues={issues} />
      </div>
      
      {/* Feed Section - 25% */}
      <div className="w-1/4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold tracking-tight">Recent Issues</h2>
        </div>
        <div className="flex-1 overflow-auto bg-muted/10">
          <IssueFeed initialIssues={issues} />
        </div>
      </div>

      {/* AI Smart Triage Panel - 25% */}
      <div className="w-1/4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden flex flex-col">
        <SmartTriagePanel />
      </div>
    </div>
  );
}

