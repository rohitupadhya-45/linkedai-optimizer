import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Check, 
  Database, 
  Download, 
  Trash2, 
  Sliders, 
  Key, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getStoredProfile, saveStoredProfile } from '../../utils/profileStorage';
import { getPosts } from '../../utils/postStorage';
import LinkedInLogo from '../../components/ui/LinkedInLogo';

export default function DashboardSettings() {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState(null);

  // App & Generation Preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('linkedai_preferences');
      return stored ? JSON.parse(stored) : {
        defaultTone: 'Thought Leadership',
        defaultFormat: 'Hook + Value + CTA',
        defaultModel: 'openai/gpt-4o-mini',
        includeEmojis: true,
        includeHashtags: true,
        autoSaveDrafts: true
      };
    } catch {
      return {
        defaultTone: 'Thought Leadership',
        defaultFormat: 'Hook + Value + CTA',
        defaultModel: 'openai/gpt-4o-mini',
        includeEmojis: true,
        includeHashtags: true,
        autoSaveDrafts: true
      };
    }
  });

  // API & LinkedIn Status
  const [apiStatus, setApiStatus] = useState({
    provider: 'Checking...',
    hasApiKey: false,
    model: 'gpt-4o-mini',
    isConnected: false
  });

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setApiStatus(prev => ({
          ...prev,
          provider: data.provider || 'None',
          hasApiKey: Boolean(data.hasApiKey),
          model: data.model || 'gpt-4o-mini'
        }));
      })
      .catch(() => {});

    fetch('/api/linkedin/me')
      .then(res => res.json())
      .then(data => {
        setApiStatus(prev => ({
          ...prev,
          isConnected: Boolean(data.isConnected)
        }));
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    saveStoredProfile(profile);
    localStorage.setItem('linkedai_preferences', JSON.stringify(preferences));
    setSaved(true);
    setNotice({ type: 'success', message: 'Settings & Profile preferences saved successfully!' });
    setTimeout(() => setSaved(false), 3000);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleExportPosts = () => {
    const posts = getPosts();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `linkedai_posts_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotice({ type: 'success', message: `Exported ${posts.length} posts to JSON file!` });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportCSV = () => {
    const posts = getPosts();
    if (posts.length === 0) {
      setNotice({ type: 'error', message: 'No posts to export.' });
      return;
    }
    const headers = ['ID', 'Title', 'Tone', 'Status', 'Date', 'Words', 'Content'];
    const rows = posts.map(p => [
      `"${p.id || ''}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.tone || ''}"`,
      `"${p.status || ''}"`,
      `"${p.createdAt || ''}"`,
      p.wordCount || 0,
      `"${(p.content || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `linkedai_posts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setNotice({ type: 'success', message: 'Exported posts to CSV file!' });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete ALL saved posts? This action cannot be undone.')) {
      localStorage.setItem('linkedai_posts', JSON.stringify([]));
      window.dispatchEvent(new Event('linkedai_posts_updated'));
      setNotice({ type: 'info', message: 'All saved posts have been cleared from local storage.' });
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleResetProfile = () => {
    if (window.confirm('Reset profile information to defaults?')) {
      localStorage.removeItem('linkedai_user_profile');
      const reset = getStoredProfile();
      setProfile(reset);
      setNotice({ type: 'info', message: 'Profile reset to default values.' });
      setTimeout(() => setNotice(null), 3500);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings &amp; Preferences</h1>
          <p className="page-subtitle">
            Manage your personal creator profile, AI preferences, data backup, and connected accounts.
          </p>
        </div>
      </div>

      {notice && (
        <div 
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            background: notice.type === 'success' ? '#ecfdf5' : notice.type === 'error' ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${notice.type === 'success' ? '#a7f3d0' : notice.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
            color: notice.type === 'success' ? '#065f46' : notice.type === 'error' ? '#991b1b' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.875rem'
          }}
        >
          {notice.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Creator Identity */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#0a66c2" />
              Creator Identity
            </h3>
            <span className="badge badge-linkedin">Persists Locally</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="search-input"
                style={{ width: '100%', padding: '10px 14px' }}
                placeholder="Rohit Sharma"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="search-input"
                style={{ width: '100%', padding: '10px 14px' }}
                placeholder="rohit@example.com"
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
              Professional Headline
            </label>
            <input
              type="text"
              value={profile.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="search-input"
              style={{ width: '100%', padding: '10px 14px' }}
              placeholder="Senior Tech Lead | Cloud Architecture & Scalable Systems"
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
              About Summary
            </label>
            <textarea
              rows={3}
              value={profile.about || ''}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              className="search-input"
              style={{ width: '100%', padding: '10px 14px', resize: 'vertical' }}
              placeholder="Brief professional summary..."
            />
          </div>
        </div>

        {/* AI Studio Defaults */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="#7c3aed" />
              Default Generator Settings
            </h3>
            <span className="badge badge-primary">Studio Defaults</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Default Tone of Voice
              </label>
              <select
                value={preferences.defaultTone}
                onChange={(e) => setPreferences({ ...preferences, defaultTone: e.target.value })}
                className="search-input"
                style={{ width: '100%', padding: '10px 14px' }}
              >
                <option value="Thought Leadership">Thought Leadership</option>
                <option value="Storytelling">Storytelling</option>
                <option value="Contrarian / Punchy">Contrarian / Punchy</option>
                <option value="Educational How-To">Educational How-To</option>
                <option value="Celebratory">Celebratory</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Default Structure
              </label>
              <select
                value={preferences.defaultFormat}
                onChange={(e) => setPreferences({ ...preferences, defaultFormat: e.target.value })}
                className="search-input"
                style={{ width: '100%', padding: '10px 14px' }}
              >
                <option value="Hook + Value + CTA">Hook + Value + CTA</option>
                <option value="Numbered Listicle">Numbered Listicle</option>
                <option value="Deep-Dive Story">Deep-Dive Story</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.includeEmojis}
                onChange={(e) => setPreferences({ ...preferences, includeEmojis: e.target.checked })}
                style={{ accentColor: '#0a66c2' }}
              />
              Include Emojis by default
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.includeHashtags}
                onChange={(e) => setPreferences({ ...preferences, includeHashtags: e.target.checked })}
                style={{ accentColor: '#0a66c2' }}
              />
              Include Hashtags by default
            </label>
          </div>
        </div>

        {/* System & Integrations Status */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={18} color="#057642" />
              Connected Integrations &amp; API
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Engine</span>
                <span className={`badge ${apiStatus.hasApiKey ? 'badge-success' : 'badge-warning'}`}>
                  {apiStatus.hasApiKey ? 'Active' : 'Offline Engine'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Provider: <strong>{apiStatus.provider}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                Model: <code>{apiStatus.model}</code>
              </div>
            </div>

            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>LinkedIn Integration</span>
                <span className={`badge ${apiStatus.isConnected ? 'badge-success' : 'badge-primary'}`}>
                  {apiStatus.isConnected ? 'Connected' : 'Not Linked'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                OAuth 2.0 UGC publishing scope.
              </div>
              <div style={{ marginTop: 8 }}>
                <a 
                  href="/api/auth/linkedin" 
                  style={{ fontSize: '0.75rem', color: '#0a66c2', fontWeight: 600, textDecoration: 'none' }}
                >
                  {apiStatus.isConnected ? 'Reconnect Account →' : 'Connect LinkedIn Account →'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Backup */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={18} color="#b45309" />
              Data Management &amp; Backup
            </h3>
            <span className="badge badge-info">Zero Cloud Lock-in</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
            All your generated posts and drafts are saved directly in your browser's LocalStorage. You can export them anytime or clear them.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} />
              <span>Export Posts as CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportPosts}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} />
              <span>Export Full JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={handleResetProfile}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ShieldCheck size={14} />
              <span>Reset Profile Data</span>
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', borderColor: '#fecaca' }}
            >
              <Trash2 size={14} />
              <span>Clear Post History</span>
            </button>
          </div>
        </div>

        {/* Save Changes button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="submit" className="btn btn-primary btn-lg">
            {saved ? <Check size={18} /> : <Save size={18} />}
            <span>{saved ? 'Changes Saved!' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
