import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/hero";
import { CityHealthScore } from "@/components/landing/health-score";
import { LiveIssueFeed } from "@/components/landing/live-feed";
import { SpotlightCards } from "@/components/landing/spotlight-section";
import { InteractiveGridBackground } from "@/components/landing/interactive-grid";
import { getAnalytics, getIssues } from "@/lib/data";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [metrics, issues] = await Promise.all([
    getAnalytics(),
    getIssues()
  ]);

  return (
    <InteractiveGridBackground>
      <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-md object-cover shadow-sm border border-slate-200" />
          <span className="text-xl">{APP_NAME}</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-md font-semibold">Join the Movement</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <HeroSection metrics={metrics} />
        
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Platform Metrics</h2>
                  <p className="text-muted-foreground">Transparent accountability for our civic infrastructure.</p>
                </div>
                <CityHealthScore metrics={metrics} />
              </div>
              
              <div className="space-y-8">
                <LiveIssueFeed issues={issues || []} />
              </div>
            </div>
          </div>
        </section>

        <SpotlightCards />
      </main>
      <footer className="border-t bg-background/50 backdrop-blur py-8">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. Built for change.
        </div>
      </footer>
    </InteractiveGridBackground>
  );
}
