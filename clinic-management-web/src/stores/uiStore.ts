import { makeAutoObservable } from 'mobx'

function isDesktop() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
}

class UiStore {
  sidebarOpen = isDesktop()
  sidebarCollapsed = false
  assistantOpen = false
  assistantExpanded = false

  constructor() {
    makeAutoObservable(this)
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  closeSidebar() {
    this.sidebarOpen = false
  }

  openSidebar() {
    this.sidebarOpen = true
  }

  syncSidebarForViewport(isDesktopViewport: boolean) {
    if (isDesktopViewport) {
      this.sidebarOpen = true
    } else {
      this.sidebarOpen = false
      this.sidebarCollapsed = false
    }
  }

  toggleSidebarCollapsed() {
    this.sidebarCollapsed = !this.sidebarCollapsed
  }

  setAssistantOpen(open: boolean) {
    this.assistantOpen = open
    if (open && typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      this.assistantExpanded = true
    }
  }

  toggleAssistantExpanded() {
    this.assistantExpanded = !this.assistantExpanded
  }
}

export const uiStore = new UiStore()
