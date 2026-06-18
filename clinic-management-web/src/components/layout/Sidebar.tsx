import {
  Activity,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  Sparkles,
  Stethoscope,
  UserCog,
  Users,
  Video,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link, useLocation } from 'react-router-dom'
import { getNavSections } from '../../hooks/useRoleAccess'
import { cn } from '../../lib/utils'
import { authStore } from '../../stores/authStore'
import { uiStore } from '../../stores/uiStore'

const iconMap: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/users': UserCog,
  '/patients': Users,
  '/doctors': Stethoscope,
  '/appointments': Calendar,
  '/consultations': ClipboardList,
  '/medical-records': FileText,
  '/prescriptions': Pill,
  '/laboratory': FlaskConical,
  '/pharmacy': Pill,
  '/billing': CreditCard,
  '/payments': CreditCard,
  '/telemedicine': Video,
  '/reports': BarChart3,
  '/ai-clinical-support': Activity,
  '/settings': Settings,
}

const badgeColors = ['bg-sky-100 text-sky-700', 'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700']

type SidebarProps = { isMobile?: boolean }

export default observer(function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const sections = getNavSections()
  const collapsed = uiStore.sidebarCollapsed && !isMobile
  const isPatient = authStore.role === 'Patient'

  const onNavClick = () => {
    if (isMobile) uiStore.closeSidebar()
  }

  return (
    <aside
      className={cn(
        'aicare-sidebar flex flex-col transition-all duration-300',
        isMobile
          ? cn(
              'fixed inset-y-0 left-0 z-50 w-[min(85vw,18rem)] shadow-aicare-lg',
              uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none',
            )
          : cn(
              uiStore.sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
              'md:flex',
              collapsed ? 'md:w-[76px]' : 'md:w-64',
            ),
      )}
    >
      <div className={cn('flex items-center gap-3 border-b border-teal-100/80 p-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
          <HeartPulse className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold tracking-tight">
              <span className="aicare-gradient-text">AiCare</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/70">Clinic Suite</p>
          </div>
        )}
        {isMobile ? (
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 hover:bg-teal-50 hover:text-aicare-teal"
            onClick={() => uiStore.closeSidebar()}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            className="hidden rounded-xl p-2 text-slate-400 transition-colors hover:bg-teal-50 hover:text-aicare-teal md:block"
            onClick={() => uiStore.toggleSidebarCollapsed()}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-3">
        {sections.map((section, si) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item, ii) => {
                const Icon = iconMap[item.path] ?? LayoutDashboard
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavClick}
                    className={cn(
                      'aicare-nav-item',
                      active && 'aicare-nav-active',
                      collapsed && 'justify-center px-2',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="relative flex-1 truncate">{item.label}</span>
                        {item.badge != null && (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                              badgeColors[(si + ii) % badgeColors.length],
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('space-y-3 border-t border-teal-100/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]', collapsed && 'px-2')}>
        {isPatient && !collapsed && (
          <button
            type="button"
            onClick={() => {
              uiStore.setAssistantOpen(true)
              if (isMobile) uiStore.closeSidebar()
            }}
            className="w-full rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-3.5 text-left shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-aicare-teal">AIcare Assistant</span>
              <Sparkles className="ml-auto h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-600">
              Your personal health assistant — tap to chat
            </p>
          </button>
        )}

        {isPatient && collapsed && !isMobile && (
          <button
            type="button"
            onClick={() => uiStore.setAssistantOpen(true)}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow"
            aria-label="Open AIcare Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        )}

        <div className={cn('flex items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/50 p-3', collapsed && 'justify-center p-2')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-white shadow-md">
            {authStore.fullName?.charAt(0) ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{authStore.fullName}</p>
              <p className="truncate text-xs font-semibold text-aicare-teal">{authStore.role}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => authStore.logout()}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
})
