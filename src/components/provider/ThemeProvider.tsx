import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { getSystemTheme, changePageTheme, setLocalTheme } from '@/utils/theme'
import { themeAtom } from '@/store/theme'
import { throttle } from 'lodash-es'

export function ThemeProvider() {
  const theme = useAtomValue(themeAtom)
  const themeRef = useRef(theme)
  const [isInitialized, setIsInitialized] = useState(false)

  // 添加节流处理，限制主题变化频率为200ms
  const throttledSetTheme = useRef(
    throttle((newTheme: string) => {
      setLocalTheme(newTheme)

      const appliedTheme = newTheme === 'system' ? getSystemTheme() : newTheme
      changePageTheme(appliedTheme)
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
    const appliedTheme = theme === 'system' ? getSystemTheme() : theme
    changePageTheme(appliedTheme)
    setIsInitialized(true)

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
    // 初始化阶段不触发节流处理
    if (isInitialized && themeRef.current !== theme) {
      throttledSetTheme(theme)
    }
    themeRef.current = theme
  }, [theme, throttledSetTheme, isInitialized])

  return null
}
