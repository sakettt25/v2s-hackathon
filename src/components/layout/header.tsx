"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, LogOut, Settings, Check, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Header({ userEmail = "demo.user@communityhero.in", userRole = "citizen" }: { userEmail?: string, userRole?: string }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    import("@/app/(dashboard)/actions").then((mod) => {
      mod.getNotifications().then((data) => setNotifications(data));
    });
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/activity?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const dropdownVariants: any = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 5, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <header className="flex h-14 md:h-[60px] items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-6 relative z-50 sticky top-0">
      <div className="w-full flex-1">
        <form onSubmit={handleSearch}>
          <div className="relative group md:w-2/3 lg:w-1/3">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${isFocused ? 'text-slate-900' : 'text-slate-400'}`} />
            <Input
              type="search"
              placeholder="Search issues, locations, or reports..."
              className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 pl-9 rounded-md transition-all duration-300 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-400 shadow-sm hover:border-slate-300 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {/* Search shortcut hint for desktop */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
               <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>
        </form>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {/* Minimal Notification Dot */}
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-slate-900 border-2 border-white shadow-sm"></span>
          </Button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/50 text-slate-900 overflow-hidden origin-top-right"
              >
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                    <Check className="w-3 h-3"/> Mark all read
                  </button>
                </div>
                <div className="max-h-[320px] overflow-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 text-slate-200" />
                      <span className="text-sm text-slate-500">You're all caught up!</span>
                    </div>
                  ) : (
                    notifications.map((notif: any) => (
                      <Link key={notif.id} href={`/issues/${notif.id}`} className="block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1.5 ${notif.status === 'resolved' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'}`}>
                            {notif.status === 'resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                              {notif.status === 'resolved' ? "Issue Resolved!" : "Validation Needed"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {notif.status === 'resolved' ? (
                                `The issue "${notif.title}" has been fixed by the city.`
                              ) : (
                                `A nearby citizen reported a ${notif.category}. Can you verify?`
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 bg-slate-50 text-center border-t border-slate-100">
                  <Link href="/activity" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">View all Activity</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">Civic Account</span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[120px]">{userEmail}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/50 text-slate-900 overflow-hidden origin-top-right"
              >
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed In As</p>
                    {userRole === "mayor" && (
                      <span title="Mayor of the Week" className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                        Mayor
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold truncate text-slate-900">{userEmail}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/profile" className="flex items-center w-full px-2.5 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <User className="mr-2.5 h-4 w-4 text-slate-400" /> Profile & Stats
                  </Link>
                  <Link href="/settings" className="flex items-center w-full px-2.5 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <Settings className="mr-2.5 h-4 w-4 text-slate-400" /> Account Settings
                  </Link>
                </div>
                <div className="p-1.5 border-t border-slate-100">
                  <form action={logout}>
                    <button type="submit" className="flex w-full items-center px-2.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-md">
                      <LogOut className="mr-2.5 h-4 w-4 text-slate-400" /> Log out
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
