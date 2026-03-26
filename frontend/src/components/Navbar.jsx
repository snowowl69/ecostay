import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Leaf, ChevronDown, LogOut, LayoutDashboard, User, Settings } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'owner': return '/owner';
      default: return '/dashboard';
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHomePage ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Leaf size={20} /></span>
          <span className="logo-text">EcoStay</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/hotels" className={`nav-link ${location.pathname === '/hotels' ? 'active' : ''}`}>
            Hotels
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-outline">Sign In</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Get Started</Link>
            </>
          ) : (
            <div className="nav-user-menu">
              <button
                className="nav-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="nav-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#059669',
                      marginTop: '4px',
                      letterSpacing: '0.5px'
                    }}>
                      {user.role}
                    </div>
                  </div>
                  <Link to={getDashboardLink()} className="nav-dropdown-item">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button onClick={handleLogout} className="nav-dropdown-item" style={{ color: '#ef4444' }}>
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: -1
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
