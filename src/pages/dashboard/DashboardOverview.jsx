import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import {
  Sparkles,
  TrendingUp,
  Eye,
  Users,
  Award,
  PenTool,
  Check,
  Copy,
  ArrowRight,
  Lightbulb,
  FileText,
  Bookmark,
  Image as ImageIcon,
  BarChart3
} from 'lucide-react';
import { getPosts } from '../../utils/postStorage';
import { getStoredProfile } from '../../utils/profileStorage';

export default function DashboardOverview() {
  const [copiedId, setCopiedId] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [storedProfile, setStoredProfile] = useState(() => getStoredProfile());

  useEffect(() => {
    const loadData = () => {
      setAllPosts(getPosts());
    };

    const syncProfile = () => {
      setStoredProfile(getStoredProfile());
    };

    loadData();

    window.addEventListener('linkedai_posts_updated', loadData);
    window.addEventListener('storage', loadData);
    window.addEventListener('linkedai_user_profile_updated', syncProfile);

    return () => {
      window.removeEventListener('linkedai_posts_updated', loadData);
      window.removeEventListener('storage', loadData);
      window.removeEventListener('linkedai_user_profile_updated', syncProfile);
    };
  }, []);

  // ── Compute REAL stats from localStorage ──
  const totalPosts = allPosts.length;
  const totalWords = allPosts.reduce((sum, p) => {
    return sum + (p.wordCount || p.content?.trim().split(/\s+/).filter(Boolean).length || 0);
  }, 0);
  const readyPosts = allPosts.filter(p => p.status === 'Ready to Post').length;
  const draftPosts = allPosts.filter(p => p.status === 'Draft').length;
  const readyRate = totalPosts > 0 ? Math.round((readyPosts / totalPosts) * 100) : 0;

  // Posts created in the last 7 days
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentPostCount = allPosts.filter(p => {
    try {
      const d = new Date(p.createdAt);
      return d >= oneWeekAgo;
    } catch { return false; }
  }).length;

  const recentPosts = allPosts.slice(0, 4);

  const stats = [
    {
      title: 'Total Posts Created',
      value: String(totalPosts),
      trend: recentPostCount > 0 ? `+${recentPostCount} this week` : 'Start creating',
      isPositive: true,
      icon: FileText,
      iconBg: 'rgba(10, 102, 194, 0.1)',
      iconColor: '#0a66c2',
      subtitle: 'Saved in your content pipeline'
    },
    {
      title: 'Total Words Written',
      value: totalWords.toLocaleString(),
      trend: totalPosts > 0 ? `~${Math.round(totalWords / totalPosts)} avg/post` : '—',
      isPositive: true,
      icon: PenTool,
      iconBg: 'rgba(124, 58, 237, 0.1)',
      iconColor: '#7c3aed',
      subtitle: 'Across all saved posts'
    },
    {
      title: 'Content Ready Rate',
      value: `${readyRate}%`,
      trend: `${readyPosts} ready, ${draftPosts} drafts`,
      isPositive: readyRate >= 50,
      icon: TrendingUp,
      iconBg: 'rgba(5, 118, 66, 0.1)',
      iconColor: '#057642',
      subtitle: 'Posts marked Ready to Post'
    },
    {
      title: 'This Week\'s Activity',
      value: `${recentPostCount} Posts`,
      trend: recentPostCount >= 3 ? 'Great pace!' : recentPostCount > 0 ? 'Keep going!' : 'Create your first',
      isPositive: recentPostCount > 0,
      icon: BarChart3,
      iconBg: 'rgba(178, 94, 2, 0.1)',
      iconColor: '#b25e02',
      subtitle: 'Posts created in last 7 days'
    }
  ];

  // ── Weekly activity chart (real data) ──
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyActivity = Array(7).fill(0);
  allPosts.forEach(p => {
    try {
      const d = new Date(p.createdAt);
      if (d >= oneWeekAgo) {
        weeklyActivity[d.getDay()]++;
      }
    } catch { /* skip unparseable dates */ }
  });
  const maxDayCount = Math.max(...weeklyActivity, 1);
  const todayIndex = now.getDay();
  // Reorder so today is last
  const orderedDays = [];
  for (let i = 1; i <= 7; i++) {
    const idx = (todayIndex + i) % 7;
    orderedDays.push({
      day: dayNames[idx],
      count: weeklyActivity[idx],
      pct: Math.round((weeklyActivity[idx] / maxDayCount) * 100) || 5
    });
  }

  const creatorTips = [
    {
      title: 'Optimize Hook Timing',
      desc: 'Posts published on weekday mornings (8:00 AM - 9:30 AM) generally see higher feed engagement.',
      badge: 'Best Practice'
    },
    {
      title: 'Keep Opening Lines Short',
      desc: 'Short, 1-2 sentence opening hooks before the "see more" cutoff improve reader retention significantly.',
      badge: 'Formatting'
    },
    {
      title: 'Engage in the First Hour',
      desc: 'Responding to early comments on your post signals high discussion value to the LinkedIn feed algorithm.',
      badge: 'Engagement'
    }
  ];

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayName = storedProfile?.fullName || 'Rohit';

  return (
    <div>
      {/* Welcome Section */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {displayName.split(' ')[0]}! 👋</h1>
          <p>
            Your LinkedIn content studio is ready. Generate structured, high-impact posts, analyze images with AI, or audit your profile keywords.
          </p>
        </div>

        <div className="welcome-actions">
          <Link to="/dashboard/generator" className="btn btn-welcome-ai">
            <Sparkles size={16} />
            <span>Generate Post</span>
          </Link>
          <Link to="/dashboard/analyzer" className="btn btn-welcome-ghost">
            <Award size={16} />
            <span>Analyze Profile</span>
          </Link>
        </div>
      </section>

      {/* Summary KPI Cards — REAL DATA */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* 2-Column Section */}
      <div className="dashboard-grid-2">
        {/* Weekly Activity Chart — REAL DATA */}
        <div className="card">
          <div className="card-title-row">
            <div>
              <h3 className="card-title">Weekly Content Activity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Posts created per day (last 7 days)
              </p>
            </div>
            <span className="badge badge-linkedin">Real Data</span>
          </div>

          {recentPostCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <BarChart3 size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: '0.875rem' }}>No posts created this week yet.</p>
              <Link to="/dashboard/generator" className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>
                <span>Create Your First Post</span>
              </Link>
            </div>
          ) : (
            <div className="chart-container">
              {orderedDays.map((item) => (
                <div key={item.day} className="chart-bar-group">
                  <span className="chart-val-tooltip">{item.count}</span>
                  <div
                    className="chart-bar"
                    style={{ height: `${item.pct}%` }}
                    title={`${item.day}: ${item.count} post${item.count !== 1 ? 's' : ''}`}
                  />
                  <span className="chart-month">{item.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creator Tips Card */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} color="#0a66c2" />
              Creator Optimization Tips
            </h3>
            <span className="badge badge-linkedin">Actionable</span>
          </div>

          <div>
            {creatorTips.map((tip, idx) => (
              <div key={idx} className="tip-item">
                <div className="tip-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h4>{tip.title}</h4>
                    <span className="badge badge-linkedin" style={{ fontSize: '0.65rem' }}>{tip.badge}</span>
                  </div>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts from Local Storage */}
      <div className="card">
        <div className="card-title-row">
          <div>
            <h3 className="card-title">Recent Saved Posts &amp; Drafts</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Posts created in your studio and stored locally in browser storage
            </p>
          </div>
          <Link to="/dashboard/history" className="btn btn-outline-primary btn-sm">
            <span>View All ({allPosts.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 12 }}>No saved posts yet.</p>
            <Link to="/dashboard/generator" className="btn btn-primary btn-sm">
              <span>Generate Your First Post</span>
            </Link>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic &amp; First Line</th>
                  <th>Tone</th>
                  <th>Status</th>
                  <th>Length</th>
                  <th>Date Saved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontWeight: 700, color: '#191919', marginBottom: 2 }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content.split('\n')[0]}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-linkedin">{post.tone || 'Thought Leadership'}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          post.status === 'Ready to Post'
                            ? 'badge-success'
                            : post.status === 'Draft'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#191919' }}>
                      {post.wordCount || post.content.trim().split(/\s+/).length} words
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{post.createdAt}</td>
                    <td>
                      <button
                        onClick={() => handleCopy(post.id, post.content)}
                        className="btn btn-outline btn-sm"
                        title="Copy post content"
                      >
                        {copiedId === post.id ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                        <span>{copiedId === post.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
