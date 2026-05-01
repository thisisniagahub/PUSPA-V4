'use client';

import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/stores/app-store';
import { ROLE_CONFIG } from './sidebar-config';

import Magnetic from '@/components/ui/magnetic';

const BRAND_COLOR = '#ecb2ff';

export function SidebarFooter({ collapsed, role, userLabel }: { collapsed: boolean; role: UserRole; userLabel: string }) {
  const config = ROLE_CONFIG[role];
  const avatarLabel = userLabel.trim().charAt(0).toUpperCase() || 'P';
  const { signOut } = useAuth();

  return (
    <div className={cn('px-4 py-3 transition-[padding] duration-300 motion-reduce:transition-none', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-4')}>
      <Magnetic strength={0.15} className="w-full">
        <div className={cn('flex items-center gap-2 rounded-xl glass px-2.5 py-2.5 transition-all hover:border-white/20', collapsed && 'justify-center')}>
          <div
            className={cn('flex shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold shadow-[0_0_15px_rgba(192,132,252,0.3)]', collapsed ? 'h-8 w-8' : 'h-9 w-9')}
            style={{ color: BRAND_COLOR }}
            aria-hidden="true"
          >
            {avatarLabel}
          </div>
          <div
            className={cn(
              'flex min-w-0 flex-col overflow-hidden transition-[max-width,opacity] duration-300 motion-reduce:transition-none',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100',
            )}
          >
            <span className="truncate text-xs font-bold text-foreground">{userLabel}</span>
            <span className="truncate text-[10px] text-muted-foreground font-medium">{config.label}</span>
          </div>
        </div>
      </Magnetic>

      <Magnetic strength={0.1} className="w-full">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn('w-full hover:bg-destructive/10 hover:text-destructive group transition-colors', collapsed ? 'h-9 w-9' : 'justify-start gap-2')}
          onClick={() => void signOut()}
          aria-label="Log keluar"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          {!collapsed && <span className="font-semibold">Log keluar</span>}
        </Button>
      </Magnetic>

      <Separator className="bg-border/40" />
      <div className={cn('flex items-center gap-3 overflow-hidden transition-[gap] duration-300 motion-reduce:transition-none pb-2', collapsed && 'justify-center')}>
        <div className={cn('flex shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 p-1.5', collapsed ? 'h-7 w-7' : 'h-9 w-9')}>
          <Image src="/puspa-logo-official.png" alt="PUSPA" width={collapsed ? 16 : 24} height={collapsed ? 16 : 24} className="object-contain" />
        </div>
        <div
          className={cn(
            'flex flex-col gap-0 overflow-hidden transition-[max-width,opacity] duration-300 motion-reduce:transition-none',
            collapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100',
          )}
        >
          <span className="whitespace-nowrap text-[11px] font-bold tracking-tight" style={{ color: BRAND_COLOR }}>PUSPA KL & Selangor</span>
          <span className="whitespace-nowrap text-[9px] text-muted-foreground font-mono">STABLE v3.2.0</span>
        </div>
      </div>
    </div>
  );
}
