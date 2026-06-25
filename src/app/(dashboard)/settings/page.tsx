import { getSession } from "@/lib/auth/jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, User, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  const userEmail = session?.user?.email || "demo.user@communityhero.in";

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="grid gap-6">
        {/* Account Settings */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              Account Information
            </CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input disabled value={userEmail} className="bg-slate-50 cursor-not-allowed max-w-md" />
              <p className="text-xs text-slate-500">Your email is tied to your civic identity and cannot be changed.</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Bell className="w-4 h-4 text-slate-400" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Control how you receive alerts for nearby issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-sm text-slate-800">Email Alerts</p>
                <p className="text-xs text-slate-500">Receive an email when an issue you reported is resolved.</p>
              </div>
              <div className="w-10 h-6 bg-slate-800 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm text-slate-800">Push Notifications</p>
                <p className="text-xs text-slate-500">Get notified immediately when a nearby issue needs verification.</p>
              </div>
              <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Region */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Globe className="w-4 h-4 text-slate-400" />
              Region Settings
            </CardTitle>
            <CardDescription>Set your default city for the map and analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-slate-700">Active City</label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50">
                <option>New Delhi, NCR</option>
                <option>Mumbai, MH</option>
                <option>Bangalore, KA</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
