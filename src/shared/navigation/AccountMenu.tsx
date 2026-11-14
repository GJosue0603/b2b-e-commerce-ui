import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AccountIcon } from './StoreIcons'

interface AccountMenuProps {
  readonly accountPath: string
  readonly label: string
  readonly onSignOut: () => Promise<void> | void
  readonly signingOut: boolean
}

export function AccountMenu({ accountPath, label, onSignOut, signingOut }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

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
    <div className="account-menu" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
    }}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={label}
        className="header-action header-action--account header-action--icon-only"
        onClick={() => setOpen(value => !value)}
        ref={trigger}
        title={label}
        type="button"
      ><AccountIcon /></button>
      {open && (
        <div className="account-menu__panel" id={panelId}>
          <Link onClick={() => setOpen(false)} to={accountPath}>Ver cuenta</Link>
          <button disabled={signingOut} onClick={() => { setOpen(false); void onSignOut() }} type="button">
            {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  )
}
