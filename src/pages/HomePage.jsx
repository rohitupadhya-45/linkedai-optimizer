import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Zap,
  Layout,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Vite Powered Speed',
      description: 'Instant server start and lightning-fast Hot Module Replacement (HMR) for seamless development.'
    },
    {
      icon: Layout,
      title: 'Modular Dashboard Layout',
      description: 'Collapsible sidebar, persistent navigation, responsive drawer on mobile, and nested subroutes.'
    },
    {
      icon: Layers,
      title: 'Clean Component Architecture',
      description: 'Separation of reusable UI components, layouts, and page views with clean, semantic markup.'
    },
    {
      icon: ShieldCheck,
      title: 'No API Locks',
      description: 'Pure state and structured mock models ready to easily swap in fetch, axios, TanStack Query, or Supabase.'
    }
  ];

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-pill">
          <Zap size={14} />
          <span>Vite + React Starter • Clean &amp; Modern</span>
        </div>

        <h1>
          Modern Web Experience with a <br />
          <span className="hero-gradient-text">Streamlined Dashboard</span>
        </h1>

        <p className="hero-desc">
          A lightweight, elegant React boilerplate featuring a simple homepage and a clean, responsive dashboard layout — ready for your custom APIs and logic.
        </p>

        <div className="hero-actions">
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            <span>Explore Dashboard</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="btn btn-outline btn-lg"
          >
            View Features
          </a>
        </div>
      </section>

      {/* Interactive Mockup Preview */}
      <section className="home-preview">
        <div className="preview-frame">
          <div className="preview-bar">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '12px' }}>
              dashboard.local / overview
            </span>
          </div>

          <div className="preview-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Workspace Analytics Overview</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live snapshot of platform performance</p>
              </div>
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Enter App
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Revenue (MTD)</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>$48,290</p>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>↑ +12.5%</span>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Users</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>2,420</p>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>↑ +8.2%</span>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>System Status</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>99.98%</p>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>● Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="features-grid">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="feature-card card-hover">
              <div className="feature-icon-box">
                <Icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} ApexDash. Clean React Vite starter template.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <a href="#features" className="nav-link">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
