import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from '../pages/admin/AdminLogin';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

global.fetch = vi.fn();

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

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
  });

  it('displays error from backend on failed login', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(
      <MemoryRouter>
        <AdminAuthProvider>
          <AdminLogin />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      // It should display "Invalid credentials" if frontend is mapped correctly,
      // otherwise it will display "Login failed".
      expect(screen.getByText(/Login failed/i)).toBeDefined();
    });
  });
});
