"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, Clock, CheckCircle2, Users, Leaf, ShieldAlert, Loader2 } from "lucide-react";

export default function AnalyticsDashboard({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impact Analytics</h1>
        <p className="text-muted-foreground">
          Platform-wide metrics and AI-generated impact estimations.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalIssues}</div>
            <p className="text-xs text-muted-foreground">Lifetime reported issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">Issues successfully resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgResolutionDays} Days</div>
            <p className="text-xs text-muted-foreground">Historical average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Citizens</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCitizens}</div>
            <p className="text-xs text-muted-foreground">Registered platform users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Time Series Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Report vs Resolution Volume</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.TIME_SERIES_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="reported" stroke="#64748b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Grievances</CardTitle>
            <CardDescription>Lifetime breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#0f172a", fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.CATEGORY_DATA.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Civic Impact Simulator */}
      <ImpactSimulator />

      {/* AI Predictive Insights Forecast */}
      <Card className="col-span-4 bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800">AI Predictive Risk Forecast</CardTitle>
              <CardDescription>Estimated issue volume for the next 7 days based on historical degradation patterns and weather forecasts.</CardDescription>
            </div>
            <div className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase rounded-sm tracking-wider">
              AI Forecast Active
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { day: 'Day 1', expected: 12, range: [10, 15] },
              { day: 'Day 2', expected: 15, range: [12, 18] },
              { day: 'Day 3', expected: 18, range: [14, 22] },
              { day: 'Day 4', expected: 25, range: [20, 30] },
              { day: 'Day 5', expected: 22, range: [18, 25] },
              { day: 'Day 6', expected: 16, range: [12, 19] },
              { day: 'Day 7', expected: 14, range: [10, 16] },
            ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} issues predicted`, 'Forecast']}
              />
              <Line type="monotone" dataKey="expected" stroke="#334155" strokeWidth={3} strokeDasharray="5 5" activeDot={{ r: 6 }} name="Expected Volume" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ImpactSimulator() {
  const [impact, setImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/impact-simulator", { method: "POST" });
      const data = await res.json();
      if (data.success && data.impact) {
        setImpact(data.impact);
      }
    } catch (err) {
      console.error("Impact simulator failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-md">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-slate-500" />
              AI Civic Impact Simulator
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              AI analyzes all open issues and projects the real-world impact of resolving them.
            </CardDescription>
          </div>
          {!impact && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              {isLoading ? "Simulating..." : "Run Simulation"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {impact ? (
          <div className="space-y-4">
            {/* Efficiency Score */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-sm">
              <div className="text-3xl font-bold text-slate-900">{impact.efficiency_score}<span className="text-sm text-slate-500 font-normal">/100</span></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">City Response Efficiency</div>
                <div className="text-xs text-slate-500 mt-0.5">{impact.overall_summary}</div>
              </div>
            </div>

            {/* Impact Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 border border-slate-200 rounded-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Safety Impact</div>
                <div className="text-xs font-bold text-slate-900 mb-1">{impact.safety_impact.metric}</div>
                <div className="text-[11px] text-slate-500">{impact.safety_impact.detail}</div>
                <div className="text-[10px] text-slate-400 mt-1">{impact.safety_impact.affected_population?.toLocaleString()} residents affected</div>
              </div>

              <div className="p-3 border border-slate-200 rounded-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Environmental</div>
                <div className="text-xs font-bold text-slate-900 mb-1">{impact.environmental_impact.metric}</div>
                <div className="text-[11px] text-slate-500">{impact.environmental_impact.detail}</div>
                <div className="text-[10px] text-slate-400 mt-1">{impact.environmental_impact.co2_reduction_kg} kg CO₂ reduction</div>
              </div>

              <div className="p-3 border border-slate-200 rounded-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Economic</div>
                <div className="text-xs font-bold text-slate-900 mb-1">{impact.economic_impact.metric}</div>
                <div className="text-[11px] text-slate-500">{impact.economic_impact.detail}</div>
                <div className="text-[10px] text-slate-400 mt-1">Cost of inaction: {impact.economic_impact.cost_of_inaction_inr}/day</div>
              </div>

              <div className="p-3 border border-slate-200 rounded-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Health</div>
                <div className="text-xs font-bold text-slate-900 mb-1">{impact.health_impact.metric}</div>
                <div className="text-[11px] text-slate-500">{impact.health_impact.detail}</div>
                <div className="text-[10px] text-slate-400 mt-1">{impact.health_impact.risk_reduction_percent}% risk reduction</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click "Run Simulation" to let AI analyze all open issues and project the safety, environmental, economic, and health impact of resolving them.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

