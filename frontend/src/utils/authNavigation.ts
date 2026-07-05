import { appSurface } from '../config/appSurface';

export interface AuthUser {
  roles?: string[];
}

export const dashboardPathForUser = (user?: AuthUser | null): string => {
  const roles = user?.roles || [];

  if (roles.includes('seller')) {
    return appSurface === 'pos-desktop' ? '/dashboard' : '/pos';
  }

  if (roles.includes('driver')) {
    return '/driver';
  }

  if (roles.includes('client')) {
    return '/client';
  }

  if (roles.includes('baker')) {
    return '/production';
  }

  if (roles.includes('admin')) {
    return '/admin';
  }

  return '/applicant';
};
