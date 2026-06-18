import {
  BarChart3,
  Calendar,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Users,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link, useLocation } from 'react-router-dom'
import { getMobileQuickNav } from '../../hooks/useRoleAccess'
import { cn } from '../../lib/utils'

const iconMap: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/patients': Users,
  '/appointments': Calendar,
  '/reports': BarChart3,
  '/consultations': ClipboardList,
  '/telemedicine': Video,
  '/billing': CreditCard,
}

const shortLabels: Record<string, string> = {
  '/': 'Home',
  '/consultations': 'Consult',
  '/appointments': 'Appts',
}

export default observer(function MobileBottomNav() {
  const location = useLocation()
  const items = getMobileQuickNav()
  if (items.length === 0) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Quick navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {items.map(({ path, label }) => {
          const Icon = iconMap[path] ?? LayoutDashboard
          const shortLabel = shortLabels[path] ?? label.split(' ')[0]
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`))
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold transition-colors',
                active ? 'text-aicare-teal' : 'text-slate-500',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                  active ? 'bg-teal-50 text-aicare-teal' : 'text-slate-400',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{shortLabel}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
})
