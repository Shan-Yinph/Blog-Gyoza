import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'
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
        // 添加主题切换过渡类
        document.documentElement.classList.add('theme-transition')
        changePageTheme(appliedTheme)
        appliedThemeRef.current = appliedTheme
        // 移除过渡类
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition')
        }, 300)
      }
    }, 200)
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

  useLayoutEffect(() => {
    // 立即应用主题，避免闪烁
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
  useLayoutEffect(() => {
    if (themeRef.current !== null && themeRef.current !== theme) {
      // 立即应用主题，不使用节流
      setLocalTheme(theme)
      const appliedTheme = theme === 'system' ? getSystemTheme() : theme
      if (appliedTheme !== appliedThemeRef.current) {
        document.documentElement.classList.add('theme-transition')
        changePageTheme(appliedTheme)
        appliedThemeRef.current = appliedTheme
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition')
        }, 300)
      }
    }
    themeRef.current = theme
  }, [theme])

  return null
}
