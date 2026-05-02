'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AsnafTaskCardProps {
  title: string;
  description?: string;
  priority?: 'normal' | 'urgent' | 'critical';
  progress: number;
  daysLeft?: number;
  officers?: { name: string; avatar?: string }[];
  className?: string;
}

export function AsnafTaskCard({
  title,
  description,
  priority = 'normal',
  progress,
  daysLeft,
  officers = [],
  className,
}: AsnafTaskCardProps) {
  const priorityColors = {
    normal: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    urgent: 'bg-warning/10 text-warning border-warning/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const priorityLabels = {
    normal: 'Rutin',
    urgent: 'Segera',
    critical: 'Kritikal',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "glass group p-5 flex flex-col gap-4 min-w-[300px]",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold", priorityColors[priority])}>
          {priorityLabels[priority]}
        </Badge>
        {daysLeft && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {daysLeft} Hari Lagi
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span>Verifikasi</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex -space-x-2">
          {officers.slice(0, 3).map((officer, i) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-background shadow-sm">
              <AvatarImage src={officer.avatar} />
              <AvatarFallback className="text-[8px]">{officer.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          {officers.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">
              +{officers.length - 3}
            </div>
          )}
        </div>
        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
          Lihat Kes
        </button>
      </div>
    </motion.div>
  );
}
