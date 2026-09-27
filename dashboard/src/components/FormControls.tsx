import type { ReactNode } from 'react'

// Look-alikes of Mantine's Checkbox and Radio, styled for the dark theme.
// Real <input>s underneath so keyboard, focus and screen readers work as normal.

const BOX =
  'peer h-5 w-5 shrink-0 cursor-pointer appearance-none border border-[#48484a] bg-raised transition-colors duration-100 ' +
  'checked:border-ink checked:bg-ink hover:border-ink-3 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

interface ControlProps {
  label: string
  checked: boolean
  onChange: () => void
}

/** Mantine's CheckIcon path */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 10 7"
      aria-hidden
      className="pointer-events-none absolute inset-0 m-auto w-[11px] text-page opacity-0 transition-opacity duration-100 peer-checked:opacity-100"
    >
      <path
        fill="currentColor"
        d="M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"
      />
    </svg>
  )
}

export function Checkbox({ label, checked, onChange }: ControlProps) {
  return (
    <label className="group inline-flex cursor-pointer items-center gap-2.5 select-none">
      <span className="relative inline-flex">
        <input type="checkbox" checked={checked} onChange={onChange} className={`${BOX} rounded-[4px]`} />
        <CheckIcon />
      </span>
      <span className={`text-sm transition-colors ${checked ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>
        {label}
      </span>
    </label>
  )
}

export function Radio({ label, name, checked, onChange }: ControlProps & { name: string }) {
  return (
    <label className="group inline-flex cursor-pointer items-center gap-2.5 select-none">
      <span className="relative inline-flex">
        <input type="radio" name={name} checked={checked} onChange={onChange} className={`${BOX} rounded-full`} />
        <span className="pointer-events-none absolute inset-0 m-auto h-2 w-2 scale-0 rounded-full bg-page transition-transform duration-100 peer-checked:scale-100" />
      </span>
      <span className={`text-sm transition-colors ${checked ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>
        {label}
      </span>
    </label>
  )
}

/** Vertical stack of checkbox / radio items, as in a Mantine Checkbox.Group */
export function ControlList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>
}
