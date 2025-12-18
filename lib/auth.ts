import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'cal_auth';
export const AUTH_COOKIE_VALUE = 'authenticated';

/**
 * Verify password against environment variable
 * MVP: Simple password check
 * Production: Replace with proper auth (bcrypt, NextAuth.js, etc.)
 */
export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.INSTRUCTOR_PASSWORD;

  if (!correctPassword) {
    console.error('INSTRUCTOR_PASSWORD not set in environment variables');
    return false;
  }

  return password === correctPassword;
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Check if user is authenticated (server component)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === AUTH_COOKIE_VALUE;
}
