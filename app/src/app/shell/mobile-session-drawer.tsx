import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useEffect } from 'react'

import { Codicon } from '@/components/ui/codicon'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { registerBackHandler } from '@/lib/mobile-native'
import { $sidebarOpen, setSidebarOpen } from '@/store/layout'

interface MobileSessionDrawerProps {
  children: React.ReactNode
}

export function MobileSessionDrawer({ children }: MobileSessionDrawerProps) {
  const sidebarOpen = useStore($sidebarOpen)

  // Intercept Android hardware back-button to close drawer
  useEffect(() => {
    if (!sidebarOpen) return

    return registerBackHandler(() => {
      setSidebarOpen(false)
      return true
    })
  }, [sidebarOpen])

  return (
    <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
      <SheetContent
        className="flex h-full w-[85vw] max-w-[340px] flex-col border-r border-(--ui-stroke-secondary) bg-(--ui-sidebar-surface-background) p-0 shadow-2xl z-50 overflow-hidden"
        showCloseButton={false}
        side="left"
      >
        {/* Drawer header with safe-area top */}
        <div className="flex h-[calc(3.25rem+var(--safe-area-top))] pt-(--safe-area-top) w-full shrink-0 items-center justify-between border-b border-(--ui-stroke-tertiary) bg-(--ui-sidebar-surface-background) px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--ui-text-secondary)">Sessions</span>
          <button
            aria-label="Close sessions"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-(--ui-text-secondary) hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95 transition-all"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <Codicon name="close" size="1.15rem" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
