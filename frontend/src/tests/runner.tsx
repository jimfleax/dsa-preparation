import './setup.js';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from '../context/AdminAuthContext.js';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute.js';

async function run() {
  let passed = true;

  try {
    console.log("Test 1: Unauthenticated user gets redirected to /login");
    global.localStorage.clear();
    
    let currentPath = '';
    const LocationSpy = () => {
      currentPath = window.location.pathname;
      return null;
    };

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
        </MemoryRouter>
      </AdminAuthProvider>
    );

    await waitFor(() => {
      const loginPage = screen.queryByTestId('login-page');
      if (!loginPage) throw new Error("Login page not found");
      const protectedPage = screen.queryByTestId('protected-page');
      if (protectedPage) throw new Error("Protected page was rendered but shouldn't have been");
    });
    console.log("✅ Test 1 Passed");
  } catch (err) {
    console.error("❌ Test 1 Failed:", err);
    passed = false;
  }

  try {
    console.log("Test 2: Authenticated user sees protected content");
    global.localStorage.setItem('admin_token', 'fake-token');
    global.localStorage.setItem('admin_user', JSON.stringify({ id: '1', username: 'admin' }));

    // clear the DOM
    document.body.innerHTML = '';

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
        </MemoryRouter>
      </AdminAuthProvider>
    );

    await waitFor(() => {
      const protectedPage = screen.queryByTestId('protected-page');
      if (!protectedPage) throw new Error("Protected page not found");
      const loginPage = screen.queryByTestId('login-page');
      if (loginPage) throw new Error("Login page was rendered but shouldn't have been");
    });
    console.log("✅ Test 2 Passed");
  } catch (err) {
    console.error("❌ Test 2 Failed:", err);
    passed = false;
  }

  if (!passed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
