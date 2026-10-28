import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Save,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Camera,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { getStoredProfile, saveStoredProfile } from '../../utils/profileStorage';
import LinkedInLogo from '../../components/ui/LinkedInLogo';

export default function DashboardProfile() {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => getStoredProfile());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Real LinkedIn verified integration state
  const [linkedInAuth, setLinkedInAuth] = useState({
    checked: false,
    isConnected: false,
    user: null
  });

  const checkLinkedInAuth = async () => {
    try {
      const res = await fetch('/api/linkedin/me');
      if (res.ok) {
        const data = await res.json();
        setLinkedInAuth({
          checked: true,
          isConnected: Boolean(data.isConnected),
          user: data.user
        });
      } else {
        setLinkedInAuth({ checked: true, isConnected: false, user: null });
      }
    } catch (err) {
      console.warn('Could not check LinkedIn connection:', err);
      setLinkedInAuth({ checked: true, isConnected: false, user: null });
    }
  };

  useEffect(() => {
    const loaded = getStoredProfile();
    setProfile(loaded);
    setFormData(loaded);
    checkLinkedInAuth();

    window.addEventListener('linkedai_user_updated', checkLinkedInAuth);
    return () => {
      window.removeEventListener('linkedai_user_updated', checkLinkedInAuth);
    };
  }, []);

  const handleDisconnectLinkedIn = async () => {
    try {
      await fetch('/api/auth/linkedin/logout', { method: 'POST' });
      setLinkedInAuth({ checked: true, isConnected: false, user: null });
      window.dispatchEvent(new Event('linkedai_user_updated'));
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    if (!formData.fullName.trim()) {
      setSaveError('Full Name is required.');
      return;
    }
    setSaveError(null);

    const res = saveStoredProfile(formData);
    if (res.success) {
      setProfile(res.profile);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res.error || 'Failed to save profile.');
    }
  };

  // Determine active display values (prefer verified LinkedIn name/avatar if authorized)
  const isVerified = linkedInAuth.isConnected && Boolean(linkedInAuth.user);
  const displayName = isVerified && linkedInAuth.user?.name ? linkedInAuth.user.name : profile.fullName;
  const displayAvatar = isVerified && linkedInAuth.user?.picture ? linkedInAuth.user.picture : profile.photoUrl;

  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RS';

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Header & Back Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <Link
            to="/dashboard"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="page-title" style={{ margin: 0 }}>
            Creator Profile &amp; LinkedIn Account
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Manage your personal profile details and verified LinkedIn connection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="btn btn-outline-primary btn-sm"
            >
              <span>Edit Profile Details</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
                setSaveError(null);
              }}
              className="btn btn-ghost btn-sm"
            >
              <span>Cancel</span>
            </button>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleSaveProfile}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>Profile details saved successfully in local storage!</span>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
      {saveError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{saveError}</span>
          </div>
          <button
            onClick={() => setSaveError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* LinkedIn Verification & Authorization Status Banner */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: isVerified ? '#f0fdf4' : '#f8fafc',
          borderColor: isVerified ? '#86efac' : '#e2e8f0'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isVerified ? '#dcfce7' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isVerified ? '#15803d' : '#0a66c2'
              }}
            >
              <LinkedInLogo size={22} color={isVerified ? '#15803d' : '#0a66c2'} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                  {isVerified ? 'Verified LinkedIn OAuth Integration' : 'LinkedIn Account Integration'}
                </h3>
                <span
                  className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {isVerified ? 'Connected & Verified' : 'Not Connected'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                {isVerified
                  ? `Authenticated as ${linkedInAuth.user?.name} (${linkedInAuth.user?.email || 'Active OpenID Session'}). You can publish directly from Studio.`
                  : 'Connect your real LinkedIn account to import verified member data and publish posts directly.'}
              </p>
            </div>
          </div>

          <div>
            {isVerified ? (
              <button
                type="button"
                onClick={handleDisconnectLinkedIn}
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#fee2e2', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <LogOut size={14} />
                <span>Disconnect Account</span>
              </button>
            ) : (
              <a
                href="/api/auth/linkedin"
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: '#0a66c2',
                  borderColor: '#0a66c2',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none'
                }}
              >
                <LinkedInLogo size={14} color="#ffffff" />
                <span>Connect LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Visual Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--linkedin-blue)'
                }}
              />
            ) : (
              <div
                className="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: '2rem',
                  border: '3px solid var(--linkedin-blue)'
                }}
              >
                {userInitials}
              </div>
            )}

            {isVerified && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  background: '#0a66c2',
                  borderRadius: '50%',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}
                title="Verified via LinkedIn OpenID"
              >
                <Check size={12} color="#ffffff" />
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
            {displayName}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
            {profile.headline}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {isVerified ? (
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                <LinkedInLogo size={12} color="#15803d" /> Verified LinkedIn
              </span>
            ) : (
              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                Local Profile
              </span>
            )}
            <span className="badge badge-linkedin" style={{ fontSize: '0.72rem' }}>
              Creator Mode
            </span>
          </div>

          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                textDecoration: 'none'
              }}
            >
              <LinkIcon size={14} />
              <span>View Public Profile</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#0a66c2" />
              <span>{isEditing ? 'Edit Profile Information' : 'Profile Overview'}</span>
            </h3>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
              >
                Edit
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                All changes persist to localStorage
              </span>
            )}
          </div>

          {isEditing ? (
            /* Editable Form */
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Profile Photo URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.photoUrl}
                    onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                    placeholder="https://... (image URL)"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g. Senior Tech Lead | Cloud Architecture & Scalable Systems"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">LinkedIn Profile URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">About Section</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  placeholder="Summary of your professional background, value proposition, and career focus..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Experience</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Recent roles, key accomplishments, metrics and responsibilities..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Education</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Degree, major, university, graduation year..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="e.g. Cloud Architecture, React, Node.js, System Design, AWS"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={15} />
                  <span>Save Profile to LocalStorage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Read-Only Display Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* About Section */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 6px 0' }}>
                  About
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.about || 'No about section added yet.'}
                </p>
              </div>

              {/* Experience */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} color="#0a66c2" />
                  <span>Experience</span>
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.experience || 'No experience details added yet.'}
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={14} color="#0a66c2" />
                  <span>Education</span>
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.education || 'No education details added yet.'}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 8px 0' }}>
                  Skills &amp; Keywords
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.skills
                    ? profile.skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            background: '#f1f5f9',
                            borderRadius: 16,
                            fontSize: '0.785rem',
                            color: '#334155',
                            fontWeight: 500
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))
                    : 'No skills added yet.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
