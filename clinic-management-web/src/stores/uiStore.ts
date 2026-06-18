import { makeAutoObservable } from 'mobx'

class UiStore {
  sidebarOpen = true
  sidebarCollapsed = false
  assistantOpen = false
  assistantExpanded = false

  constructor() {
    makeAutoObservable(this)
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  toggleSidebarCollapsed() {
    this.sidebarCollapsed = !this.sidebarCollapsed
  }

  setAssistantOpen(open: boolean) {
    this.assistantOpen = open
  }

  toggleAssistantExpanded() {
    this.assistantExpanded = !this.assistantExpanded
  }
}

export const uiStore = new UiStore()
