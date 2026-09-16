import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { StatusBar, Style } from '@capacitor/status-bar'

export type BackHandler = () => boolean

const backHandlerStack: BackHandler[] = []

/**
 * Register a back-button handler (e.g. close drawer, close modal, close dropdown).
 * Handlers are invoked LIFO (most recently registered first).
 * If a handler returns true, back navigation was consumed.
 */
export function registerBackHandler(handler: BackHandler): () => void {
  backHandlerStack.push(handler)
  return () => {
    const idx = backHandlerStack.lastIndexOf(handler)
    if (idx !== -1) {
      backHandlerStack.splice(idx, 1)
    }
  }
}

/**
 * Checks if the app is running in a native mobile environment (Capacitor Android/iOS).
 */
export function isNativeMobile(): boolean {
  if (typeof window === 'undefined') return false
  return Capacitor.isNativePlatform() || window.location.protocol === 'capacitor:'
}

/**
 * Initializes native mobile chrome (Status bar, Keyboard, Android back button).
 * Safe to call in browser — returns early if not native.
 */
export function initMobileNativeChrome(): () => void {
  if (!isNativeMobile()) return () => {}

  const cleanups: (() => void)[] = []
  const root = document.documentElement
  root.classList.add('capacitor-native')

  const platform = Capacitor.getPlatform()
  if (platform === 'android') {
    root.classList.add('platform-android')
  }

  // Configure Status Bar
  const updateStatusBar = async () => {
    try {
      const isDark = root.classList.contains('dark')
      await StatusBar.setOverlaysWebView({ overlay: true })
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
      if (platform === 'android') {
        // Transparent navigation / status bar for edge-to-edge
        await StatusBar.setBackgroundColor({ color: '#00000000' })
      }
    } catch {
      // Ignore in unsupported environments
    }
  }

  void updateStatusBar()

  // Track theme changes for status bar
  const themeObserver = new MutationObserver(() => {
    void updateStatusBar()
  })
  themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })
  cleanups.push(() => themeObserver.disconnect())

  // Configure Keyboard with zero jitter
  try {
    void Keyboard.setResizeMode({ mode: KeyboardResize.None })
    void Keyboard.setAccessoryBarVisible({ isVisible: false })

    const showSub = Keyboard.addListener('keyboardWillShow', info => {
      const height = Math.max(0, Math.round(info.keyboardHeight))
      root.style.setProperty('--keyboard-inset', `${height}px`)
      root.classList.add('keyboard-open')
    })
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      root.style.setProperty('--keyboard-inset', '0px')
      root.classList.remove('keyboard-open')
    })

    cleanups.push(() => {
      void showSub.then(s => s.remove())
      void hideSub.then(s => s.remove())
    })
  } catch {
    // Ignore keyboard setup error
  }

  // Configure Android Back Button
  try {
    const backSub = App.addListener('backButton', ({ canGoBack }) => {
      // Try registered handlers from top to bottom
      for (let i = backHandlerStack.length - 1; i >= 0; i--) {
        const handler = backHandlerStack[i]
        if (handler && handler()) {
          return
        }
      }

      // If no custom handler consumed the back event
      if (canGoBack) {
        window.history.back()
      } else {
        void App.exitApp()
      }
    })

    cleanups.push(() => {
      void backSub.then(s => s.remove())
    })
  } catch {
    // Ignore back button setup error
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
  }
}
