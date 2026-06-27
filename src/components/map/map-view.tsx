"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { DEFAULT_CENTER, DEFAULT_ZOOM, ISSUE_STATUSES } from "@/lib/constants";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeatmapOverlay({ issues, active }: { issues: any[], active: boolean }) {
  const map = useMap();
  const visualization = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<any>(null);

  useEffect(() => {
    if (!map || !visualization) return;

    if (!heatmap) {
      // @ts-ignore
      const heatmapData = issues.map(issue => new google.maps.LatLng(issue.lat, issue.lng));
      
      const layer = new (visualization as any).HeatmapLayer({
        data: heatmapData,
        radius: 40,
        opacity: 0.7,
        gradient: [
          'rgba(255, 255, 255, 0)',
          'rgba(255, 237, 74, 0.5)',
          'rgba(255, 179, 71, 0.8)',
          'rgba(255, 105, 97, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
      setHeatmap(layer);
    }
  }, [map, visualization, issues, heatmap]);

  useEffect(() => {
    if (heatmap) {
      heatmap.setMap(active ? map : null);
    }
  }, [heatmap, active, map]);

  return null;
}

export default function MapView({ initialIssues = [] }: { initialIssues?: any[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCuZjnUGl4w72ZSnfTetD_HHxbZFmOxit4";
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Google Maps API key is missing.</p>
      </div>
    );
  }

  // Calculate center based on issues or use default
  const mapCenter = initialIssues.length > 0 && initialIssues[0].lat && initialIssues[0].lng
    ? { lat: initialIssues[0].lat, lng: initialIssues[0].lng }
    : DEFAULT_CENTER;

  return (
    <APIProvider apiKey={apiKey} version="3.64">
      <Map
        defaultCenter={mapCenter}
        defaultZoom={DEFAULT_ZOOM}
        mapId="DEMO_MAP_ID" // Required for Advanced Markers
        disableDefaultUI={true}
        zoomControl={true}
        className="w-full h-full"
      >
        {initialIssues.map((issue) => {
          if (!issue.lat || !issue.lng) return null;
          
          let bgColor = "#0f172a"; // default slate-900
          if (issue.status === "open") bgColor = "#e11d48"; // rose-600
          if (issue.status === "verifying") bgColor = "#f59e0b"; // amber-500
          if (issue.status === "in-progress") bgColor = "#8b5cf6"; // violet-500
          if (issue.status === "resolved") bgColor = "#10b981"; // emerald-500

          return (
            <AdvancedMarker
              key={issue.id}
              position={{ lat: issue.lat, lng: issue.lng }}
              title={issue.title}
            >
              <Pin
                background={bgColor}
                borderColor={bgColor}
                glyphColor="#fff"
              />
            </AdvancedMarker>
          );
        })}
        <HeatmapOverlay issues={initialIssues} active={showHeatmap} />
      </Map>

      <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur rounded-md shadow-sm border p-2">
        <Button 
          variant={showHeatmap ? "default" : "outline"}
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="flex items-center gap-2"
        >
          <Layers className="w-4 h-4" />
          {showHeatmap ? "Predictive Hotspots: ON" : "Predictive Hotspots"}
        </Button>
      </div>
    </APIProvider>
  );
}
