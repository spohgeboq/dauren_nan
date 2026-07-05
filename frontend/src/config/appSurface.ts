export type AppSurface = 'web' | 'desktop' | 'mobile' | 'pos-desktop';

const allowedSurfaces: AppSurface[] = ['web', 'desktop', 'mobile', 'pos-desktop'];
const configuredSurface = import.meta.env.VITE_APP_SURFACE;

export const appSurface: AppSurface = allowedSurfaces.includes(configuredSurface as AppSurface)
  ? configuredSurface as AppSurface
  : 'web';

export const usesPublicHomeAsRoot = appSurface === 'web';
export const usesHashRouter = appSurface !== 'web';
export const supportsBrowserGoogleAuth = appSurface === 'web';
