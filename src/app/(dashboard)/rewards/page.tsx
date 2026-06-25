"use client";

import { useState, useEffect } from "react";
import { RewardCard } from "@/components/rewards/reward-card";
import { Gift, Wallet, Coffee, Bus, Ticket, Zap } from "lucide-react";
const useToast = () => ({
  toast: (options: any) => alert(`${options.title}\n${options.description || ""}`)
});
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { APP_NAME } from "@/lib/constants";

const REWARDS = [
  {
    id: "1",
    title: "Free Coffee",
    provider: "Blue Tokai Coffee",
    cost: 50,
    icon: Coffee,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    description: "One free regular Americano or Cappuccino."
  },
  {
    id: "2",
    title: "Day Transit Pass",
    provider: "Delhi Metro (DMRC)",
    cost: 150,
    icon: Bus,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Unlimited rides on the Delhi Metro network for 24 hours."
  },
  {
    id: "3",
    title: "Movie Ticket",
    provider: "PVR Cinemas",
    cost: 300,
    icon: Ticket,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    description: "One standard admission ticket for any regular showing."
  },
  {
    id: "4",
    title: "Utility Bill Credit (₹500)",
    provider: "BSES Rajdhani Power",
    cost: 500,
    icon: Zap,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    description: "₹500 credit applied directly to your next electricity bill."
  }
];

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [selectedReward, setSelectedReward] = useState<any>(null);

  useEffect(() => {
    import("@/app/(dashboard)/actions").then((mod) => {
      mod.getUserProfile().then((profile) => setPoints(profile.points));
    });
  }, []);
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async (id: string) => {
    const reward = REWARDS.find(r => r.id === id);
    if (!reward || points < reward.cost || isRedeeming) return;

    setIsRedeeming(true);
    const { redeemRewardAction } = await import("./actions");
    const result = await redeemRewardAction(reward.cost, reward.id);
    setIsRedeeming(false);

    if (result.success) {
      setPoints(prev => prev - reward.cost);
      setSelectedReward(reward);
      
      toast({
        title: "Reward Redeemed!",
        description: `You've spent ${reward.cost} points for ${reward.title}.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Redemption Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Rewards</h1>
          <p className="text-muted-foreground mt-1">
            Exchange your Hero Points for real-world perks from local businesses.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-xl font-bold text-lg shadow-sm">
          <Wallet className="w-6 h-6" />
          Balance: {points} Pts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REWARDS.map(reward => (
          <RewardCard 
            key={reward.id} 
            reward={reward} 
            userPoints={points} 
            onRedeem={handleRedeem} 
          />
        ))}
      </div>

      <div className="mt-12 bg-muted p-6 rounded-xl border flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Are you a local business?
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Partner with {APP_NAME} to offer rewards. Drive foot traffic to your store while supporting citizens who keep our city clean and safe.
          </p>
        </div>
        <button className="whitespace-nowrap px-4 py-2 bg-background border rounded-lg font-medium shadow-sm hover:bg-muted/50 transition-colors">
          Partner With Us
        </button>
      </div>

      <Dialog open={!!selectedReward} onOpenChange={(open: boolean) => !open && setSelectedReward(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Your Reward Voucher</DialogTitle>
            <DialogDescription className="text-center">
              Show this QR code at {selectedReward?.provider} to claim your {selectedReward?.title}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <QRCodeSVG 
                value={`community-hero-reward-${selectedReward?.id}-${Date.now()}`} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border w-full">
              <p className="font-mono mb-1">VOUCHER ID: CH-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p>Valid for 30 days from redemption.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
