"use client";

export function useToast() {
  return {
    toast: (options: { title: string; description?: string; variant?: "default" | "destructive" }) => {
      // For the hackathon demo, we will fall back to a simple alert if standard Shadcn toast is missing
      console.log(`[TOAST: ${options.variant || "default"}] ${options.title}`, options.description);
      // alert(`${options.title}\n${options.description || ""}`);
    }
  };
}
