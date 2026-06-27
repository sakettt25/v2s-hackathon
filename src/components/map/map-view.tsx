"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { DEFAULT_CENTER, DEFAULT_ZOOM, ISSUE_STATUSES } from "@/lib/constants";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

// Replaces deprecated HeatmapLayer with Google Maps Circle overlays
function CircleHeatmapOverlay({ issues, active }: { issues: any[], active: boolean }) {
  const map = useMap();
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);

  useEffect(() => {
    if (!map || !active) {
      // Remove circles when inactive
      circles.forEach(c => c.setMap(null));
      return;
    }

    if (circles.length > 0) {
      circles.forEach(c => c.setMap(map));
      return;
    }

    // Create circle overlays for each issue
    const newCircles = issues
      .filter(issue => issue.lat && issue.lng)
      .map(issue => {
        const severity = issue.severity_score || 5;
        const opacity = Math.min(0.15 + severity * 0.05, 0.6);
        const radius = 80 + severity * 30;

        return new google.maps.Circle({
          center: { lat: issue.lat, lng: issue.lng },
          radius,
          fillColor: severity >= 7 ? "#ef4444" : severity >= 4 ? "#f97316" : "#eab308",
          fillOpacity: opacity,
          strokeColor: severity >= 7 ? "#dc2626" : severity >= 4 ? "#ea580c" : "#ca8a04",
          strokeWeight: 1,
          strokeOpacity: 0.3,
          map,
          clickable: false,
        });
      });

    setCircles(newCircles);

    return () => {
      newCircles.forEach(c => c.setMap(null));
    };
  }, [map, active, issues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      circles.forEach(c => c.setMap(null));
    };
  }, []);

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
        <CircleHeatmapOverlay issues={initialIssues} active={showHeatmap} />
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
