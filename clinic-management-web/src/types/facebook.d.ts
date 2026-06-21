// Global type declarations for the Facebook JS SDK
interface Window {
  FB: {
    init(params: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void
    login(
      callback: (response: { authResponse?: { accessToken: string } | null; status: string }) => void,
      options?: { scope: string },
    ): void
  }
  fbAsyncInit: () => void
}
