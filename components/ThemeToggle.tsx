"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("bc-theme")
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("bc-theme", next ? "dark" : "light")
  }

  return (
    <button onClick={toggle} className="surface rounded-lg px-3 py-1.5 text-sm" aria-label="Ganti tema">
      {dark ? "☀️ Terang" : "🌙 Gelap"}
    </button>
  )
}
