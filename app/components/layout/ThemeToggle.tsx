'use client'

import { useState, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialDark() {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return stored === 'dark' || (!stored && prefersDark)
}

export function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun size={16} className="text-zinc-400" /> : <Moon size={16} className="text-zinc-600" />}
    </button>
  )
}
