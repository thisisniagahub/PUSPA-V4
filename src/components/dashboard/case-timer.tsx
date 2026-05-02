'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Timer as TimerIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CaseTimer({ className }: { className?: string }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <motion.div
      className={cn(
        "glass p-6 flex flex-col gap-4 min-w-[280px]",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Timer Sesi
          </span>
        </div>
        <TimerIcon className="h-4 w-4 text-muted-foreground/40" />
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-4xl font-black tracking-tighter tabular-nums text-foreground">
          {formatTime(seconds)}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-medium mt-1">
          MASA DIHABISKAN UNTUK KES
        </span>
      </div>

      <div className="flex gap-2 justify-center mt-2">
        <Button
          size="sm"
          variant={isActive ? "destructive" : "default"}
          className="rounded-full px-6 h-9 font-bold text-[10px] uppercase tracking-wider"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? (
            <><Square className="h-3 w-3 mr-2" /> Berhenti</>
          ) : (
            <><Play className="h-3 w-3 mr-2" /> Mulai</>
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-9 w-9 border-white/10"
          onClick={reset}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}
