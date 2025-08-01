import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { getSystemTheme, changePageTheme, setLocalTheme } from '@/utils/theme'
import { themeAtom } from '@/store/theme'
import { throttle } from 'lodash-es'

export function ThemeProvider() {
  const theme = useAtomValue(themeAtom)
  const themeRef = useRef(theme)

  // 添加节流处理，限制主题变化频率为200ms
  const throttledSetTheme = useRef(
    throttle((newTheme: string) => {
      setLocalTheme(newTheme)

      if (newTheme === 'system') {
        const systemTheme = getSystemTheme()
        changePageTheme(systemTheme)
      } else {
        changePageTheme(newTheme)
      }
    }, 200)
  ).current

  function handlePrefersColorSchemeChange(event: MediaQueryListEvent) {
    if (theme === 'system') {
      // 系统主题变化时不使用节流，确保及时响应
      changePageTheme(event.matches ? 'dark' : 'light')
    }
  }

  useEffect(() => {
    // 初始应用主题
    if (theme === 'system') {
      const systemTheme = getSystemTheme()
      changePageTheme(systemTheme)
    } else {
      changePageTheme(theme)
    }

    themeRef.current = theme

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', handlePrefersColorSchemeChange)

    return () => {
      query.removeEventListener('change', handlePrefersColorSchemeChange)
      throttledSetTheme.cancel()
    }
  }, [theme, throttledSetTheme])

  // 使用单独的effect处理主题节流
  useEffect(() => {
    if (themeRef.current !== theme) {
      throttledSetTheme(theme)
    }
  }, [theme, throttledSetTheme])

  return null
}
