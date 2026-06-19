import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function NotFound() { return React.createElement('h1', null, '404'); }
function Dashboard() { return React.createElement('h1', null, 'Dashboard'); }
function Users() { return React.createElement('h1', null, 'Users'); }

function AdminApp() {
  return React.createElement(Routes, null,
    React.createElement(Route, { path: '/' },
      React.createElement(Route, { index: true, element: React.createElement(Dashboard) }),
      React.createElement(Route, { path: 'users', element: React.createElement(Users) })
    ),
    React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
  );
}

function MainApp() {
  return React.createElement(BrowserRouter, null,
    React.createElement(Routes, null,
      React.createElement(Route, { path: '/admin/*', element: React.createElement(AdminApp) }),
      React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
    )
  );
}

import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/admin/users' });
global.window = dom.window;
global.document = dom.window.document;

const { container } = render(React.createElement(MainApp));
console.log("HTML:", container.innerHTML);
