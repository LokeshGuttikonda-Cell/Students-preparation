import { apiUrl } from './env';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const res = await fetch(apiUrl('auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Login failed');
  }

  return res.json();
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<UserProfile> {
  const res = await fetch(apiUrl('auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Registration failed');
  }

  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(apiUrl('auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch(apiUrl('auth/me'), {
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}
