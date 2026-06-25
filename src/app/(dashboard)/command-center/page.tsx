"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BrainCircuit, Activity, ShieldAlert, CloudRain, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi

function PredictiveHeatmapOverlay({ data = [] }: { data: any[] }) {
  const map = useMap();
  const visualization = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<any>(null);

  useEffect(() => {
    if (!map || !visualization || data.length === 0) return;

    const heatmapData = data
      .filter(spot => spot.lat && spot.lng)
      .map(spot => ({
        location: new google.maps.LatLng(spot.lat, spot.lng),
        weight: spot.severity_score || 5
      }));
      
    if (!heatmap) {
      // @ts-ignore
      const layer = new visualization.HeatmapLayer({
        data: heatmapData,
        radius: 60,
        opacity: 0.8,
        gradient: [
          'rgba(255, 255, 255, 0)',
          'rgba(173, 216, 230, 0.5)',
          'rgba(0, 0, 255, 0.8)',
          'rgba(138, 43, 226, 1)',
          'rgba(255, 0, 255, 1)',
          'rgba(255, 0, 0, 1)' 
        ]
      });
      setHeatmap(layer);
    } else {
      heatmap.setData(heatmapData);
    }
  }, [map, visualization, heatmap, data]);

  useEffect(() => {
    if (heatmap) {
      heatmap.setMap(map);
    }
    return () => {
      if (heatmap) heatmap.setMap(null);
    }
  }, [heatmap, map]);

  return null;
}

export default function CommandCenterPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [liveIssues, setLiveIssues] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('issues')
          .select('lat, lng, severity_score')
          .not('lat', 'is', null)
          .not('lng', 'is', null);
          
        if (data) {
          setLiveIssues(data);
        }
      } catch (err) {
        console.error("Failed to fetch live coordinates for map", err);
      }
    };
    fetchIssues();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch('/api/ai/predictions');
        const json = await res.json();
        if (json.success) {
          setAiData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch AI predictions", err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchPredictions();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] p-6 bg-slate-50 text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-blue-600 w-8 h-8" />
            AI Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Predictive analytics and risk assessment for proactive city management.
          </p>
        </div>
        
        <div className="flex gap-2">
           <Badge variant="outline" className="border-slate-300 text-slate-700 flex items-center gap-1 rounded-sm">
             <AlertTriangle className="w-3 h-3" /> Critical Alert: Dwarka Sector 4
           </Badge>
           <Badge variant="outline" className="border-slate-300 text-slate-700 flex items-center gap-1 rounded-sm">
             <Activity className="w-3 h-3" /> Systems Normal
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Panel - Analytics */}
        <div className="col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
           <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-md">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                 <CloudRain className="w-4 h-4 text-slate-500" />
                 Environmental Factors
               </CardTitle>
             </CardHeader>
             <CardContent>
                {loadingAi ? (
                  <div className="flex items-center justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
                ) : aiData?.environmental_factors ? (
                  <div className="space-y-4">
                    {aiData.environmental_factors.map((factor: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1 text-slate-600 uppercase font-semibold tracking-wider">
                          <span>{factor.name}</span>
                          <span className="text-slate-900">{factor.risk_percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden">
                          <div className={`h-full bg-${factor.color || 'slate'}-800`} style={{ width: `${factor.risk_percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Could not load environmental data.</p>
                )}
             </CardContent>
           </Card>

           <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-md">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                 <ShieldAlert className="w-4 h-4 text-slate-500" />
                 AI Predictions
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                {loadingAi ? (
                  <div className="flex items-center justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
                ) : aiData?.predictions ? (
                  aiData.predictions.map((pred: any, i: number) => (
                    <div key={i} className={`p-3 bg-white border ${pred.type === 'warning' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'} rounded-sm`}>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1">
                        {pred.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500"/>}
                        {pred.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {pred.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Could not load predictions.</p>
                )}
             </CardContent>
           </Card>
        </div>

        {/* Right Panel - Map */}
        <div className="col-span-1 lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
           <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-lg border shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Heatmap Legend</h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded-full bg-blue-400" /> Low Risk
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <div className="w-4 h-4 rounded-full bg-purple-400" /> Medium Risk
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <div className="w-4 h-4 rounded-full bg-red-500" /> High Risk (Imminent)
              </div>
           </div>

           {!apiKey ? (
             <div className="flex h-full items-center justify-center">
               <p className="text-slate-500">Google Maps API key required for AI mapping.</p>
             </div>
           ) : (
             <APIProvider apiKey={apiKey} version="3.64">
               <Map
                 defaultCenter={DEFAULT_CENTER}
                 defaultZoom={13}
                 mapId="DEMO_MAP_ID_DARK"
                 disableDefaultUI={true}
                 className="w-full h-full opacity-80 mix-blend-multiply filter contrast-125 grayscale-[20%]"
               >
                 <PredictiveHeatmapOverlay data={liveIssues} />
               </Map>
             </APIProvider>
           )}
        </div>
      </div>
    </div>
  );
}
