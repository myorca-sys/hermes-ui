import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from '@/app/layout-constants'
import { isNativeMobile } from '@/lib/mobile-native'

import { useMediaQuery } from './use-media-query'

// Mobile-intent flag. Returns true if on mobile viewport OR in native Capacitor shell.
export const useIsMobile = () => {
  const isQueryMobile = useMediaQuery(SIDEBAR_COLLAPSE_MEDIA_QUERY)
  return isQueryMobile || isNativeMobile()
}
