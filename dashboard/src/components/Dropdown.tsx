import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface Props {
  label: string
  /** summary of the current selection shown on the trigger */
  value: string
  /** true when this category narrows the data; highlights the trigger */
  active: boolean
  onClear?: () => void
  children: ReactNode
}

/** Select-style trigger that opens a small panel of checkbox / radio items */
export function Dropdown({ label, value, active, onClear, children }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
          active || open ? 'border-ink-3 bg-raised' : 'border-line bg-card hover:border-[#48484a]'
        }`}
      >
        <span className="text-ink-3">{label}</span>
        <span className={`max-w-40 truncate ${active ? 'font-medium text-ink' : 'text-ink-2'}`}>{value}</span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={label}
          className="absolute top-full left-0 z-30 mt-2 min-w-52 rounded-xl border border-line bg-raised p-3 shadow-2xl shadow-black/70"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{label}</span>
            {onClear && active && (
              <button type="button" onClick={onClear} className="text-[12px] text-ink-2 hover:text-ink">
                Clear
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </div>
  )
}
