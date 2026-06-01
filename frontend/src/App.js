import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '◈' },
    { to: '/products', label: 'Products', icon: '▦' },
    { to: '/customers', label: 'Customers', icon: '◉' },
    { to: '/orders', label: 'Orders', icon: '◎' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>InvTrack</h1>
        <p>Inventory & Orders</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '2px solid #22c55e',
            fontSize: '14px',
            boxShadow: '0 4px 24px rgba(34,197,94,0.1)',
          },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
