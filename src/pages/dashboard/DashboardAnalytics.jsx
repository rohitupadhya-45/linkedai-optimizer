import React, { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard';
import {
  TrendingUp,
  FileText,
  PenTool,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { getPosts } from '../../utils/postStorage';

export default function DashboardAnalytics() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = () => {
      setPosts(getPosts());
    };
    load();
    window.addEventListener('linkedai_posts_updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('linkedai_posts_updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  // Compute metrics from actual saved posts
  const totalPosts = posts.length;
  const totalWords = posts.reduce((sum, p) => {
    return sum + (p.wordCount || (p.content ? p.content.trim().split(/\s+/).filter(Boolean).length : 0));
  }, 0);
  const avgWords = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0;
  const totalChars = posts.reduce((sum, p) => sum + (p.content ? p.content.length : 0), 0);
  const avgReadingTimeSec = Math.round((avgWords / 200) * 60);

  // Status breakdown
  const statusCounts = posts.reduce((acc, p) => {
    const st = p.status || 'Draft';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  // Tone breakdown
  const toneCounts = posts.reduce((acc, p) => {
    const t = p.tone || 'Thought Leadership';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Format breakdown
  const formatCounts = posts.reduce((acc, p) => {
    const f = p.format || 'Hook + Value + CTA';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const readyToPostCount = statusCounts['Ready to Post'] || 0;
  const readyRate = totalPosts > 0 ? Math.round((readyToPostCount / totalPosts) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics &amp; Performance</h1>
          <p className="page-subtitle">
            Real metrics calculated from your saved posts, writing velocity, and content distribution.
          </p>
        </div>
        <div className="badge badge-linkedin" style={{ padding: '6px 12px' }}>
          Real Local Storage Data
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Posts in Library"
          value={String(totalPosts)}
          trend={totalPosts > 0 ? `${posts.filter(p => p.status === 'Ready to Post').length} ready` : '0'}
          isPositive={totalPosts > 0}
          icon={FileText}
          iconBg="rgba(10, 102, 194, 0.1)"
          iconColor="#0a66c2"
          subtitle="All saved posts & drafts"
        />
        <StatCard
          title="Total Words Generated"
          value={totalWords.toLocaleString()}
          trend={totalPosts > 0 ? `${totalChars.toLocaleString()} characters` : '0'}
          isPositive={true}
          icon={PenTool}
          iconBg="rgba(124, 58, 237, 0.1)"
          iconColor="#7c3aed"
          subtitle="Content volume written"
        />
        <StatCard
          title="Average Post Length"
          value={`${avgWords} words`}
          trend={`~${avgReadingTimeSec}s read time`}
          isPositive={true}
          icon={Clock}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="#10b981"
          subtitle="Optimal: 70–130 words"
        />
        <StatCard
          title="Publish Readiness"
          value={`${readyRate}%`}
          trend={readyRate >= 50 ? 'Strong pipeline' : 'Drafts need review'}
          isPositive={readyRate >= 50}
          icon={CheckCircle2}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="#f59e0b"
          subtitle={`${readyToPostCount} posts marked Ready`}
        />
      </div>

      <div className="dashboard-grid-2">
        {/* Tone Distribution */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Tone of Voice Distribution</h3>
            <span className="badge badge-primary">Saved Posts</span>
          </div>

          {totalPosts === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No posts generated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(toneCounts).map(([tone, count]) => {
                const pct = Math.round((count / totalPosts) * 100);
                return (
                  <div key={tone}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{tone}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-container" style={{ height: 8 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, backgroundColor: '#0a66c2' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Post Status Distribution */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Content Pipeline Status</h3>
            <span className="badge badge-linkedin">Pipeline</span>
          </div>

          {totalPosts === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No posts generated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = Math.round((count / totalPosts) * 100);
                const color = status === 'Ready to Post' ? '#057642' : status === 'Draft' ? '#d97706' : '#2563eb';
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{status}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-container" style={{ height: 8 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-main)', borderRadius: 8, fontSize: '0.8rem', color: '#64748b' }}>
                💡 <strong>Tip:</strong> Posts marked "Ready to Post" can be published live to LinkedIn with 1 click from the Generator.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Structure Format Breakdown */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title-row">
          <h3 className="card-title">Preferred Post Structures</h3>
          <span className="badge badge-info">Format Metrics</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {Object.entries(formatCounts).map(([format, count]) => {
            const pct = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
            return (
              <div 
                key={format}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: 'var(--bg-main)'
                }}
              >
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Format
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0', color: 'var(--text-main)' }}>
                  {format}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{count} posts</span>
                  <span className="badge badge-primary">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
