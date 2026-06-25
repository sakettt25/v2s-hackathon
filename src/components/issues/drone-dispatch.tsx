"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, AlertOctagon, Terminal, Play, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DroneDispatch({ issueId, severity }: { issueId: string, severity: number }) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [status, setStatus] = useState<"idle" | "launching" | "en-route" | "arrived" | "assessing" | "complete">("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleDispatch = () => {
    setIsDispatching(true);
    setStatus("launching");
    addLog("Initiating Drone Dispatch Protocol for Critical Severity Issue...");
    
    setTimeout(() => {
      setStatus("en-route");
      addLog("Drone CH-84 airborne. En route to coordinates.");
    }, 2000);

    setTimeout(() => {
      setStatus("arrived");
      addLog("Drone CH-84 arrived at destination. Hovering at 150ft.");
    }, 5000);

    setTimeout(() => {
      setStatus("assessing");
      addLog("Activating Lidar and thermal imaging...");
      addLog("Transmitting live telemetry to City Infrastructure Dept.");
    }, 7000);

    setTimeout(() => {
      setStatus("complete");
      addLog("Assessment complete. Data uploaded. RTB (Return to Base).");
    }, 11000);
  };

  if (severity < 9) return null; // Only show for critical issues

  return (
    <div className="w-full mb-6 border border-red-500/30 rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono shadow-lg relative">
      <div className="bg-red-950/40 p-3 flex justify-between items-center border-b border-red-500/30">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="font-bold text-red-400">CRITICAL SEVERITY DETECTED</span>
        </div>
        <Badge variant="outline" className="text-red-400 border-red-500/50 uppercase">
          Auto-Response Eligible
        </Badge>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Drone UI */}
        <div className="relative h-48 bg-black rounded-lg border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
          {status === "idle" ? (
            <div className="text-center">
              <Crosshair className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-4">Awaiting Dispatch Command</p>
              <Button onClick={handleDispatch} className="bg-red-600 hover:bg-red-700 text-white font-sans">
                <Play className="w-4 h-4 mr-2" /> Dispatch Assessment Drone
              </Button>
            </div>
          ) : (
            <>
              {/* Fake Drone Camera Feed */}
              <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #000 120%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-red-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-500/50" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-red-500/50" />
              </div>
              
              <div className="z-10 text-center">
                {status === "launching" && <span className="text-amber-400 animate-pulse text-xl">LAUNCHING...</span>}
                {status === "en-route" && <span className="text-blue-400 text-xl">EN ROUTE</span>}
                {status === "arrived" && <span className="text-red-400 animate-pulse text-xl">TARGET ACQUIRED</span>}
                {status === "assessing" && (
                  <div className="text-emerald-400">
                    <span className="text-xl animate-pulse">ANALYZING</span>
                    <div className="text-xs mt-2 space-y-1">
                      <p>STRUCTURAL DAMAGE: 87%</p>
                      <p>CIVILIAN RISK: HIGH</p>
                    </div>
                  </div>
                )}
                {status === "complete" && (
                  <div className="text-emerald-500 flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 mb-2" />
                    <span>ASSESSMENT LOGGED</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Terminal Log */}
        <div className="h-48 bg-slate-900 rounded-lg border border-slate-800 p-3 flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2 text-xs">
            <Terminal className="w-4 h-4" /> System Telemetry
          </div>
          <div className="flex-1 overflow-y-auto text-xs space-y-1 text-green-400 custom-scrollbar flex flex-col justify-end">
            {log.length === 0 ? (
              <span className="text-slate-600">Waiting for input...</span>
            ) : (
              log.map((entry, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={idx}
                >
                  {entry}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
