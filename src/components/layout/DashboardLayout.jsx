import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  PenTool,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Sparkles,
  Zap,
  Bookmark,
  FileText,
  LogOut,
  ExternalLink,
  User,
  BarChart3,
  LayoutTemplate,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { getPosts } from '../../utils/postStorage';
import { getStoredProfile } from '../../utils/profileStorage';
import LinkedInLogo from '../ui/LinkedInLogo';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [linkedInUser, setLinkedInUser] = useState(null);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [storedProfile, setStoredProfile] = useState(() => getStoredProfile());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('linkedai_theme') === 'dark';
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('linkedai_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('linkedai_theme', 'light');
    }
  }, [darkMode]);

  const fetchLinkedInStatus = async () => {
    try {
      const res = await fetch('/api/linkedin/me');
      if (res.ok) {
        const data = await res.json();
        setIsLinkedInConnected(Boolean(data.isConnected));
        setLinkedInUser(data.user);
      }
    } catch (err) {
      console.warn('Could not check LinkedIn status:', err);
    }
  };

  const syncStoredProfile = () => {
    setStoredProfile(getStoredProfile());
  };

  useEffect(() => {
    const updateCount = () => {
      const posts = getPosts();
      setSavedCount(posts.length);
    };

    updateCount();
    fetchLinkedInStatus();
    syncStoredProfile();

    window.addEventListener('linkedai_posts_updated', updateCount);
    window.addEventListener('storage', updateCount);
    window.addEventListener('linkedai_user_updated', fetchLinkedInStatus);
    window.addEventListener('linkedai_user_profile_updated', syncStoredProfile);

    // If redirected with auth success, clear query parameter cleanly
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('linkedin_auth') === 'success') {
      fetchLinkedInStatus();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    return () => {
      window.removeEventListener('linkedai_posts_updated', updateCount);
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('linkedai_user_updated', fetchLinkedInStatus);
      window.removeEventListener('linkedai_user_profile_updated', syncStoredProfile);
    };
  }, [location]);

  const handleDisconnectLinkedIn = async () => {
    try {
      await fetch('/api/auth/linkedin/logout', { method: 'POST' });
      setIsLinkedInConnected(false);
      setLinkedInUser(null);
      setShowUserDropdown(false);
      window.dispatchEvent(new Event('linkedai_user_updated'));
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Profile',
      to: '/dashboard/profile',
      icon: User,
      badge: isLinkedInConnected ? 'Linked' : null
    },
    {
      name: 'Profile Analyzer',
      to: '/dashboard/analyzer',
      icon: UserCheck,
      badge: 'Audit'
    },
    {
      name: 'Post Generator',
      to: '/dashboard/generator',
      icon: PenTool,
      badge: 'Studio'
    },
    {
      name: 'Content Templates',
      to: '/dashboard/templates',
      icon: LayoutTemplate,
      badge: '12+'
    },
    {
      name: 'Post History',
      to: '/dashboard/history',
      icon: History,
      badge: savedCount > 0 ? String(savedCount) : null
    },
    {
      name: 'Analytics',
      to: '/dashboard/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Settings',
      to: '/dashboard/settings',
      icon: Settings,
      badge: null
    },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'LinkedIn Creator Dashboard';
    if (location.pathname.includes('analyzer')) return 'LinkedIn Profile Analyzer';
    if (location.pathname.includes('generator')) return 'LinkedIn Post Generator & Studio';
    if (location.pathname.includes('templates')) return 'Content Templates & Formulas';
    if (location.pathname.includes('history')) return 'Post History & Saved Drafts';
    if (location.pathname.includes('analytics')) return 'Creator Analytics & Performance';
    if (location.pathname.includes('settings')) return 'Settings & Preferences';
    if (location.pathname.includes('profile')) return 'Creator Profile & Settings';
    return 'LinkedIn Optimizer';
  };

  const displayName = isLinkedInConnected && linkedInUser?.name
    ? linkedInUser.name
    : storedProfile?.fullName || 'Rohit Sharma';

  const displayAvatar = isLinkedInConnected && linkedInUser?.picture
    ? linkedInUser.picture
    : storedProfile?.photoUrl || null;

  const userInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RS';

  return (
    <div className={`dashboard-root ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-wrapper">
              <Sparkles size={20} />
            </div>
            {!collapsed && (
              <div className="brand-title">
                <span className="logo-main">LinkedAI</span>
                <span className="logo-sub">LinkedIn Optimizer</span>
              </div>
            )}
          </div>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {!collapsed ? 'STUDIO APPS' : '•••'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-icon">
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <span className="nav-label">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`nav-badge ${item.badge === 'Audit' ? 'badge-primary' : 'badge-count'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {!collapsed && (
            <div className="sidebar-promo-card">
              <div className="promo-badge">PRO MODE</div>
              <h4>Direct LinkedIn Publish</h4>
              <p>
                {isLinkedInConnected
                  ? `Connected as ${displayName}`
                  : 'Link your developer app to publish directly with 1-click.'}
              </p>
              {!isLinkedInConnected ? (
                <a
                  href="/api/auth/linkedin"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <LinkedInLogo size={14} color="#ffffff" />
                  <span>Connect LinkedIn</span>
                </a>
              ) : (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  Live Sync Active
                </span>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer User Card (Clickable -> Opens Profile) */}
        <div className="sidebar-footer">
          <Link
            to="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="user-profile-summary"
            style={{
              textDecoration: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              padding: '6px 8px',
              transition: 'background-color 0.15s ease'
            }}
            title="Click to view and edit your Profile"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                referrerPolicy="no-referrer"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar">{userInitials}</div>
            )}
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">
                  {displayName}
                </span>
                <span className="user-role" style={{ color: isLinkedInConnected ? '#38bdf8' : '#94a3b8' }}>
                  {isLinkedInConnected ? 'LinkedIn Verified' : 'View Profile • Edit'}
                </span>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="topbar-nav-title">
              <span>{getPageTitle()}</span>
              <span className="badge badge-linkedin">Creator Studio</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search templates, hooks..."
                className="search-input"
              />
            </div>

            <Link
              to="/dashboard/history"
              className="credit-pill"
              title="Saved posts stored in browser localStorage"
              style={{ textDecoration: 'none' }}
            >
              <FileText size={14} />
              <span>{savedCount} Saved Posts</span>
            </Link>

            {/* LinkedIn Connection Pill / Button */}
            {isLinkedInConnected ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    borderColor: '#0a66c2',
                    color: '#0a66c2',
                    fontWeight: 600,
                    borderRadius: 20,
                    padding: '4px 12px'
                  }}
                  title="Click to view LinkedIn connection details or logout"
                >
                  <LinkedInLogo size={14} color="#0a66c2" />
                  <span>{displayName?.split(' ')[0] || 'Connected'}</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                </button>

                {showUserDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 40,
                      right: 0,
                      width: 250,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: 12,
                      zIndex: 100
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          style={{ width: 36, height: 36, borderRadius: '50%' }}
                        />
                      ) : (
                        <div className="avatar" style={{ width: 36, height: 36 }}>{userInitials}</div>
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {linkedInUser?.email || 'OAuth Active'}
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="btn btn-outline-primary btn-sm"
                      style={{
                        width: '100%',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        textDecoration: 'none'
                      }}
                    >
                      <User size={14} />
                      <span>View &amp; Edit Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleDisconnectLinkedIn}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', color: '#ef4444', borderColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <LogOut size={14} />
                      <span>Disconnect LinkedIn</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/api/auth/linkedin"
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  backgroundColor: '#0a66c2',
                  borderRadius: 20,
                  padding: '5px 12px'
                }}
                title="Connect with LinkedIn using OAuth 2.0"
              >
                <LinkedInLogo size={14} color="#ffffff" />
                <span>Connect LinkedIn</span>
              </a>
            )}

            {/* Dark Mode Toggle */}
            <button
              className="icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Tips & Reminders"
                title="Tips & Reminders"
              >
                <Bell size={18} />
                <span className="notification-badge" />
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    top: 48,
                    right: 0,
                    width: 310,
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    padding: 16,
                    zIndex: 100
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Creator Guidelines</span>
                    <span className="badge badge-linkedin">Tips</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
                    <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 6 }}>
                      <span style={{ fontWeight: 600, color: '#0a66c2' }}>Hook Tip:</span>
                      <p style={{ color: '#64748b' }}>Keep your opening hook to 1–2 lines before the "see more" link.</p>
                    </div>
                    <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 6 }}>
                      <span style={{ fontWeight: 600, color: '#057642' }}>White Space:</span>
                      <p style={{ color: '#64748b' }}>Use double line breaks to ensure easy reading on mobile screens.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clickable Topbar Avatar -> Opens Profile */}
            <Link
              to="/dashboard/profile"
              style={{ textDecoration: 'none' }}
              title="Click to view and edit Profile"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid #ffffff' }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{ width: 36, height: 36, fontSize: '0.85rem', cursor: 'pointer' }}
                  title="Creator Profile"
                >
                  {userInitials}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
