/** Routes that use full viewport on mobile (e.g. telemedicine room). */
export function isImmersiveMobileRoute(pathname: string) {
  return pathname.startsWith('/telemedicine/room/')
}
