"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Map as MapIcon, 
  PlusCircle, 
  BarChart3, 
  Trophy, 
  LogOut,
  BrainCircuit,
  CheckSquare,
  Gift,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // The sidebar is visually compact only if it's manually collapsed AND not currently hovered
  const isCompact = isCollapsed && !isHovered;

  const navItems = [
    { href: "/dashboard", label: "Live Map", icon: MapIcon },
    { href: "/report", label: "Report Issue", icon: PlusCircle },
    { href: "/verify/swipe", label: "Quick Verify", icon: CheckSquare },
    { href: "/command-center", label: "Command Center", icon: BrainCircuit },
    { href: "/escalations", label: "Escalation Engine", icon: ShieldAlert },
    { href: "/command", label: "Situation Room", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCompact ? 80 : 260 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden md:flex flex-col bg-white border-r border-zinc-200 h-screen flex-shrink-0 relative z-20"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-4 lg:h-[60px] overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold flex-shrink-0">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex-shrink-0"
          >
            <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="rounded-md object-cover border shadow-sm" />
          </motion.div>
          <AnimatePresence mode="popLayout">
            {!isCompact && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="tracking-tight text-zinc-900 font-bold whitespace-nowrap"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <AnimatePresence mode="popLayout">
          {!isCompact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 ml-2 flex-shrink-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Pin Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-auto py-4 scrollbar-thin">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1 overflow-hidden">
          <AnimatePresence>
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    href={item.href}
                    title={isCompact ? item.label : undefined}
                    className={`relative flex items-center gap-3 rounded-md py-2.5 outline-none group active:scale-[0.98] transition-transform ${isCompact ? "px-0 justify-center" : "px-3"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 bg-zinc-900 rounded-md shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    
                    {!isActive && (
                      <div className="absolute inset-0 bg-zinc-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                    )}

                    <item.icon 
                      className={`h-4 w-4 relative z-10 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900"
                      }`} 
                    />
                    
                    <AnimatePresence mode="popLayout">
                      {!isCompact && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`relative z-10 whitespace-nowrap transition-colors duration-200 text-sm ${
                            isActive ? "text-zinc-50 font-medium" : "text-zinc-600 group-hover:text-zinc-900"
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
      </div>

      <div className="mt-auto border-t border-zinc-100 p-4">
        <form action={logout}>
          <Button 
            variant="ghost" 
            className={`w-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all rounded-md active:scale-[0.98] ${isCompact ? "justify-center px-0" : "justify-start gap-2"}`}
            title={isCompact ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence mode="popLayout">
              {!isCompact && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
