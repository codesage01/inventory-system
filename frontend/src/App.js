import React, { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export const DarkModeContext = createContext();

function Sidebar({ isOpen, onClose, isDarkMode }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: '◈' },
    { to: '/products', label: 'Products', icon: '▦' },
    { to: '/customers', label: 'Customers', icon: '◉' },
    { to: '/orders', label: 'Orders', icon: '◎' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="mobile-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isDarkMode ? 'dark' : ''}`}>
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
              onClick={onClose}
            >
              <span className="icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: isDarkMode ? '#1a1a1a' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#1f2937',
              border: `2px solid ${isDarkMode ? '#22c55e' : '#22c55e'}`,
              fontSize: '14px',
              boxShadow: isDarkMode ? '0 4px 24px rgba(34,197,94,0.2)' : '0 4px 24px rgba(34,197,94,0.1)',
            },
          }}
        />
        <div className={`app-layout ${isDarkMode ? 'dark' : ''}`}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDarkMode={isDarkMode} />
          <main className="main-content">
            <div className="top-bar">
              <button 
                className="mobile-menu-btn" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
              <button 
                className="dark-mode-toggle" 
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </DarkModeContext.Provider>
  );
}
