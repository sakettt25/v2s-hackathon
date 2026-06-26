"use client";

import { useState, useEffect } from "react";
import { SwipeCard } from "@/components/verify/swipe-card";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2 } from "lucide-react";
import { submitVerification } from "../actions";

const useToast = () => ({
  toast: (options: any) => alert(`${options.title}\n${options.description || ""}`)
});

const MOCK_ISSUES = [
  {
    id: "1",
    title: "Massive Pothole on MG Road",
    category: "Infrastructure",
    severity: 8,
    location: "MG Road & 100 Feet Road",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Broken Streetlight",
    category: "Safety",
    severity: 6,
    location: "Lodhi Road",
    imageUrl: "https://images.unsplash.com/photo-1518174542283-fddf61e2bfa8?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Graffiti on Public Library",
    category: "Vandalism",
    severity: 4,
    location: "Delhi Public Library",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "Flooded Intersection",
    category: "Environment",
    severity: 9,
    location: "Ring Road near Yamuna Bank",
    imageUrl: "https://images.unsplash.com/photo-1527663456740-9753c0d7ff55?auto=format&fit=crop&q=80&w=800",
  }
];

export default function SwipeVerifyPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('status', 'open') // Only verify open issues
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data && data.length > 0) {
          const formattedIssues = data.map(issue => ({
            id: issue.id,
            title: issue.title,
            category: issue.category,
            severity: issue.severity_score || 5,
            location: issue.formatted_address || "Location unavailable",
            imageUrl: issue.image_url || null,
          }));
          setIssues(formattedIssues);
        } else {
          // Fallback to mock data if DB is empty so the demo still works
          setIssues(MOCK_ISSUES);
        }

        // Fetch dynamic score
        const { getUserProfile } = await import("@/app/(dashboard)/actions");
        const profile = await getUserProfile();
        setScore(profile.points);

      } catch (err) {
        console.error("Failed to load issues", err);
        setIssues(MOCK_ISSUES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, []);

  const handleSwipe = (direction: "left" | "right", id: string) => {
    // Remove the swiped card from the stack
    setTimeout(async () => {
      setIssues(prev => prev.filter(issue => issue.id !== id));
      
      // Give points locally for immediate feedback
      setScore(prev => prev + 5);
      
      // Persist to Supabase and handle auto-escalation
      const status = direction === "right" ? "approve" : "dispute";
      
      // Don't error out on mock data
      if (id.length > 5) {
         await submitVerification(id, status);
      }
      
      toast({
        title: direction === "right" ? "Issue Verified!" : "Issue Disputed!",
        description: "+5 Hero Points earned.",
      });
    }, 200); // Wait for the exit animation
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] p-6 bg-muted/10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Verify</h1>
          <p className="text-muted-foreground mt-1">
            Swipe right to verify an issue, swipe left to dispute.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          {score} Pts
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading local issues...</p>
          </div>
        ) : issues.length > 0 ? (
          <div className="relative w-full max-w-sm min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {/* Render in reverse so the first item is on top */}
              {issues.slice().reverse().map((issue, index) => (
                <motion.div
                  key={issue.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as any }}
                  className="absolute"
                >
                  <SwipeCard 
                    issue={issue} 
                    onSwipe={handleSwipe} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
            <p className="text-muted-foreground mb-6">
              You've verified all open issues in your area. Great job keeping the community safe!
            </p>
            <Button onClick={() => setIssues(MOCK_ISSUES)}>
              Find More Issues
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
