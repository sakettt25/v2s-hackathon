import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Star, ShieldCheck, Flame, Eye, Award, Target } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { getLeaderboard } from "@/lib/data";

export const dynamic = "force-dynamic";

// Gamification Tier System
function getTier(points: number) {
  if (points >= 200) return { name: "Diamond", color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-200", next: null, nextAt: null };
  if (points >= 100) return { name: "Gold", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", next: "Diamond", nextAt: 200 };
  if (points >= 50) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", next: "Gold", nextAt: 100 };
  return { name: "Bronze", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", next: "Silver", nextAt: 50 };
}

// Achievement Badges
function getAchievements(user: any) {
  const badges = [];
  if (user.points >= 10) badges.push({ icon: <Flame className="w-3.5 h-3.5" />, label: "First Responder", desc: "Earned 10+ points" });
  if (user.verified >= 3) badges.push({ icon: <Eye className="w-3.5 h-3.5" />, label: "Watchdog", desc: "Verified 3+ reports" });
  if (user.points >= 50) badges.push({ icon: <Award className="w-3.5 h-3.5" />, label: "Guardian", desc: "Earned 50+ points" });
  if (user.points >= 100) badges.push({ icon: <Target className="w-3.5 h-3.5" />, label: "Champion", desc: "Earned 100+ points" });
  return badges;
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboard();

  // Demo data if empty
  const displayData = leaderboardData.length > 0 ? leaderboardData : [
    { id: "d1", full_name: "Aarav Sharma", role: "citizen", points: 145, verified: 8 },
    { id: "d2", full_name: "Priya Patel", role: "citizen", points: 120, verified: 6 },
    { id: "d3", full_name: "Rahul Verma", role: "official", points: 95, verified: 5 },
    { id: "d4", full_name: "Sneha Gupta", role: "citizen", points: 60, verified: 3 },
    { id: "d5", full_name: "Arjun Reddy", role: "citizen", points: 35, verified: 2 },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Leaderboard</h1>
          <p className="text-muted-foreground">
            Top contributors helping to improve our city infrastructure.
          </p>
        </div>
        <Trophy className="h-10 w-10 text-amber-500 opacity-20" />
      </div>

      {/* Top 3 Podium */}
      <div className="grid gap-6 md:grid-cols-3">
        {displayData.slice(0, 3).map((user, index) => {
          const tier = getTier(user.points);
          const achievements = getAchievements(user);
          return (
            <Card key={user.id} className={`relative overflow-hidden ${tier.border}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-300'}`} />
              <CardHeader className="p-4 pb-2 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2 text-xl font-bold border-2 border-background shadow-sm">
                  {getInitials(user.full_name)}
                </div>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  {user.full_name}
                  {user.role === "official" && <span title="Official"><ShieldCheck className="h-4 w-4 text-blue-500" /></span>}
                </CardTitle>
                <CardDescription>
                  {index === 0 ? <span className="text-amber-600 font-semibold flex items-center justify-center gap-1"><Trophy className="h-3 w-3"/> Rank #1</span> : `Rank #${index + 1}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-center space-y-3">
                <div className="text-2xl font-bold">{user.points} <span className="text-sm font-normal text-muted-foreground">pts</span></div>
                
                {/* Tier Badge */}
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tier.bg} ${tier.color} border ${tier.border}`}>
                  <Star className="w-3 h-3 mr-1 fill-current" /> {tier.name}
                </div>

                {/* Achievement Badges */}
                {achievements.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {achievements.map((badge, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground" title={badge.desc}>
                        {badge.icon} {badge.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress to next tier */}
                {tier.nextAt && (
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{tier.name}</span>
                      <span>{tier.next}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((user.points / tier.nextAt) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{tier.nextAt - user.points} pts to {tier.next}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Ranking Table */}
      <Card>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="border-b">
                <th className="h-10 px-4 text-left font-medium">Rank</th>
                <th className="h-10 px-4 text-left font-medium">Citizen</th>
                <th className="h-10 px-4 text-center font-medium">Tier</th>
                <th className="h-10 px-4 text-right font-medium">Verifications</th>
                <th className="h-10 px-4 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((user, index) => {
                const tier = getTier(user.points);
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 font-medium">
                        {index + 1}
                        {index === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                        {index === 1 && <Medal className="h-4 w-4 text-slate-400" />}
                        {index === 2 && <Medal className="h-4 w-4 text-orange-400" />}
                      </div>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {getInitials(user.full_name)}
                        </div>
                        {user.full_name}
                        {user.role === "official" && <BadgeLabel>Official</BadgeLabel>}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tier.bg} ${tier.color} border ${tier.border}`}>
                        {tier.name}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right text-muted-foreground">{user.verified}</td>
                    <td className="p-4 align-middle text-right font-semibold">
                      <span className="flex items-center justify-end gap-1">
                        {user.points}
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gamification Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">How Points Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="border rounded-lg p-3">
              <p className="font-bold text-lg">+10</p>
              <p className="text-muted-foreground">Report an Issue</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-bold text-lg">+5</p>
              <p className="text-muted-foreground">Verify a Report</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-bold text-lg">+20</p>
              <p className="text-muted-foreground">Issue Gets Resolved</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-bold text-lg">+2</p>
              <p className="text-muted-foreground">Upvote an Issue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ml-2">
      {children}
    </span>
  );
}

