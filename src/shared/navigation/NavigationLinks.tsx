import { NavLink } from 'react-router-dom'
import type { NavigationItem } from './navigation'

interface NavigationLinksProps {
  items: readonly NavigationItem[]
}

export function NavigationLinks({ items }: NavigationLinksProps) {
  return (
    <ul className="navigation-list">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            className={({ isActive }) =>
              ['navigation-link', isActive ? 'navigation-link--active' : '']
                .filter(Boolean)
                .join(' ')
            }
            end={item.to === '/'}
            to={item.to}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
