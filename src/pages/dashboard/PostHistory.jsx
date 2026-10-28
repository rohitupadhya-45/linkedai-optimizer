import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Copy,
  Check,
  Calendar,
  Trash2,
  Bookmark,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Tag,
  Download
} from 'lucide-react';
import { getPosts, deletePost, updatePostStatus } from '../../utils/postStorage';

export default function PostHistory() {
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Load from localStorage on mount and sync on custom events
  useEffect(() => {
    const loadPosts = () => {
      setPosts(getPosts());
    };

    loadPosts();

    window.addEventListener('linkedai_posts_updated', loadPosts);
    window.addEventListener('storage', loadPosts);

    return () => {
      window.removeEventListener('linkedai_posts_updated', loadPosts);
      window.removeEventListener('storage', loadPosts);
    };
  }, []);

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved post?')) {
      const updated = deletePost(id);
      setPosts(updated);
      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
    }
  };

  const handleCopy = (id, text, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (post, e) => {
    e?.stopPropagation();
    const nextStatus = post.status === 'Draft' ? 'Ready to Post' : 'Draft';
    const updated = updatePostStatus(post.id, nextStatus);
    setPosts(updated);
    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, status: nextStatus });
    }
  };

  const handleExportCSV = () => {
    if (posts.length === 0) return;
    const headers = ['ID', 'Title', 'Tone', 'Status', 'Date', 'WordCount', 'Content'];
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
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Drafts' && post.status === 'Draft') ||
      (activeFilter === 'Ready to Post' && (post.status === 'Ready to Post' || post.status === 'Saved')) ||
      (activeFilter === 'Saved' && (post.status === 'Saved' || post.status === 'Ready to Post'));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (post.title || '').toLowerCase().includes(searchLower) ||
      (post.tone || '').toLowerCase().includes(searchLower) ||
      (post.content || '').toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Post History &amp; Saved Drafts</h1>
          <p className="page-subtitle">
            Manage your saved LinkedIn posts and drafts stored locally in your browser.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Download CSV of all saved posts"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <Link to="/dashboard/generator" className="btn btn-primary btn-sm">
            <Sparkles size={15} />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div className="chips-row">
          {['All', 'Saved', 'Drafts', 'Ready to Post'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`chip ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-box" style={{ minWidth: 260 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search saved posts &amp; topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Posts List Table */}
      <div className="card">
        <div className="card-title-row">
          <h3 className="card-title">
            Saved Content Archive ({filteredPosts.length} posts found)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stored in localStorage
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
              No posts found
            </h4>
            <p style={{ fontSize: '0.875rem', marginBottom: 18 }}>
              {searchQuery
                ? 'No posts matched your search criteria.'
                : 'You have not saved any posts or drafts under this filter yet.'}
            </p>
            <Link to="/dashboard/generator" className="btn btn-outline btn-sm">
              <span>Generate a New Post</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic &amp; First Line</th>
                  <th>Tone &amp; Structure</th>
                  <th>Status</th>
                  <th>Length</th>
                  <th>Date Saved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                  >
                    <td style={{ maxWidth: 360 }}>
                      <div style={{ fontWeight: 700, color: '#191919', marginBottom: 4 }}>
                        {post.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.785rem',
                          color: '#666666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {post.content.split('\n')[0]}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className="badge badge-linkedin">{post.tone || 'Thought Leadership'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {post.format || 'Hook + Value + CTA'}
                        </span>
                      </div>
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
                        title="Click action to toggle status"
                      >
                        {post.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#191919', fontWeight: 600 }}>
                        {post.wordCount || post.content.trim().split(/\s+/).length} words
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {post.charCount || post.content.length} chars
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {post.createdAt}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={(e) => handleCopy(post.id, post.content, e)}
                          className="btn btn-outline btn-sm"
                          title="Copy content to clipboard"
                        >
                          {copiedId === post.id ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                          <span>{copiedId === post.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleStatus(post, e)}
                          className="btn btn-ghost btn-sm"
                          title="Toggle between Draft and Ready to Post"
                        >
                          <Bookmark size={14} />
                        </button>

                        <button
                          onClick={(e) => handleDelete(post.id, e)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Delete post from localStorage"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded Preview Card if a post is selected */}
      {selectedPost && (
        <div style={{ marginTop: 24 }} className="card">
          <div className="card-title-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  className={`badge ${
                    selectedPost.status === 'Ready to Post'
                      ? 'badge-success'
                      : selectedPost.status === 'Draft'
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}
                >
                  {selectedPost.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Saved on {selectedPost.createdAt}
                </span>
              </div>
              <h3 className="card-title">{selectedPost.title}</h3>
            </div>

            <button onClick={() => setSelectedPost(null)} className="btn btn-ghost btn-sm">
              Close Preview
            </button>
          </div>

          <div
            style={{
              padding: 20,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              whiteSpace: 'pre-line',
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: '#191919'
            }}
          >
            {selectedPost.content}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Length: {selectedPost.content.length} characters • ~
              {Math.max(15, Math.round((selectedPost.content.trim().split(/\s+/).length / 200) * 60))}s read
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={(e) => handleDelete(selectedPost.id, e)}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                onClick={(e) => handleCopy(selectedPost.id, selectedPost.content, e)}
                className="btn btn-primary btn-sm"
              >
                {copiedId === selectedPost.id ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedId === selectedPost.id ? 'Copied Post Content' : 'Copy Post Content'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
