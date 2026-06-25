"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, ShieldCheck, BarChart3, BrainCircuit, MapPin, Zap } from "lucide-react";

const CARDS = [
  {
    icon: Camera,
    title: "Snap & Report",
    description: "Take a photo of any infrastructure issue. Our Gemini AI instantly extracts category, severity, and a full description.",
  },
  {
    icon: ShieldCheck,
    title: "Community Verification",
    description: "Neighbors verify reports. At 3 unique verifications, the system auto-escalates the issue to local authorities.",
  },
  {
    icon: BarChart3,
    title: "Impact Dashboards",
    description: "Track resolution rates, CO₂ prevention metrics, and your personal impact score in real time.",
  },
  {
    icon: BrainCircuit,
    title: "AI Situation Room",
    description: "Ask questions about your city's data in plain English. The AI analyzes live reports and generates actionable intelligence.",
  },
  {
    icon: MapPin,
    title: "Predictive Hotspots",
    description: "A heatmap overlay on the live map highlights deteriorating zones where problems are clustering.",
  },
  {
    icon: Zap,
    title: "Gamified Engagement",
    description: "Earn reputation points for reporting and verifying. Climb the community leaderboard and unlock badges.",
  },
];

function Card({ icon: Icon, title, description, mouseX, mouseY, rect }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localPos, setLocalPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setLocalPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
    >
      {/* Spotlight radial gradient */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${localPos.x}px ${localPos.y}px, rgba(120, 119, 198, 0.1), transparent 40%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${localPos.x}px ${localPos.y}px, rgba(120, 119, 198, 0.25), transparent 40%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "inherit",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function SpotlightCards() {
  return (
    <section className="w-full py-16 md:py-24 border-t border-slate-200/50 backdrop-blur-sm">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
          <p className="text-muted-foreground">
            Six intelligent modules work together to transform how communities identify, validate, and resolve local infrastructure problems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card) => (
            <Card key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
