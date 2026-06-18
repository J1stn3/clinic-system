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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

function SidebarBase() {
  const location = useLocation()
  const navigate = useNavigate()
  const sections = getNavSections()
  const collapsed = uiStore.sidebarCollapsed
  const isPatient = authStore.role === 'Patient'

  return (
    <aside
      className={cn(
        'aicare-sidebar flex flex-col transition-all duration-300',
        uiStore.sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        'md:flex',
        collapsed ? 'md:w-[76px]' : 'md:w-64',
      )}
    >
      <div className={cn('flex items-center gap-3 border-b border-slate-100 p-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aicare-teal text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">AiCare</h2>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clinic Suite</p>
          </div>
        )}
        <button
          type="button"
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:block"
          onClick={() => uiStore.toggleSidebarCollapsed()}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.path] ?? LayoutDashboard
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'aicare-nav-item',
                      active && 'aicare-nav-active',
                      collapsed && 'justify-center px-2',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge != null && (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
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

      <div className={cn('space-y-3 border-t border-slate-100 p-3', collapsed && 'px-2')}>
        {isPatient && !collapsed && (
          <button
            type="button"
            onClick={() => uiStore.setAssistantOpen(true)}
            className="w-full rounded-xl border border-teal-100 bg-teal-50 p-3 text-left transition-colors hover:bg-teal-100/80"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-aicare-teal">AIcare Assistant Active</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-600">
              Tap to open your personal health assistant. Available for patients only.
            </p>
          </button>
        )}

        {isPatient && collapsed && (
          <button
            type="button"
            onClick={() => uiStore.setAssistantOpen(true)}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-aicare-teal"
            aria-label="Open AIcare Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        )}

        <div className={cn('flex items-center gap-3 rounded-xl bg-slate-50 p-3', collapsed && 'justify-center p-2')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aicare-teal text-sm font-semibold text-white">
            {authStore.fullName?.charAt(0) ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{authStore.fullName}</p>
              <p className="truncate text-xs text-slate-500">{authStore.role}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            authStore.logout()
            navigate('/login')
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}

export default observer(SidebarBase)
