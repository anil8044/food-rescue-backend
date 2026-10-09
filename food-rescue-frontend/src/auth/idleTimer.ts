export function startIdleTimer(options: {
  expiresAt: number
  idleMs: number
  refresh: (expiresAt: number) => void
  expire: () => void
  activityTarget: EventTarget
  visibilityTarget: EventTarget
}) {
  let expiresAt = options.expiresAt
  let stopped = false
  let timer: ReturnType<typeof setTimeout>
  const stop = () => {
    stopped = true
    clearTimeout(timer)
    for (const event of ['click', 'keydown', 'touchstart', 'scroll']) options.activityTarget.removeEventListener(event, activity, true)
    options.activityTarget.removeEventListener('focus', check)
    options.visibilityTarget.removeEventListener('visibilitychange', check)
  }
  const check = () => {
    if (!stopped && Date.now() >= expiresAt) { stop(); options.expire() }
  }
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(check, Math.max(0, expiresAt - Date.now()))
  }
  const activity = () => {
    check()
    if (stopped) return
    expiresAt = Date.now() + options.idleMs
    options.refresh(expiresAt)
    schedule()
  }
  for (const event of ['click', 'keydown', 'touchstart', 'scroll']) options.activityTarget.addEventListener(event, activity, { passive: true, capture: true })
  options.activityTarget.addEventListener('focus', check)
  options.visibilityTarget.addEventListener('visibilitychange', check)
  check()
  if (!stopped) schedule()
  return stop
}

