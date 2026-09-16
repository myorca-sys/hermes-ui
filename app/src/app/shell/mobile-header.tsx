import { useStore } from '@nanostores/react'
import type * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { $terminals } from '@/app/right-sidebar/terminal/terminals'
import { NEW_CHAT_ROUTE } from '@/app/routes'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { cn } from '@/lib/utils'
import { $mobileWorkspaceDrawerOpen, toggleMobileWorkspaceDrawerOpen, toggleSidebarOpen } from '@/store/layout'
import { $reviewFiles } from '@/store/review'
import { $currentModel, $gatewayState, $modelPickerOpen } from '@/store/session'

interface MobileHeaderProps {
  onOpenSettings?: () => void
  className?: string
}

export function MobileHeader({ onOpenSettings, className }: MobileHeaderProps) {
  const navigate = useNavigate()
  const currentModel = useStore($currentModel)
  const gatewayState = useStore($gatewayState)
  const terminals = useStore($terminals)
  const reviewFiles = useStore($reviewFiles)
  const workspaceOpen = useStore($mobileWorkspaceDrawerOpen)

  const activeTerminalsCount = terminals.length
  const changedFilesCount = reviewFiles.length

  const displayModel = currentModel ? currentModel.split('/').pop() : 'Hermes'

  return (
    <header
      className={cn(
        'relative z-40 flex h-(--mobile-header-height) pt-(--safe-area-top) w-full shrink-0 items-center justify-between border-b border-(--ui-stroke-tertiary) bg-(--ui-chat-surface-background)/95 px-2 backdrop-blur-md transition-none select-none',
        className
      )}
    >
      {/* Left controls: Sidebar toggle & New Chat */}
      <div className="flex items-center gap-1">
        <Button
          aria-label="Toggle sessions menu"
          className="h-10 w-10 min-w-10 rounded-lg p-0 text-foreground/80 hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95"
          onClick={toggleSidebarOpen}
          size="icon"
          variant="ghost"
        >
          <Codicon name="menu" size="1.25rem" />
        </Button>

        <Button
          aria-label="New chat"
          className="h-10 w-10 min-w-10 rounded-lg p-0 text-foreground/80 hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95"
          onClick={() => navigate(NEW_CHAT_ROUTE)}
          size="icon"
          variant="ghost"
        >
          <Codicon name="add" size="1.25rem" />
        </Button>
      </div>

      {/* Center: Model picker & Gateway status */}
      <button
        aria-label="Select model"
        className="flex max-w-[45vw] items-center gap-1.5 rounded-full border border-(--ui-stroke-tertiary) bg-(--ui-control-background)/80 px-3 py-1 text-xs font-medium text-foreground hover:bg-(--ui-control-hover-background) active:scale-98 transition-all"
        onClick={() => $modelPickerOpen.set(true)}
        type="button"
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full shrink-0',
            gatewayState === 'open' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'
          )}
        />
        <span className="truncate">{displayModel}</span>
        <Codicon className="text-(--ui-text-tertiary) shrink-0 opacity-70" name="chevron-down" size="0.875rem" />
      </button>

      {/* Right controls: Workspace drawer toggle & Settings */}
      <div className="flex items-center gap-1">
        <Button
          aria-label="Toggle workspace drawer"
          className={cn(
            'relative h-10 w-10 min-w-10 rounded-lg p-0 text-foreground/80 hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95',
            workspaceOpen && 'bg-(--ui-control-active-background) text-foreground'
          )}
          onClick={toggleMobileWorkspaceDrawerOpen}
          size="icon"
          variant="ghost"
        >
          <Codicon name="terminal" size="1.15rem" />
          {(activeTerminalsCount > 0 || changedFilesCount > 0) && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
          )}
        </Button>

        {onOpenSettings && (
          <Button
            aria-label="Settings"
            className="h-10 w-10 min-w-10 rounded-lg p-0 text-foreground/80 hover:bg-(--ui-control-hover-background) hover:text-foreground active:scale-95"
            onClick={onOpenSettings}
            size="icon"
            variant="ghost"
          >
            <Codicon name="settings-gear" size="1.15rem" />
          </Button>
        )}
      </div>
    </header>
  )
}
