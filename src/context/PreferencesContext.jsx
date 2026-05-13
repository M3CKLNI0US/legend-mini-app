import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeToUser } from '../firebase'
import { normalizeLang, translate } from '../i18n/strings'

const PreferencesContext = createContext({
  language: 'ru',
  themePreference: 'auto',
  themeEffective: 'dark',
  t: (key) => translate('ru', key),
})

export function PreferencesProvider({ user, webApp, children }) {
  const [language, setLanguage] = useState('ru')
  const [themePreference, setThemePreference] = useState('auto')

  useEffect(() => {
    if (!user?.id) return undefined
    return subscribeToUser(user.id, (data) => {
      if (!data) return
      setLanguage(normalizeLang(data.language))
      const tp = data.themePreference
      setThemePreference(tp === 'light' || tp === 'dark' || tp === 'auto' ? tp : 'auto')
    })
  }, [user?.id])

  const themeEffective = useMemo(() => {
    if (themePreference === 'light') return 'light'
    if (themePreference === 'dark') return 'dark'
    return webApp?.colorScheme === 'light' ? 'light' : 'dark'
  }, [themePreference, webApp?.colorScheme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-app-theme', themeEffective)
    root.style.colorScheme = themeEffective
    const langAttr = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en' : 'ru'
    root.setAttribute('lang', langAttr)
  }, [themeEffective, language])

  const t = useCallback((key) => translate(language, key), [language])

  const value = useMemo(
    () => ({
      language,
      themePreference,
      themeEffective,
      t,
    }),
    [language, themePreference, themeEffective, t]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  return useContext(PreferencesContext)
}
