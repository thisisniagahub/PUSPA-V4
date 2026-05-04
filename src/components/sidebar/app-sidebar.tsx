'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/app-store';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './sidebar-config';
import { SidebarContent } from './sidebar-content';

function useIsDesktop() {
  const subscribe = useCallback((cb: () => void) => {
    const mq = window.matchMedia('(min-width: 1024px)');
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  );
}

export function AppSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setView = useAppStore((s) => s.setView);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  const width = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <>
      {!isDesktop && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Menu Navigasi PUSPA</SheetTitle>
            <SidebarContent onNavigate={setView} onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <aside
        className="fixed inset-y-0 left-0 z-50 hidden border-r border-white/5 bg-gradient-to-b from-zinc-950 to-black lg:flex lg:flex-col lg:transition-[width] lg:duration-300 lg:ease-in-out motion-reduce:transition-none"
        style={{ width }}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent onNavigate={setView} collapsed={sidebarCollapsed} />
        <div className="absolute -right-3 top-7 z-50 hidden lg:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border bg-background shadow-md transition-[background,transform] duration-200 hover:bg-muted motion-reduce:transition-none motion-reduce:transform-none"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Buka sidebar' : 'Kecilkan sidebar'}
            aria-pressed={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" className="h-3 w-3" /> : <PanelLeftClose aria-hidden="true" className="h-3 w-3" />}
          </Button>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
