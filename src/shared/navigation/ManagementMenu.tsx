import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NavigationLinks } from './NavigationLinks'
import type { NavigationItem } from './navigation'

export function ManagementMenu({ items, label }: { readonly items: readonly NavigationItem[]; readonly label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  const { pathname } = useLocation()
  const active = items.some(item => pathname === item.to || pathname.startsWith(`${item.to}/`))

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && root.current?.contains(document.activeElement)) {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  return (
    <div className="management-menu" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
    }}>
      <button aria-controls={id} aria-expanded={open}
        className={`navigation-link${active ? ' navigation-link--active' : ''}`}
        onClick={() => setOpen(value => !value)} ref={trigger} type="button">
        {label}<span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div className="management-menu__panel" id={id} onClick={() => setOpen(false)}>
        <NavigationLinks items={items} />
      </div>}
    </div>
  )
}
