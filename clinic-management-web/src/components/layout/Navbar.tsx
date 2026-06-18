import { Bell, HelpCircle, Menu, MessageCircle, Moon, Search, Sun, X } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getNavItems } from '../../hooks/useRoleAccess'
import { authStore } from '../../stores/authStore'
import { uiStore } from '../../stores/uiStore'

export default observer(function Navbar() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
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
    setSearchOpen(false)
    toast.success(`Opened ${best.label}`)
  }

  const searchInput = (
    <input
      type="search"
      placeholder="Search modules..."
      className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 pl-10 pr-4 text-sm font-medium shadow-inner transition-all focus:border-aicare-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-aicare-teal/15 sm:h-11 sm:pl-11"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
  )

  return (
    <header className="aicare-safe-top sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 md:px-6">
        <button
          type="button"
          className="shrink-0 rounded-xl p-2 text-slate-600 transition-colors hover:bg-teal-50 hover:text-aicare-teal md:hidden"
          onClick={() => uiStore.toggleSidebar()}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-bold text-slate-900">AiCare</p>
          <p className="truncate text-[10px] font-semibold text-aicare-teal">{authStore.role}</p>
        </div>

        <form className="relative mx-auto hidden w-full max-w-2xl flex-1 md:block" onSubmit={onSearchSubmit}>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-aicare-teal/60" />
          {searchInput}
          {searchText.trim() && searchMatches.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-aicare-lg backdrop-blur-xl">
              {searchMatches.slice(0, 5).map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="flex w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-aicare-teal"
                  onClick={() => {
                    navigate(item.path)
                    setSearchText('')
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="aicare-icon-btn md:hidden"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button type="button" className="aicare-icon-btn relative" aria-label="Notifications" onClick={() => toast.info('No new notifications')}>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-rose-400 to-red-500 ring-2 ring-white" />
          </button>

          <button type="button" className="aicare-icon-btn relative hidden sm:flex" aria-label="Messages" onClick={() => toast.info('Messages coming soon')}>
            <MessageCircle className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 ring-2 ring-white" />
          </button>

          <button type="button" className="aicare-icon-btn hidden md:flex" aria-label="Help" onClick={() => { navigate('/settings'); toast.info('Help in Settings') }}>
            <HelpCircle className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="aicare-icon-btn hidden sm:flex"
            aria-label="Theme"
            onClick={onToggleTheme}
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
          </button>

          <button
            type="button"
            className="flex shrink-0 items-center rounded-xl p-1 transition-colors hover:bg-slate-50 sm:ml-1 sm:rounded-2xl sm:border sm:border-slate-200/60 sm:bg-gradient-to-r sm:from-white sm:to-teal-50/30 sm:py-1.5 sm:pl-1.5 sm:pr-3 sm:shadow-sm"
            onClick={() => navigate('/settings')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white shadow-sm sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm">
              {authStore.fullName?.charAt(0) ?? 'U'}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-bold text-slate-800">{authStore.fullName?.split(' ')[0] ?? 'User'}</p>
              <p className="text-[10px] font-semibold text-aicare-teal">{authStore.role}</p>
            </div>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form className="relative border-t border-slate-100 px-3 py-2 md:hidden" onSubmit={onSearchSubmit}>
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-aicare-teal/60" />
          {searchInput}
          {searchText.trim() && searchMatches.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {searchMatches.slice(0, 5).map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="flex w-full px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-teal-50"
                  onClick={() => {
                    navigate(item.path)
                    setSearchText('')
                    setSearchOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </form>
      )}
    </header>
  )
})
