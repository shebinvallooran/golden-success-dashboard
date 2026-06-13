import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, LogOut, Mail, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      path: '/products',
      label: 'Products',
      icon: Package
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: FolderOpen
    },
    {
      path: '/enquiries',
      label: 'Enquiries',
      icon: Mail
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Brand */}
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/img/Golden Logo.png" 
              alt="Golden Success Logo" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>

          {/* Navigation Links */}
          <div className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${active ? 'nav-link-active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {active && <div className="nav-indicator" />}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
            </div>
            <button 
              onClick={logout}
              className="logout-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
