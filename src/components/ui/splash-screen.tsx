"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Hide splash screen after 5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative h-28 w-28 md:h-32 md:w-32 overflow-hidden shadow-sm border border-zinc-200 rounded-2xl bg-white p-2">
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900"
              >
                {APP_NAME}
              </motion.h1>
              <div className="w-full flex justify-center mt-2">
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.4, duration: 4.0, ease: "linear" }}
                  className="h-1 bg-zinc-900 rounded-full"
                  style={{ maxWidth: "160px" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with subtle entrance */}
      <motion.div
        initial={showSplash ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: showSplash ? 4.8 : 0 }}
        className="w-full h-full min-h-screen"
      >
        {children}
      </motion.div>
    </>
  );
}
