import { type CSSProperties, type ReactNode, useEffect } from 'react'

import { TITLEBAR_HEIGHT } from '@/app/shell/titlebar'
import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { translateNow } from '@/i18n'
import { ESCAPE_PRIORITY, isTopEscapeLayer, pushEscapeLayer } from '@/lib/escape-layers'
import { triggerHaptic } from '@/lib/haptics'
import { registerBackHandler } from '@/lib/mobile-native'
import { cn } from '@/lib/utils'

interface OverlayViewProps {
  children: ReactNode
  onClose: () => void
  closeLabel?: string
  contentClassName?: string
  headerContent?: ReactNode
  rootClassName?: string
}

export function OverlayView({
  children,
  onClose,
  closeLabel = translateNow('common.close'),
  contentClassName,
  headerContent,
  rootClassName
}: OverlayViewProps) {
  const isMobile = useIsMobile()
  const closeOverlay = () => {
    triggerHaptic('close')
    onClose()
  }

  // Esc dismisses every OverlayView-based overlay.
  useEffect(() => {
    const releaseLayer = pushEscapeLayer(ESCAPE_PRIORITY.overlay)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !isTopEscapeLayer(ESCAPE_PRIORITY.overlay)) {
        return
      }

      event.preventDefault()
      triggerHaptic('close')
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    // Hardware back button integration on mobile
    const unregisterBack = registerBackHandler(() => {
      closeOverlay()
      return true
    })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      releaseLayer()
      unregisterBack()
    }
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/30 backdrop-blur-[0.125rem]',
        isMobile
          ? 'p-0'
          : 'p-[calc(var(--titlebar-height)+0.625rem)] sm:p-[calc(var(--titlebar-height)+0.875rem)]'
      )}
      onClick={event => {
        if (event.target === event.currentTarget) {
          closeOverlay()
        }
      }}
      role="presentation"
      style={{ '--titlebar-height': `${TITLEBAR_HEIGHT}px` } as CSSProperties}
    >
      <div
        className={cn(
          'relative flex h-full min-h-0 flex-col overflow-hidden bg-(--ui-chat-surface-background) shadow-md',
          isMobile
            ? 'rounded-none border-0 pt-[var(--safe-area-top)]'
            : 'rounded-xl border border-(--ui-stroke-secondary)',
          rootClassName
        )}
      >
        <div className={cn(
          'pointer-events-none absolute inset-x-0 z-10 h-[calc(var(--titlebar-height)+0.1875rem)] [-webkit-app-region:drag]',
          isMobile ? 'top-[var(--safe-area-top)]' : 'top-0'
        )}>
          {headerContent && (
            <div className="pointer-events-auto absolute left-1/2 top-[calc(0.5rem+var(--titlebar-height)/2)] -translate-x-1/2 -translate-y-1/2 [-webkit-app-region:no-drag]">
              {headerContent}
            </div>
          )}

          <Tip label={closeLabel}>
            <Button
              aria-label={closeLabel}
              className={cn(
                'pointer-events-auto absolute right-3 top-[calc(0.1875rem+var(--titlebar-height)/2)] -translate-y-1/2 text-(--ui-text-tertiary) hover:bg-(--chrome-action-hover) hover:text-foreground [-webkit-app-region:no-drag]',
                isMobile && 'h-10 w-10 min-h-[40px] min-w-[40px]'
              )}
              onClick={closeOverlay}
              size="icon-titlebar"
              variant="ghost"
            >
              <Codicon name="close" size="1rem" />
            </Button>
          </Tip>
        </div>

        {/* No top padding here: the split-layout columns own their own
            titlebar clearance so their backgrounds run flush to the card top
            (otherwise the card surface shows as a gap above the sidebar). */}
        <div className={cn('min-h-0 flex flex-1 flex-col', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}
