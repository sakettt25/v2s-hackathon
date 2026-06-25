"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { CheckCircle2, ShieldAlert, ThumbsUp, MapPin, Clock, ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from "@/lib/constants";
import { verifyIssueAction, upvoteIssueAction, generateResolutionPlanAction, disputeResolutionAction } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FutureStateSlider } from "@/components/issues/future-state-slider";
import { DroneDispatch } from "@/components/issues/drone-dispatch";

export default function IssueDetailClient({ issue, verificationCount, hasVerified }: any) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [aiPlan, setAiPlan] = useState<any>(null);

  const categoryObj = ISSUE_CATEGORIES.find(c => c.value === issue.category);
  const statusObj = ISSUE_STATUSES.find(s => s.value === issue.status);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    const result = await generateResolutionPlanAction(issue.id, issue.description, issue.category);
    setIsGeneratingPlan(false);
    if (result.success && result.plan) {
      setAiPlan(result.plan);
    } else {
      alert(result.error);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    const result = await verifyIssueAction(issue.id);
    setIsVerifying(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleUpvote = async () => {
    setIsUpvoting(true);
    await upvoteIssueAction(issue.id);
    setIsUpvoting(false);
  };

  const handleDispute = async () => {
    setIsDisputing(true);
    const result = await disputeResolutionAction(issue.id);
    setIsDisputing(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
        </Link>
        <div className="flex items-center gap-2">
          {/* Mock Mayor Pin Action */}
          <Button variant="outline" size="sm" className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hidden sm:flex">
            👑 Mayor Action: Pin Issue
          </Button>
          {statusObj && (
            <Badge variant="outline" className={`px-3 py-1 text-sm ${statusObj.color}`}>
              {statusObj.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Media */}
        <div className="lg:col-span-2 space-y-6">
          <DroneDispatch issueId={issue.id} severity={issue.severity_score || 5} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="overflow-hidden border shadow-sm">
              {issue.image_data && (
                <div className="w-full h-72 bg-muted relative">
                  <img src={issue.image_data} alt="Issue" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 mb-2 text-primary font-medium text-sm">
                  {categoryObj?.icon} {categoryObj?.label || "General Issue"}
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">{issue.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {issue.formatted_address || "Location Unknown"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Reported {formatRelativeTime(issue.created_at)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-muted-foreground leading-relaxed">
                {issue.description}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Visionary Mode - Only show for certain categories */}
          {(issue.category === "infrastructure" || issue.category === "environment" || true) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
            >
              <FutureStateSlider 
                beforeImage={issue.image_data || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"} 
                afterImage="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" 
              />
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          >
            <Card className="border border-slate-200 shadow-sm rounded-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <SparklesIcon className="w-4 h-4 text-slate-500" /> AI Resolution Planner
                </CardTitle>
                {!aiPlan && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                    {isGeneratingPlan ? "Analyzing..." : "Generate Plan"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {aiPlan ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Summary Row */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Department</div>
                        <div className="text-xs font-bold text-slate-900">{aiPlan.department}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Est. Cost</div>
                        <div className="text-xs font-bold text-slate-900">{aiPlan.estimated_cost_inr}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Timeline</div>
                        <div className="text-xs font-bold text-slate-900">{aiPlan.estimated_days} working days</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Priority</div>
                        <div className="text-xs font-bold text-slate-900 uppercase">{aiPlan.priority_level}</div>
                      </div>
                    </div>

                    {/* Step-by-step Plan */}
                    <div className="border border-slate-200 rounded-sm">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Execution Steps</h4>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {aiPlan.steps?.map((step: any) => (
                          <div key={step.step_number} className="px-3 py-2.5 flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                              {step.step_number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-900">{step.action}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{step.description}</div>
                              <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400">
                                <span>Team: {step.responsible_team}</span>
                                <span>~{step.duration_hours}h</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-slate-200 rounded-sm">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Resources Required</h4>
                        <ul className="text-xs text-slate-700 space-y-1">
                          {aiPlan.resources_required?.map((r: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-sm space-y-3">
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Safety Notes</h4>
                          <p className="text-xs text-slate-600">{aiPlan.safety_considerations}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Community Impact</h4>
                          <p className="text-xs text-slate-600">{aiPlan.community_impact_note}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-6">
                     <p className="text-xs text-slate-500 max-w-sm mx-auto">
                       Click Generate to create a detailed, step-by-step resolution strategy that municipal authorities can immediately execute.
                     </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Actions & Map */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          >
            <Card className="shadow-sm border">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-lg">Community Action</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Community Verifications</span>
                    <span className="text-primary">{verificationCount} / 3</span>
                  </div>
                  {/* Progress bar for auto-escalation */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${Math.min((verificationCount / 3) * 100, 100)}%` }} 
                      transition={{ duration: 1, type: "spring" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {verificationCount >= 3 
                      ? "Threshold met. Issue has been escalated to authorities." 
                      : `Needs ${3 - verificationCount} more verifications to trigger auto-escalation.`}
                  </p>
                </div>

                <div className="grid gap-3">
                  <Button 
                    onClick={handleVerify} 
                    disabled={hasVerified || isVerifying} 
                    className={`w-full h-11 rounded-xl font-semibold transition-all ${hasVerified ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 opacity-100' : ''}`}
                    variant={hasVerified ? "secondary" : "default"}
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    {hasVerified ? "You Verified This" : "Verify Issue Location"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleUpvote} 
                    disabled={isUpvoting}
                    className="w-full h-11 rounded-xl"
                  >
                    {isUpvoting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                    Upvote ({issue.upvote_count || 0})
                  </Button>
                  
                  {issue.status === "resolved" && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resolution Feedback</h4>
                      <div className="grid gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => alert("Thank you for confirming! The community appreciates your help.")}
                          className="w-full h-9 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Resolution
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleDispute}
                          disabled={isDisputing}
                          className="w-full h-9 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                        >
                          {isDisputing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                          Dispute Resolution
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mini Map */}
          {issue.lat && issue.lng && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
              className="h-64 rounded-xl overflow-hidden shadow-sm border"
            >
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} version="3.64">
                <Map defaultCenter={{lat: issue.lat, lng: issue.lng}} defaultZoom={16} disableDefaultUI={true} mapId="DEMO_MAP_ID_MINI">
                  <AdvancedMarker position={{lat: issue.lat, lng: issue.lng}}>
                    <Pin background="#e11d48" borderColor="#be123c" glyphColor="#fff" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
