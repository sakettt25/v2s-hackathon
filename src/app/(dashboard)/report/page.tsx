import SmartReportForm from "@/components/report/smart-report-form";

export const dynamic = "force-dynamic";

export default function ReportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl py-6 flex flex-col min-h-[calc(100vh-100px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Report Incident</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Log an infrastructure fault. AI pre-processing will extract context from your photo.
        </p>
      </div>
      
      <div className="flex-1">
        <SmartReportForm />
      </div>
    </div>
  );
}
