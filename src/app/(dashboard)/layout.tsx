import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { VoiceReportFAB } from "@/components/report/voice-report-fab";
import { getSession } from "@/lib/auth/jwt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userEmail = session?.user?.email;
  const userRole = session?.user?.role;

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50/20">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto">
        <Header userEmail={userEmail} userRole={userRole} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <VoiceReportFAB />
    </div>
  );
}
