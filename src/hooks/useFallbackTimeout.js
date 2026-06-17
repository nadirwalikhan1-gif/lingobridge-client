import { useEffect } from 'react'

/**
 * Standard fallback delay (ms) used across the interpreter dashboard for
 * ending a loading state when an expected socket event never arrives
 * (e.g. dropped connection, server-side miss). Previously this value was
 * copy-pasted per page with inconsistent values (3000/4000/5000) — keep
 * any future change here so all pages stay in sync.
 */
export const FALLBACK_TIMEOUT_MS = 5000

/**
 * Ends a loading state once `data` arrives, or after `timeoutMs` as a
 * fallback if the expected real-time event never fires.
 *
 * Only suitable for effects where the fallback timer is the *entire*
 * effect (no other socket listeners/cleanup sharing the same effect).
 * Pages where the timer lives inside a larger socket-setup effect keep
 * their inline `setTimeout`, just referencing FALLBACK_TIMEOUT_MS instead
 * of a hardcoded number, to avoid restructuring effects that also manage
 * socket listener cleanup.
 */
export function useFallbackTimeout(data, setIsLoading, timeoutMs = FALLBACK_TIMEOUT_MS) {
  useEffect(() => {
    if (data) {
      setIsLoading(false)
      return
    }
    const timer = setTimeout(() => setIsLoading(false), timeoutMs)
    return () => clearTimeout(timer)
  }, [data, timeoutMs])
}
