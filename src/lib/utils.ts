import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setCookie(name: string, value: string, expiryDays = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  // Remove secure flag for localhost, use samesite=lax
  const cookieString = `${name}=${value}; ${expires}; path=/; samesite=lax`;
  console.log(`Setting cookie: ${name}=${value.substring(0, 20)}...`);
  
  document.cookie = cookieString;
  
  // Verify cookie was set
  setTimeout(() => {
    const verification = getCookie(name);
    console.log(`Cookie ${name} verification:`, !!verification);
  }, 50);
}

export function removeCookie(name: string) {
  console.log('Removing cookie:', name);
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

export function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Debug function to check all auth-related cookies
export function debugAuthCookies() {
  console.log('=== AUTH COOKIES DEBUG ===');
  console.log('auth-token:', getCookie('auth-token'));
  console.log('user-role:', getCookie('user-role'));
  console.log('All cookies:', document.cookie);
  console.log('========================');
}