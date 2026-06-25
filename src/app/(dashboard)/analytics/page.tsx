import { getAnalytics } from "@/lib/data";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return <AnalyticsDashboard data={data} />;
}
