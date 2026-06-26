import { Gift, Coffee, Bus, Ticket, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Reward {
  id: string;
  title: string;
  provider: string;
  cost: number;
  icon: any;
  color: string;
  description: string;
}

const REWARDS: Reward[] = [
  {
    id: "1",
    title: "Free Coffee",
    provider: "Joe's Cafe",
    cost: 50,
    icon: Coffee,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "One free medium drip coffee or espresso drink."
  },
  {
    id: "2",
    title: "Day Transit Pass",
    provider: "City Metro",
    cost: 150,
    icon: Bus,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Unlimited rides on buses and subways for 24 hours."
  },
  {
    id: "3",
    title: "Movie Ticket",
    provider: "Starlight Cinemas",
    cost: 300,
    icon: Ticket,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "One standard admission ticket for any regular showing."
  },
  {
    id: "4",
    title: "Energy Bill Credit ($10)",
    provider: "City Power Co",
    cost: 500,
    icon: Zap,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    description: "$10 credit applied directly to your next utility bill."
  }
];

export function RewardCard({ reward, userPoints, onRedeem }: { reward: Reward, userPoints: number, onRedeem: (id: string) => void }) {
  const Icon = reward.icon;
  const canAfford = userPoints >= reward.cost;

  return (
    <Card className="flex flex-col overflow-hidden border border-zinc-200 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md hover:-translate-y-[2px]">
      <div className={`h-20 ${reward.color} flex items-center justify-center border-b border-zinc-100`}>
        <Icon className="w-8 h-8 text-zinc-600" />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start mb-1">
          <CardDescription className="font-semibold text-primary">{reward.provider}</CardDescription>
          <div className="flex items-center gap-1 font-bold text-sm bg-muted px-2 py-0.5 rounded-full">
            <Gift className="w-3 h-3 text-primary" /> {reward.cost}
          </div>
        </div>
        <CardTitle className="text-xl">{reward.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{reward.description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className="w-full active:scale-[0.98] transition-transform" 
          variant={canAfford ? "default" : "secondary"}
          disabled={!canAfford}
          onClick={() => onRedeem(reward.id)}
        >
          {canAfford ? "Redeem Reward" : `Need ${reward.cost - userPoints} more points`}
        </Button>
      </CardFooter>
    </Card>
  );
}
