import { useState, useCallback } from "react"

const STORAGE_PREFIX = "walkthrough_dismissed_"

export function isWalkthroughDismissed(key: string): boolean {
  return localStorage.getItem(STORAGE_PREFIX + key) === "true"
}

export function useWalkthrough(moduleKey: string) {
  const [open, setOpen] = useState(() => !isWalkthroughDismissed(moduleKey))

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_PREFIX + moduleKey, "true")
    setOpen(false)
  }, [moduleKey])

  const reopen = useCallback(() => {
    setOpen(true)
  }, [])

  return { open, setOpen, dismiss, reopen }
}

export function dismissWalkthrough(key: string) {
  localStorage.setItem(STORAGE_PREFIX + key, "true")
}

export function reopenWalkthrough(key: string): boolean {
  localStorage.removeItem(STORAGE_PREFIX + key)
  return true
}
