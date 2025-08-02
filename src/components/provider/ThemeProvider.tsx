import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { getSystemTheme, changePageTheme, setLocalTheme } from '@/utils/theme'
import { themeAtom } from '@/store/theme'
import { throttle } from 'lodash-es'

export function ThemeProvider() {
  const theme = useAtomValue(themeAtom)
  const themeRef = useRef<string | null>(null)
  const appliedThemeRef = useRef<string | null>(null)

  // 节流处理主题变更，避免频繁切换
  const throttledSetTheme = useRef(
    throttle((newTheme: string) => {
      setLocalTheme(newTheme)
      const appliedTheme = newTheme === 'system' ? getSystemTheme() : newTheme
      if (appliedTheme !== appliedThemeRef.current) {
        changePageTheme(appliedTheme)
        appliedThemeRef.current = appliedTheme
      }
    }, 300)
  ).current

  // 处理系统主题变化
  function handlePrefersColorSchemeChange(event: MediaQueryListEvent) {
    if (theme === 'system') {
      const newSystemTheme = event.matches ? 'dark' : 'light'
      if (newSystemTheme !== appliedThemeRef.current) {
        changePageTheme(newSystemTheme)
        appliedThemeRef.current = newSystemTheme
      }
    }
  }

  useEffect(() => {
    // 初始化应用主题
    const initialTheme = theme === 'system' ? getSystemTheme() : theme
    changePageTheme(initialTheme)
    appliedThemeRef.current = initialTheme
    themeRef.current = theme

    // 设置系统主题监听
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', handlePrefersColorSchemeChange)

    return () => {
      query.removeEventListener('change', handlePrefersColorSchemeChange)
      throttledSetTheme.cancel()
    }
  }, [theme, throttledSetTheme])

  // 处理主题变更
  useEffect(() => {
    if (themeRef.current !== null && themeRef.current !== theme) {
      throttledSetTheme(theme)
    }
    themeRef.current = theme
  }, [theme, throttledSetTheme])

  return null
}
