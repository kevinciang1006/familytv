'use client'

import { useStore } from '@/lib/store'

export default function ReminderToast() {
  const reminder = useStore((s) => s.reminder)
  const setReminder = useStore((s) => s.setReminder)
  const reminderMin = useStore((s) => s.reminderMin)
  const sessionSec = useStore((s) => s.sessionSec)
  const setSessionSec = useStore((s) => s.setSessionSec)

  if (!reminder) return null

  function snooze() {
    const snoozeTarget = sessionSec + reminderMin * 60
    setSessionSec(snoozeTarget - reminderMin * 60)
    setReminder(null)
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-slide-in"
      style={{ width: 'min(480px, calc(100vw - 32px))' }}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: 'var(--ink)', color: 'white', boxShadow: 'var(--shadow-lg-val)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold">{reminder.title}</div>
          <div className="text-[13px] opacity-70">{reminder.text}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={snooze}
            className="px-3 py-1.5 rounded-full text-[13px] font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            Snooze 5m
          </button>
          <button
            onClick={() => setReminder(null)}
            className="px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
