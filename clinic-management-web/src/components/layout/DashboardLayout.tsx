import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AIcareAssistant from '../ai/AIcareAssistant'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { canAccess } from '../../hooks/useRoleAccess'
import { isImmersiveMobileRoute } from '../../lib/mobile'
import { cn } from '../../lib/utils'
import { authStore } from '../../stores/authStore'
import { uiStore } from '../../stores/uiStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'

export default observer(function DashboardLayout() {
  const { pathname } = useLocation()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isImmersive = isImmersiveMobileRoute(pathname)
  const hideBottomNav = !isDesktop && (isImmersive || uiStore.sidebarOpen)

  useEffect(() => {
    uiStore.syncSidebarForViewport(isDesktop)
  }, [isDesktop])

  useEffect(() => {
    if (!isDesktop && uiStore.sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDesktop, uiStore.sidebarOpen])

  if (!canAccess(pathname)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-[100dvh] max-w-[100vw] overflow-x-hidden bg-slate-50">
      {!isDesktop && uiStore.sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => uiStore.closeSidebar()}
        />
      )}

      <Sidebar isMobile={!isDesktop} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main
          className={cn(
            'aicare-page-bg flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8',
            isImmersive ? 'aicare-immersive-main' : 'aicare-mobile-main md:!pb-6',
          )}
        >
          <div className="mx-auto w-full max-w-[1600px] animate-fade-in">
            <Outlet />
          </div>
        </main>
        {!hideBottomNav && <MobileBottomNav />}
      </div>

      {authStore.role === 'Patient' && !isImmersive && <AIcareAssistant />}
    </div>
  )
})
