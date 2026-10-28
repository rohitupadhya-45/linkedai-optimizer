import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Sparkles, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="home-navbar">
      <div className="home-nav-content">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span>ApexDash</span>
        </Link>

        <nav className="home-nav-links">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <a href="#features" className="nav-link">
            Features
          </a>
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
        </nav>

        <div>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            <span>Launch App</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
