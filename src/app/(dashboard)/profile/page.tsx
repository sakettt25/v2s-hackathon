import { getUserProfile } from "@/lib/data";
import { getSession } from "@/lib/auth/jwt";
import { User, Trophy, Star, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  const profile = await getUserProfile();

  const userEmail = session?.user?.email || "demo.user@communityhero.in";
  const fullName = session?.user?.full_name || "Community Member"; // Next Auth might not have full_name mapped, but we'll fall back

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Stats</h1>
        <p className="text-slate-500 mt-1">Manage your account and view your civic impact.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-1 shadow-sm border-slate-200">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-200">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-500 mb-4">{userEmail}</p>
            
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider border border-slate-200">
              <Shield className="w-3.5 h-3.5" />
              {profile.role}
            </div>
            
            {profile.role === "mayor" && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-50 text-xs font-bold uppercase tracking-wider">
                System Admin (Mayor)
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid gap-6 sm:grid-cols-2">
          <Card className="shadow-sm border-slate-200 flex flex-col justify-center">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-slate-400" />
                Total System Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{profile.points}</div>
              <p className="text-xs text-slate-500 mt-1">Accumulated from validated operations.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 flex flex-col justify-center">
            <CardHeader className="pb-2 border-b border-slate-100 mb-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Star className="w-4 h-4 text-slate-400" />
                Access Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {profile.points >= 500 ? "Level 3 Analyst" : profile.points >= 200 ? "Level 2 Operator" : "Level 1 Reporter"}
              </div>
              <p className="text-xs text-slate-500 mt-1">Based on historical participation metrics.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
