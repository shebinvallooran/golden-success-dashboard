import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, LogOut } from 'lucide-react';
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
    }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <Package size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Golden Success</span>
              <span className="brand-subtitle">Product Management</span>
            </div>
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
