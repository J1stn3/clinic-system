import { Bell, HelpCircle, Menu, MessageCircle, Moon, Search, Sun } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getNavItems } from '../../hooks/useRoleAccess'
import { authStore } from '../../stores/authStore'
import { uiStore } from '../../stores/uiStore'

function NavbarBase() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const navItems = getNavItems()

  useEffect(() => {
    const saved = localStorage.getItem('aicare-theme')
    const isDark = saved === 'dark'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const onToggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('aicare-theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
    toast.success(`Switched to ${next ? 'dark' : 'light'} theme`)
  }

  const searchMatches = useMemo(() => {
    const term = searchText.trim().toLowerCase()
    if (!term) return []
    return navItems.filter((item) => item.label.toLowerCase().includes(term))
  }, [navItems, searchText])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const best = searchMatches[0]
    if (!best) {
      toast.error('No matching module found')
      return
    }
    navigate(best.path)
    setSearchText('')
    toast.success(`Opened ${best.label}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 md:hidden"
        onClick={() => uiStore.toggleSidebar()}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form className="relative mx-auto hidden w-full max-w-2xl flex-1 sm:block" onSubmit={onSearchSubmit}>
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search patients, doctors, or records..."
          className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm focus:border-aicare-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-aicare-teal/20"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="relative rounded-full p-2.5 text-slate-500 hover:bg-slate-50"
          aria-label="Notifications"
          onClick={() => toast.info('No new notifications right now')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          type="button"
          className="relative hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-50 sm:block"
          aria-label="Messages"
          onClick={() => toast.info('Messages center coming soon')}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <button
          type="button"
          className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-50 md:block"
          aria-label="Help center"
          onClick={() => {
            navigate('/settings')
            toast.info('Help & support is available in Settings')
          }}
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-50 md:block"
          aria-label="Theme toggle"
          onClick={onToggleTheme}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-50"
          onClick={() => navigate('/settings')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-aicare-teal text-sm font-semibold text-white">
            {authStore.fullName?.charAt(0) ?? 'U'}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 lg:inline">
            {authStore.fullName?.split(' ')[0] ?? 'User'}
          </span>
        </button>
      </div>
    </header>
  )
}

export default observer(NavbarBase)
