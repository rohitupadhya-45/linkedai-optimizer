import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        backgroundColor: 'var(--bg-main)'
      }}
    >
      <span
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: 16
        }}
      >
        404
      </span>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 420, marginBottom: 28 }}>
        The page you are looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: 14 }}>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={16} />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
