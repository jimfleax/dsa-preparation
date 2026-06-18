import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AdminApp from '../AdminApp';

// Mock localStorage
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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AdminApp integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Simulate /admin route
    window.history.pushState({}, 'Test', '/admin');
  });

  it('renders login page when not authenticated', async () => {
    render(<AdminApp />);
    
    await waitFor(() => {
      // It should redirect to /login
      expect(screen.getByText(/Admin Login/i) || screen.getByText(/Sign In/i)).toBeDefined();
    });
  });

  it('renders AdminDashboard when authenticated', async () => {
    window.localStorage.setItem('admin_token', 'fake-token');
    window.localStorage.setItem('admin_user', JSON.stringify({ id: '1', username: 'admin' }));
    
    render(<AdminApp />);
    
    await waitFor(() => {
      expect(screen.getByText(/Admin Panel/i)).toBeDefined();
    });
  });
});
