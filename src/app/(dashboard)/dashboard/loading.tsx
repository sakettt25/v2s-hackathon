import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full gap-4 p-4">
      {/* Map Section */}
      <div className="w-1/2 rounded-xl border bg-card shadow overflow-hidden flex flex-col relative">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      
      {/* Feed Section */}
      <div className="w-1/4 rounded-xl border bg-card shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>

      {/* Triage Panel */}
      <div className="w-1/4 rounded-xl border bg-card shadow overflow-hidden flex flex-col p-4 space-y-4">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
