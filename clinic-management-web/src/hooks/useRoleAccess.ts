import { authStore } from '../stores/authStore'

const roleRoutes: Record<string, string[]> = {
  Administrator: [
    '/',
    '/users',
    '/patients',
    '/doctors',
    '/appointments',
    '/consultations',
    '/medical-records',
    '/prescriptions',
    '/laboratory',
    '/pharmacy',
    '/billing',
    '/payments',
    '/telemedicine',
    '/reports',
    '/settings',
  ],
  Doctor: [
    '/',
    '/appointments',
    '/consultations',
    '/medical-records',
    '/prescriptions',
    '/laboratory',
    '/billing',
    '/telemedicine',
    '/ai-clinical-support',
  ],
  Patient: [
    '/',
    '/appointments',
    '/medical-records',
    '/prescriptions',
    '/laboratory',
    '/billing',
    '/payments',
    '/telemedicine',
  ],
}

const labels: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'User Management',
  '/patients': 'Patients',
  '/doctors': 'Doctors',
  '/appointments': 'Appointments',
  '/consultations': 'Consultations',
  '/medical-records': 'Medical Records',
  '/prescriptions': 'Prescriptions',
  '/laboratory': 'Laboratory',
  '/pharmacy': 'Pharmacy',
  '/billing': 'Billing & Payments',
  '/payments': 'Payments',
  '/telemedicine': 'Telemedicine',
  '/reports': 'Reports & Analytics',
  '/ai-clinical-support': 'Clinical Decision Support',
  '/settings': 'Settings',
}

/** Optional sidebar notification badges (reference UI style). */
const navBadges: Record<string, number> = {
  '/appointments': 5,
  '/consultations': 2,
}

const navSections: Record<string, { title: string; paths: string[] }[]> = {
  Administrator: [
    { title: 'Overview', paths: ['/'] },
    {
      title: 'Clinical',
      paths: [
        '/patients',
        '/doctors',
        '/appointments',
        '/consultations',
        '/medical-records',
        '/prescriptions',
        '/laboratory',
        '/pharmacy',
      ],
    },
    { title: 'Operations', paths: ['/billing', '/payments', '/telemedicine'] },
    { title: 'Administration', paths: ['/users', '/reports', '/settings'] },
  ],
  Doctor: [
    { title: 'Overview', paths: ['/'] },
    {
      title: 'Clinical',
      paths: [
        '/appointments',
        '/consultations',
        '/medical-records',
        '/prescriptions',
        '/laboratory',
        '/ai-clinical-support',
      ],
    },
    { title: 'Operations', paths: ['/billing', '/telemedicine'] },
  ],
  Patient: [
    { title: 'Overview', paths: ['/'] },
    {
      title: 'My Care',
      paths: ['/appointments', '/medical-records', '/prescriptions', '/laboratory'],
    },
    { title: 'Services', paths: ['/billing', '/payments', '/telemedicine'] },
  ],
}

export function canAccess(path: string) {
  if (!authStore.role) return false
  const routes = roleRoutes[authStore.role] ?? []
  if (routes.includes(path)) return true
  if (path.startsWith('/telemedicine/room/') && routes.includes('/telemedicine')) return true
  return false
}

export function getNavItems() {
  if (!authStore.role) return []
  return roleRoutes[authStore.role].map((path) => ({ path, label: labels[path] }))
}

export function getNavBadge(path: string) {
  return navBadges[path]
}

export function getNavSections() {
  if (!authStore.role) return []
  const sections = navSections[authStore.role] ?? []
  const allowed = new Set(roleRoutes[authStore.role])
  return sections
    .map((section) => ({
      title: section.title,
      items: section.paths
        .filter((path) => allowed.has(path))
        .map((path) => ({ path, label: labels[path], badge: navBadges[path] })),
    }))
    .filter((section) => section.items.length > 0)
}

/** Shortcuts shown in the mobile bottom bar (full menu is the burger sidebar). */
const mobileQuickNav: Record<string, string[]> = {
  Administrator: ['/', '/patients', '/appointments', '/reports'],
  Doctor: ['/', '/consultations', '/telemedicine', '/appointments'],
  Patient: ['/', '/appointments', '/telemedicine', '/billing'],
}

export function getMobileQuickNav() {
  if (!authStore.role) return []
  const allowed = new Set(roleRoutes[authStore.role])
  return (mobileQuickNav[authStore.role] ?? [])
    .filter((path) => allowed.has(path))
    .map((path) => ({ path, label: labels[path] }))
}
