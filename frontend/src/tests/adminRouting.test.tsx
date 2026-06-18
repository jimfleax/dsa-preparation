import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import React from 'react';

// mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function(key: string) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

describe('Admin Auth Context & Routing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects unauthenticated user to /login', async () => {
    render(
      <AdminAuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            <Route
              path="/"
              element={
                <AdminProtectedRoute>
                  <div data-testid="protected-page">Protected Content</div>
                </AdminProtectedRoute>
              }
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AdminAuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('protected-page')).toBeNull();
      expect(screen.getByTestId('login-page')).toBeDefined();
      expect(screen.getByTestId('location-display').textContent).toBe('/login');
    });
  });

  it('allows authenticated user to see protected content', async () => {
    window.localStorage.setItem('admin_token', 'fake-token');
    window.localStorage.setItem('admin_user', JSON.stringify({ id: '1', username: 'admin' }));

    render(
      <AdminAuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            <Route
              path="/"
              element={
                <AdminProtectedRoute>
                  <div data-testid="protected-page">Protected Content</div>
                </AdminProtectedRoute>
              }
            />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </AdminAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-page')).toBeDefined();
      expect(screen.queryByTestId('login-page')).toBeNull();
      expect(screen.getByTestId('location-display').textContent).toBe('/');
    });
  });
});
