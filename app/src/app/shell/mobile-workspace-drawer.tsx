import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useEffect } from 'react'

import { RightSidebarPane } from '@/app/right-sidebar'
import { ReviewPane } from '@/app/right-sidebar/review'
import { TerminalPaneChrome } from '@/app/right-sidebar/terminal/chrome'
import { $terminals } from '@/app/right-sidebar/terminal/terminals'
import { Codicon } from '@/components/ui/codicon'
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet'
import { registerBackHandler } from '@/lib/mobile-native'
import { cn } from '@/lib/utils'
import {
  $mobileWorkspaceActiveTab,
  $mobileWorkspaceDrawerOpen,
  type MobileWorkspaceTab,
  setMobileWorkspaceActiveTab,
  setMobileWorkspaceDrawerOpen
} from '@/store/layout'
import { $reviewFiles } from '@/store/review'
import { $currentCwd } from '@/store/session'

interface MobileWorkspaceDrawerProps {
  onActivateFile?: (path: string) => void
  onActivateFolder?: (path: string, recursive?: boolean) => void
}

export function MobileWorkspaceDrawer({ onActivateFile, onActivateFolder }: MobileWorkspaceDrawerProps) {
  const workspaceOpen = useStore($mobileWorkspaceDrawerOpen)
  const activeTab = useStore($mobileWorkspaceActiveTab)
  const terminals = useStore($terminals)
  const reviewFiles = useStore($reviewFiles)
  const currentCwd = useStore($currentCwd)

  const terminalsCount = terminals.length
  const changesCount = reviewFiles.length

  // Hardware Android back button closes the drawer
  useEffect(() => {
    if (!workspaceOpen) return

    return registerBackHandler(() => {
      setMobileWorkspaceDrawerOpen(false)
      return true
    })
  }, [workspaceOpen])

  return (
    <Sheet onOpenChange={setMobileWorkspaceDrawerOpen} open={workspaceOpen}>
      <SheetContent
        className="flex h-full w-[94vw] max-w-[520px] flex-col border-l border-(--ui-stroke-secondary) bg-(--ui-sidebar-surface-background) p-0 shadow-2xl z-50 overflow-hidden"
        showCloseButton={false}
        side="right"
      >
        {/* Drawer header with safe-area top and segmented navigation */}
        <div className="flex h-[calc(3.25rem+var(--safe-area-top))] pt-(--safe-area-top) w-full shrink-0 items-center justify-between border-b border-(--ui-stroke-tertiary) bg-(--ui-chat-surface-background)/95 px-3">
          {/* Segmented Tab controls */}
          <div className="flex items-center rounded-lg border border-(--ui-stroke-tertiary) bg-(--ui-control-background)/70 p-0.5">
            <button
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all select-none',
                activeTab === 'terminal'
                  ? 'bg-(--ui-control-active-background) text-foreground shadow-xs'
                  : 'text-(--ui-text-secondary) hover:text-foreground'
              )}
              onClick={() => setMobileWorkspaceActiveTab('terminal')}
              type="button"
            >
              <Codicon name="terminal" size="0.95rem" />
              <span>Terminal</span>
              {terminalsCount > 0 && (
                <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] text-sky-400 font-semibold">
                  {terminalsCount}
                </span>
              )}
            </button>

            <button
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all select-none',
                activeTab === 'files'
                  ? 'bg-(--ui-control-active-background) text-foreground shadow-xs'
                  : 'text-(--ui-text-secondary) hover:text-foreground'
              )}
              onClick={() => setMobileWorkspaceActiveTab('files')}
              type="button"
            >
              <Codicon name="folder-opened" size="0.95rem" />
              <span>Files</span>
            </button>

            <button
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all select-none',
                activeTab === 'changes'
                  ? 'bg-(--ui-control-active-background) text-foreground shadow-xs'
                  : 'text-(--ui-text-secondary) hover:text-foreground'
              )}
              onClick={() => setMobileWorkspaceActiveTab('changes')}
              type="button"
            >
              <Codicon name="git-commit" size="0.95rem" />
              <span>Changes</span>
              {changesCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-400 font-semibold">
                  {changesCount}
                </span>
              )}
            </button>
          </div>

          {/* Close button */}
          <button
            aria-label="Close drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-(--ui-text-secondary) hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95 transition-all"
            onClick={() => setMobileWorkspaceDrawerOpen(false)}
            type="button"
          >
            <Codicon name="close" size="1.15rem" />
          </button>
        </div>

        {/* Tab content area */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-(--ui-chat-surface-background)">
          {activeTab === 'terminal' && (
            <div className="flex h-full w-full flex-col overflow-hidden bg-(--ui-editor-surface-background)">
              <TerminalPaneChrome />
            </div>
          )}

          {activeTab === 'files' && (
            <div className="flex h-full w-full flex-col overflow-hidden">
              <RightSidebarPane
                key={currentCwd || 'no-cwd'}
                onActivateFile={path => {
                  onActivateFile?.(path)
                  setMobileWorkspaceDrawerOpen(false)
                }}
                onActivateFolder={path => {
                  onActivateFolder?.(path)
                  setMobileWorkspaceDrawerOpen(false)
                }}
              />
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="flex h-full w-full flex-col overflow-hidden">
              <ReviewPane key={currentCwd || 'no-cwd'} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
