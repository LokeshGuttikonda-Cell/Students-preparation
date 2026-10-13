import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authClient from '../../lib/auth-client';

vi.mock('../../lib/auth-client', () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
}));

function ConsumerComponent() {
  const { user, isLoading, login, logout } = useAuth();
  if (isLoading) return <div>Loading Auth...</div>;
  return (
    <div>
      <div data-testid="user-name">{user ? user.name : 'Guest'}</div>
      <button onClick={() => login('alice@test.com', 'secret')}>Login Alice</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext Cross-Tab Sync & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders guest state when getCurrentUser returns null', async () => {
    vi.mocked(authClient.getCurrentUser).mockResolvedValue(null);

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
    });
  });

  it('broadcasts storage sync event on login and updates user state', async () => {
    vi.mocked(authClient.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authClient.loginUser).mockResolvedValue({
      id: 'u-1',
      email: 'alice@test.com',
      name: 'Alice Cooper',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
    });

    const loginBtn = screen.getByRole('button', { name: /Login Alice/i });
    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice Cooper');
    expect(localStorage.getItem('studentsprep_auth_sync')).not.toBeNull();
  });

  it('refreshes auth state when receiving storage event from another tab', async () => {
    vi.mocked(authClient.getCurrentUser).mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
    });

    // Simulate login in another tab
    vi.mocked(authClient.getCurrentUser).mockResolvedValueOnce({
      id: 'u-2',
      email: 'bob@test.com',
      name: 'Bob Ross',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    });

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'studentsprep_auth_sync',
          newValue: Date.now().toString(),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Bob Ross');
    });
  });
});
