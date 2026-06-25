import { AIChat } from "@/components/command/ai-chat";
import { BrainCircuit } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CommandCenterPage() {
  return (
    <div className="mx-auto w-full max-w-5xl py-6 flex flex-col min-h-[calc(100vh-100px)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Situation Room</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Query the city's live database using natural language.
          </p>
        </div>
      </div>
      
      <div className="flex-1">
        <AIChat />
      </div>
    </div>
  );
}
