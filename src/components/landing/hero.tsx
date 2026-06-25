"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Zap } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

export function HeroSection({ metrics }: { metrics: any }) {
  const resolvedIssues = metrics?.totalIssues ? (metrics.totalIssues * (metrics.resolutionRate / 100)).toFixed(0) : 0;

  return (
    <section className="w-full py-24 lg:py-32 relative border-b">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary"
          >
            <Activity className="mr-2 h-4 w-4" />
            <span className="font-semibold">{resolvedIssues}</span>
            <span className="ml-1 text-muted-foreground">issues resolved to date</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            A Smarter Way to Fix <br className="hidden sm:inline" /> Your Community
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-[700px] text-muted-foreground md:text-xl/relaxed"
          >
            Report local infrastructure problems instantly. Our AI automatically categorizes and deduplicates reports, while community verification ensures officials focus on what matters most.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-md font-semibold">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-md font-semibold">
                <Zap className="mr-2 h-4 w-4" /> View Live Map
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
