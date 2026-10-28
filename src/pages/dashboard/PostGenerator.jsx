import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  Sliders,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  Save,
  Cpu,
  Key,
  ExternalLink,
  Zap,
  Info,
  Send,
  Share2,
  Layers,
  Image as ImageIcon,
  Upload,
  X,
  Camera
} from 'lucide-react';
import { generateLinkedInPost } from '../../utils/postEngine';
import { savePost } from '../../utils/postStorage';
import { getStoredProfile } from '../../utils/profileStorage';
import LinkedInLogo from '../../components/ui/LinkedInLogo';

export default function PostGenerator() {
  const [topic, setTopic] = useState(
    'Why the most successful engineers write less code and focus on architecture boundaries'
  );
  const [tone, setTone] = useState('Thought Leadership');
  const [format, setFormat] = useState('Hook + Value + CTA');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  // Engine selection: 'ai' | 'local'
  const [engineMode, setEngineMode] = useState('ai');
  const [backendStatus, setBackendStatus] = useState({
    online: false,
    hasApiKey: false,
    hasLinkedInConfig: false,
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    checked: false
  });

  // Selected AI Model
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');

  // Stored Profile Data
  const [storedProfile, setStoredProfile] = useState(() => getStoredProfile());

  // Save to History / Draft notification
  const [saveNotice, setSaveNotice] = useState(null);

  // LinkedIn State
  const [linkedInUser, setLinkedInUser] = useState(null);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);

  const [topicError, setTopicError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [savedPostStatus, setSavedPostStatus] = useState(false);
  const [postSource, setPostSource] = useState('Local Engine');

  // Initial generated text
  const [generatedText, setGeneratedText] = useState(() =>
    generateLinkedInPost({
      topic: 'Why the most successful engineers write less code and focus on architecture boundaries',
      tone: 'Thought Leadership',
      format: 'Hook + Value + CTA',
      includeEmojis: true,
      includeHashtags: true
    })
  );

  // Image Upload State
  const [uploadedImage, setUploadedImage] = useState(null);        // File object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);    // Data URL for preview
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); // Loading state
  const imageInputRef = useRef(null);                              // Hidden file input ref
  const dropZoneRef = useRef(null);                                // Drag-and-drop zone ref

  // Fetch LinkedIn user status
  const checkLinkedInAuth = async () => {
    try {
      const res = await fetch('/api/linkedin/me');
      if (res.ok) {
        const data = await res.json();
        setIsLinkedInConnected(Boolean(data.isConnected));
        setLinkedInUser(data.user);
      }
    } catch (err) {
      console.warn('Could not verify LinkedIn connection:', err);
    }
  };

  // Check backend server & AI API key status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus({
            online: true,
            hasApiKey: data.hasApiKey,
            hasLinkedInConfig: data.hasLinkedInConfig,
            provider: data.provider || 'OpenAI',
            model: data.model || 'gpt-4o-mini',
            checked: true
          });
          if (data.model) {
            setSelectedModel(data.model);
          }
          if (data.hasApiKey) {
            setEngineMode('ai');
          } else {
            setEngineMode('local');
          }
        } else {
          setBackendStatus({
            online: false,
            hasApiKey: false,
            hasLinkedInConfig: false,
            provider: 'None',
            model: 'gpt-4o-mini',
            checked: true
          });
          setEngineMode('local');
        }
      } catch (err) {
        console.warn('Backend server not reachable or offline, using local engine:', err);
        setBackendStatus({
          online: false,
          hasApiKey: false,
          hasLinkedInConfig: false,
          provider: 'None',
          model: 'gpt-4o-mini',
          checked: true
        });
        setEngineMode('local');
      }
    };

    checkStatus();
    checkLinkedInAuth();

    // Check for OAuth redirect URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin_auth') === 'success') {
      setAuthNotice({
        type: 'success',
        message: 'Your LinkedIn account was successfully connected! You can now publish directly.'
      });
      checkLinkedInAuth();
      window.dispatchEvent(new Event('linkedai_user_updated'));
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('linkedin_error')) {
      setAuthNotice({
        type: 'error',
        message: `LinkedIn OAuth Error: ${decodeURIComponent(params.get('linkedin_error'))}`
      });
      window.history.replaceState({}, '', window.location.pathname);
    }

    const syncProfile = () => {
      setStoredProfile(getStoredProfile());
    };

    window.addEventListener('linkedai_user_updated', checkLinkedInAuth);
    window.addEventListener('linkedai_user_profile_updated', syncProfile);
    return () => {
      window.removeEventListener('linkedai_user_updated', checkLinkedInAuth);
      window.removeEventListener('linkedai_user_profile_updated', syncProfile);
    };
  }, []);

  const tones = [
    'Thought Leadership',
    'Storytelling',
    'Contrarian / Punchy',
    'Educational How-To',
    'Celebratory'
  ];

  const formats = [
    'Hook + Value + CTA',
    'Numbered Listicle',
    'Deep-Dive Story'
  ];

  const quickTopics = [
    'Why 10x Engineers are a myth in modern teams',
    'Scaling a system from 1k to 100k req/sec',
    'Transitioning from IC to Tech Lead',
    'How to conduct high-leverage code reviews in under 2 hours',
    'The brutal truth about managing technical debt'
  ];

  const openRouterModels = [
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast & Smart' },
    { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', desc: 'Ultra Fast' },
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku', desc: 'Sharp Voice' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', desc: 'Open Source' }
  ];

  // Real Metrics
  const charCount = generatedText.length;
  const wordCount = generatedText.trim().split(/\s+/).filter(Boolean).length;
  const estReadTimeSec = Math.max(15, Math.round((wordCount / 200) * 60));

  // Local generator runner
  const runLocalGeneration = (targetTopic = topic) => {
    setIsGenerating(true);
    setApiError(null);
    setTimeout(() => {
      const output = generateLinkedInPost({
        topic: targetTopic,
        tone,
        format,
        includeEmojis,
        includeHashtags
      });
      setGeneratedText(output);
      setPostSource('Local Template Engine');
      setIsGenerating(false);
    }, 350);
  };

  // Main generate handler
  const handleGenerate = async (e) => {
    e?.preventDefault();

    if (!topic.trim()) {
      setTopicError('Please enter a topic or core idea for your post.');
      return;
    }
    setTopicError('');
    setApiError(null);
    setPublishSuccess(null);
    setPublishError(null);

    // If local mode is active, run local generator
    if (engineMode === 'local') {
      runLocalGeneration();
      return;
    }

    // AI Mode: Call secure Node.js backend (OpenRouter or OpenAI)
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          format,
          includeEmojis,
          includeHashtags,
          model: selectedModel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'MISSING_API_KEY') {
          setApiError({
            type: 'MISSING_KEY',
            message:
              'AI API key is missing. Add your OPENROUTER_API_KEY or OPENAI_API_KEY to the backend .env file to enable live AI generation.'
          });
        } else if (data.error === 'INVALID_API_KEY') {
          setApiError({
            type: 'INVALID_KEY',
            message:
              `The ${backendStatus.provider} API key in your .env file appears invalid. Please verify your key.`
          });
        } else if (data.error === 'INSUFFICIENT_CREDITS') {
          setApiError({
            type: 'CREDITS_DEPLETED',
            message:
              'Your OpenRouter account credit balance is depleted. Please top up your credits at openrouter.ai.'
          });
        } else if (data.error === 'RATE_LIMIT_EXCEEDED') {
          setApiError({
            type: 'RATE_LIMIT',
            message: `${backendStatus.provider} rate limit exceeded. Please try again shortly.`
          });
        } else {
          setApiError({
            type: 'SERVER_ERROR',
            message: data.message || `Error communicating with ${backendStatus.provider} backend.`
          });
        }
        setIsGenerating(false);
        return;
      }

      setGeneratedText(data.post);
      const displayModel = (data.model || selectedModel).split('/').pop();
      setPostSource(`${data.provider || backendStatus.provider} (${displayModel})`);
      setIsGenerating(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setApiError({
        type: 'NETWORK_ERROR',
        message:
          'Could not connect to the backend server (http://localhost:5000). Ensure the backend is running (`npm run server`), or use the local generator fallback.'
      });
      setIsGenerating(false);
    }
  };

  const handleSelectQuickTopic = (quickTopic) => {
    setTopic(quickTopic);
    setTopicError('');
    setApiError(null);
    if (engineMode === 'local' || !backendStatus.hasApiKey) {
      runLocalGeneration(quickTopic);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSaveDraft = () => {
    if (!generatedText || !generatedText.trim()) {
      setSaveNotice({
        type: 'error',
        message: 'Cannot save an empty draft. Please generate or write post content first.'
      });
      return;
    }

    const result = savePost({
      title: topic?.trim() || 'Untitled Draft',
      content: generatedText,
      category: 'General',
      tone,
      format,
      status: 'Draft'
    });

    if (!result.success) {
      setSaveNotice({
        type: 'error',
        message: result.message || 'Failed to save draft.'
      });
      return;
    }

    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2200);

    setSaveNotice({
      type: result.isDuplicate ? 'info' : 'success',
      message: result.isDuplicate
        ? 'Draft is already in your History (entry refreshed).'
        : 'Draft saved to localStorage!',
      viewHistory: true
    });

    setTimeout(() => {
      setSaveNotice((prev) => (prev?.viewHistory ? null : prev));
    }, 4500);
  };

  const handleSavePost = () => {
    if (!generatedText || !generatedText.trim()) {
      setSaveNotice({
        type: 'error',
        message: 'Cannot save an empty post. Please generate or enter post content first.'
      });
      return;
    }

    const result = savePost({
      title: topic?.trim() || 'Untitled Post',
      content: generatedText,
      category: 'General',
      tone,
      format,
      status: 'Ready to Post'
    });

    if (!result.success) {
      setSaveNotice({
        type: 'error',
        message: result.message || 'Failed to save post to history.'
      });
      return;
    }

    setSavedPostStatus(true);
    setTimeout(() => setSavedPostStatus(false), 2200);

    setSaveNotice({
      type: result.isDuplicate ? 'info' : 'success',
      message: result.isDuplicate
        ? 'This post is already in your History (entry refreshed).'
        : 'Post successfully saved to Post History!',
      viewHistory: true
    });

    setTimeout(() => {
      setSaveNotice((prev) => (prev?.viewHistory ? null : prev));
    }, 4500);
  };

  // A/B Hooks State
  const [hookVariations, setHookVariations] = useState([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  // Generate 4 Alternative Hooks
  const handleGenerateHooks = async () => {
    if (!generatedText.trim()) return;
    setIsGeneratingHooks(true);
    
    // First line is current hook
    const lines = generatedText.trim().split('\n');
    const bodyLines = lines.slice(1).join('\n');
    
    if (backendStatus.hasApiKey && engineMode === 'ai') {
      try {
        const prompt = `Given this LinkedIn post:\n"""\n${generatedText.slice(0, 500)}\n"""\n\nGenerate 4 wildly different, scroll-stopping, high-converting opening hooks (1-2 sentences each). Return ONLY the 4 hooks, numbered 1 to 4, no extra commentary.`;
        
        const res = await fetch('/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: prompt,
            tone: 'Contrarian / Punchy',
            format: 'Hook + Value + CTA',
            model: selectedModel
          })
        });
        
        const data = await res.json();
        if (data.post) {
          const parsed = data.post
            .split('\n')
            .map(l => l.replace(/^[0-9]+[\.\)]\s*/, '').trim())
            .filter(l => l.length > 10 && !l.toLowerCase().includes('here are'));
          setHookVariations(parsed.slice(0, 4));
        }
      } catch (err) {
        console.warn('Hook generation error:', err);
      }
    }
    
    // Fallback hooks if AI failed or empty
    setHookVariations(prev => prev.length ? prev : [
      `Most people are completely wrong about this topic:`,
      `I spent 5 years studying this problem. Here is the blunt truth:`,
      `Stop doing this if you want to grow in 2026:`,
      `The single biggest mistake I see ambitious leaders making:`
    ]);
    setIsGeneratingHooks(false);
  };

  const handleApplyHook = (newHook) => {
    const lines = generatedText.trim().split('\n');
    const remaining = lines.slice(1).join('\n');
    setGeneratedText(`${newHook}\n\n${remaining}`);
    setSaveNotice({ type: 'success', message: 'Hook applied to preview!' });
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // Direct Publish to LinkedIn API Handler
  const handlePublishToLinkedIn = async () => {
    if (!generatedText.trim()) return;

    if (!isLinkedInConnected) {
      // Direct user to initiate OAuth flow
      window.location.href = '/api/auth/linkedin';
      return;
    }

    const confirmPost = window.confirm(
      `Publish this post directly to LinkedIn under "${linkedInUser?.name || 'your profile'}"?`
    );
    if (!confirmPost) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const response = await fetch('/api/linkedin/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: generatedText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setPublishError(result.message || 'LinkedIn publishing failed. Ensure "Share on LinkedIn" is active.');
      } else {
        setPublishSuccess({
          postUrl: result.postUrl,
          author: result.author,
          publishedAt: result.publishedAt
        });

        // Automatically archive in history as Published
        savePost({
          title: topic || 'Published LinkedIn Post',
          content: generatedText,
          category: 'LinkedIn Published',
          tone,
          format,
          status: 'Ready to Post'
        });
      }
    } catch (err) {
      console.error('LinkedIn share error:', err);
      setPublishError(err.message || 'Network error sharing to LinkedIn.');
    } finally {
      setIsPublishing(false);
    }
  };

  const displayName = isLinkedInConnected && linkedInUser?.name
    ? linkedInUser.name
    : storedProfile?.fullName || 'Rohit Sharma';

  // ==========================================
  // 📸 IMAGE UPLOAD & ANALYSIS HANDLERS
  // ==========================================

  /** Handle image file selection (from file picker or drag-and-drop) */
  const handleImageSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSaveNotice({
        type: 'error',
        message: `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, GIF, or WebP image.`
      });
      return;
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setSaveNotice({
        type: 'error',
        message: 'Image is too large. Maximum allowed size is 10 MB.'
      });
      return;
    }

    setUploadedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Clear any previous notices
    setSaveNotice(null);
  };

  /** Handle file input change */
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  /** Handle drag over */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#0a66c2';
    e.currentTarget.style.background = '#eff6ff';
  };

  /** Handle drag leave */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#cbd5e1';
    e.currentTarget.style.background = '#f8fafc';
  };

  /** Handle file drop */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#cbd5e1';
    e.currentTarget.style.background = '#f8fafc';

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  /** Remove selected image */
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
  };

  /** Generate LinkedIn post from uploaded image via AI */
  const handleGenerateFromImage = async () => {
    if (!uploadedImage) {
      setSaveNotice({
        type: 'error',
        message: 'Please upload an image first.'
      });
      return;
    }

    if (!backendStatus.hasApiKey) {
      setApiError({
        type: 'MISSING_KEY',
        message: 'AI API key is required for image analysis. Add your OPENROUTER_API_KEY or OPENAI_API_KEY to the backend .env file.'
      });
      return;
    }

    setIsAnalyzingImage(true);
    setApiError(null);
    setPublishSuccess(null);
    setPublishError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('tone', tone);
      formData.append('format', format);
      formData.append('includeEmojis', String(includeEmojis));
      formData.append('includeHashtags', String(includeHashtags));
      formData.append('model', selectedModel);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
        // Note: Do NOT set Content-Type header — browser sets it with boundary for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'MISSING_API_KEY') {
          setApiError({
            type: 'MISSING_KEY',
            message: data.message
          });
        } else if (data.error === 'INVALID_API_KEY') {
          setApiError({
            type: 'INVALID_KEY',
            message: data.message
          });
        } else if (data.error === 'INSUFFICIENT_CREDITS') {
          setApiError({
            type: 'CREDITS_DEPLETED',
            message: data.message
          });
        } else if (data.error === 'FILE_TOO_LARGE') {
          setSaveNotice({
            type: 'error',
            message: data.message
          });
        } else if (data.error === 'INVALID_FILE_TYPE') {
          setSaveNotice({
            type: 'error',
            message: data.message
          });
        } else {
          setApiError({
            type: 'SERVER_ERROR',
            message: data.message || `Error analyzing image via ${backendStatus.provider}.`
          });
        }
        setIsAnalyzingImage(false);
        return;
      }

      // Success — set the generated post
      setGeneratedText(data.post);
      const displayModel = (data.model || selectedModel).split('/').pop();
      setPostSource(`${data.provider || backendStatus.provider} Image Analysis (${displayModel})`);

      // Auto-fill the topic field with a reference to image analysis
      if (!topic.trim() || topic === 'Why the most successful engineers write less code and focus on architecture boundaries') {
        setTopic(`[Image Analysis] ${uploadedImage.name}`);
      }

      setSaveNotice({
        type: 'success',
        message: '📸 Post generated from your image! Edit the text below and save when ready.',
        viewHistory: false
      });
      setTimeout(() => {
        setSaveNotice((prev) => (prev?.message?.includes('image') ? null : prev));
      }, 5000);

      setIsAnalyzingImage(false);
    } catch (err) {
      console.error('Image analysis fetch error:', err);
      setApiError({
        type: 'NETWORK_ERROR',
        message: 'Could not connect to the backend server. Ensure the backend is running (`npm run server`).'
      });
      setIsAnalyzingImage(false);
    }
  };

  const displayAvatar = isLinkedInConnected && linkedInUser?.picture
    ? linkedInUser.picture
    : storedProfile?.photoUrl || null;

  const displayHeadline = isLinkedInConnected
    ? 'Connected via LinkedIn OpenID • Live Sync'
    : storedProfile?.headline || 'Senior Tech Lead | Cloud Architecture & Scalable Systems';

  const authorInitials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RS';

  const providerLabel = backendStatus.provider === 'OpenRouter' ? 'OpenRouter AI' : 'OpenAI';
  const modelShortName = selectedModel.split('/').pop() || 'gpt-4o-mini';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Post Generator &amp; Studio</h1>
          <p className="page-subtitle">
            Craft viral, high-converting LinkedIn posts powered by {providerLabel} or instant offline local generation.
          </p>
        </div>
      </div>

      {/* OAuth Banner Notification */}
      {authNotice && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: authNotice.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${authNotice.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: authNotice.type === 'success' ? '#065f46' : '#991b1b',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {authNotice.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
            <span>{authNotice.message}</span>
          </div>
          <button
            onClick={() => setAuthNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Post Published Success Alert */}
      {publishSuccess && (
        <div
          style={{
            padding: '16px',
            borderRadius: 10,
            marginBottom: 20,
            background: '#f0fdf4',
            border: '1px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={22} color="#16a34a" />
            <div>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
                🎉 Post successfully published live to LinkedIn!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                Published under <strong>{publishSuccess.author}</strong> at {new Date(publishSuccess.publishedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a
              href={publishSuccess.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#0a66c2', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <span>View Post on LinkedIn</span>
              <ExternalLink size={14} />
            </a>
            <button
              onClick={() => setPublishSuccess(null)}
              className="btn btn-ghost btn-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Post Published Error Alert */}
      {publishError && (
        <div
          style={{
            padding: '14px 16px',
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
            <span>{publishError}</span>
          </div>
          <button
            onClick={() => setPublishError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Save to History / Draft Notification Banner */}
      {saveNotice && (
        <div
          style={{
            padding: '13px 16px',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            background:
              saveNotice.type === 'success'
                ? '#ecfdf5'
                : saveNotice.type === 'info'
                ? '#eff6ff'
                : '#fef2f2',
            border: `1px solid ${
              saveNotice.type === 'success'
                ? '#a7f3d0'
                : saveNotice.type === 'info'
                ? '#bfdbfe'
                : '#fecaca'
            }`,
            color:
              saveNotice.type === 'success'
                ? '#065f46'
                : saveNotice.type === 'info'
                ? '#1e40af'
                : '#991b1b',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {saveNotice.type === 'success' && <CheckCircle2 size={18} color="#059669" />}
            {saveNotice.type === 'info' && <Info size={18} color="#2563eb" />}
            {saveNotice.type === 'error' && <AlertCircle size={18} color="#dc2626" />}
            <span style={{ fontWeight: 500 }}>{saveNotice.message}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saveNotice.viewHistory && (
              <Link
                to="/dashboard/history"
                className="btn btn-outline btn-sm"
                style={{
                  padding: '2px 10px',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none'
                }}
              >
                <span>View in Post History</span>
                <ExternalLink size={12} />
              </Link>
            )}
            <button
              onClick={() => setSaveNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Engine Mode Toggle */}
      <div className="mode-toggle-group">
        <button
          type="button"
          onClick={() => {
            setEngineMode('ai');
            setApiError(null);
          }}
          className={`mode-toggle-btn ${engineMode === 'ai' ? 'active' : ''}`}
        >
          <Sparkles size={16} color="#7c3aed" />
          <span>{providerLabel} Engine ({modelShortName})</span>
          <span
            className={`status-indicator-dot ${
              backendStatus.hasApiKey ? 'status-dot-green' : 'status-dot-yellow'
            }`}
            title={backendStatus.hasApiKey ? `${providerLabel} Active` : 'API Key Missing in .env'}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            setEngineMode('local');
            setApiError(null);
          }}
          className={`mode-toggle-btn ${engineMode === 'local' ? 'active' : ''}`}
        >
          <Zap size={16} color="#0a66c2" />
          <span>Local Generator (Offline Engine)</span>
        </button>
      </div>

      {/* API Key Missing Setup Banner */}
      {apiError && (
        <div className="setup-banner">
          <div className="setup-banner-header">
            <span className="setup-banner-title">
              <AlertCircle size={18} color="#b45309" />
              {apiError.type === 'MISSING_KEY'
                ? `${providerLabel} API Key Required`
                : `${providerLabel} Backend Notice`}
            </span>
            <button
              onClick={() => setApiError(null)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 8px' }}
            >
              ✕
            </button>
          </div>

          <p className="setup-banner-desc">
            {apiError.message}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setEngineMode('local');
                runLocalGeneration();
              }}
              className="btn btn-primary btn-sm"
            >
              <Zap size={14} />
              <span>Generate with Local Engine Instead</span>
            </button>

            <span style={{ fontSize: '0.75rem', color: '#92400e' }}>
              Add <code>OPENAI_API_KEY=sk-or-v1-...</code> or <code>OPENROUTER_API_KEY</code> to your <code>.env</code> file.
            </span>
          </div>
        </div>
      )}

      <div className="dashboard-grid-2">
        {/* Left Column: Form Controls */}
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="#0a66c2" />
              <span>Post Settings &amp; Prompts</span>
            </h3>
            <span className="badge badge-linkedin">
              {engineMode === 'ai' ? `${providerLabel} Studio` : 'Local Engine'}
            </span>
          </div>

          <form onSubmit={handleGenerate}>
            {/* OpenRouter Model Selector (when OpenRouter is active and AI mode selected) */}
            {engineMode === 'ai' && backendStatus.provider === 'OpenRouter' && (
              <div className="form-group" style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Layers size={14} color="#0a66c2" />
                  <span>OpenRouter Model Selection</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {openRouterModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={`chip ${selectedModel === m.id ? 'active' : ''}`}
                      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', padding: '6px 10px', height: 'auto' }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{m.label}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="topic-input">
                Topic or Idea <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="topic-input"
                className={`form-textarea ${topicError ? 'error' : ''}`}
                rows={3}
                placeholder="What valuable lesson, case study, or insight do you want to share?"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (topicError) setTopicError('');
                }}
              />
              {topicError && <span className="field-error-msg">{topicError}</span>}
            </div>

            {/* Quick Inspiration Topics */}
            <div className="form-group">
              <label className="form-label">Quick Ideas &amp; Angles</label>
              <div className="chips-row">
                {quickTopics.map((qt) => (
                  <button
                    key={qt}
                    type="button"
                    onClick={() => handleSelectQuickTopic(qt)}
                    className="chip"
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="form-group">
              <label className="form-label">Tone of Voice</label>
              <div className="chips-row">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`chip ${tone === t ? 'active' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div className="form-group">
              <label className="form-label">Post Structure</label>
              <div className="chips-row">
                {formats.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`chip ${format === f ? 'active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  style={{ accentColor: 'var(--linkedin-blue)' }}
                />
                Include Emojis
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  style={{ accentColor: 'var(--linkedin-blue)' }}
                />
                Append Relevant Hashtags
              </label>
            </div>

            {/* 📸 Image Upload Section */}
            {engineMode === 'ai' && (
              <div
                className="form-group"
                style={{
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  marginBottom: 20
                }}
              >
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Camera size={15} color="#0a66c2" />
                  <span>Generate Post from Image</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>(AI Vision)</span>
                </label>

                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />

                {!uploadedImage ? (
                  /* Drop Zone */
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 10,
                      padding: '28px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Upload size={28} color="#94a3b8" style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                      Drop an image here or click to upload
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      Supports JPEG, PNG, GIF, WebP • Max 10 MB
                    </div>
                  </div>
                ) : (
                  /* Image Preview */
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 12
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={imagePreviewUrl}
                        alt="Upload preview"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#ef4444',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-all' }}>
                        {uploadedImage.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        {(uploadedImage.size / 1024).toFixed(1)} KB • {uploadedImage.type.split('/')[1].toUpperCase()}
                      </div>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        style={{
                          marginTop: 6,
                          fontSize: '0.75rem',
                          color: '#0a66c2',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                          fontWeight: 500
                        }}
                      >
                        Replace image
                      </button>
                    </div>
                  </div>
                )}

                {/* Generate from Image Button */}
                {uploadedImage && (
                  <button
                    type="button"
                    onClick={handleGenerateFromImage}
                    disabled={isAnalyzingImage || isGenerating}
                    className="btn btn-ai btn-md"
                    style={{
                      width: '100%',
                      marginTop: 12,
                      background: 'linear-gradient(135deg, #7c3aed 0%, #0a66c2 100%)',
                      color: '#fff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 8,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isAnalyzingImage ? 'wait' : 'pointer',
                      opacity: isAnalyzingImage ? 0.8 : 1
                    }}
                  >
                    {isAnalyzingImage ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Analyzing Image & Generating Post...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>Generate Post from This Image</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`btn ${engineMode === 'ai' ? 'btn-ai' : 'btn-primary'} btn-lg`}
              style={{ width: '100%' }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>
                    {engineMode === 'ai' ? `Generating with ${providerLabel}...` : 'Generating with Local Engine...'}
                  </span>
                </>
              ) : (
                <>
                  {engineMode === 'ai' ? <Sparkles size={18} /> : <Zap size={18} />}
                  <span>
                    {engineMode === 'ai' ? `Generate Post via ${providerLabel}` : 'Generate with Local Engine'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live LinkedIn Mockup */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Live Feed Preview
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {postSource}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-outline btn-sm"
                title="Save this post as a draft in localStorage"
              >
                {savedDraft ? <Check size={14} color="#057642" /> : <Bookmark size={14} />}
                <span>{savedDraft ? 'Draft Saved!' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={handleSavePost}
                className="btn btn-outline-primary btn-sm"
                title="Save as ready to post in your history"
              >
                {savedPostStatus ? <Check size={14} color="#057642" /> : <Save size={14} />}
                <span>{savedPostStatus ? 'Saved to History!' : 'Save to History'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-outline btn-sm"
                title="Copy post content to clipboard"
              >
                {copied ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* 🚀 1-Click Publish to LinkedIn */}
              <button
                type="button"
                onClick={handlePublishToLinkedIn}
                disabled={isPublishing || isGenerating}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: '#0a66c2',
                  borderColor: '#0a66c2',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600
                }}
                title={isLinkedInConnected ? `Publish to ${linkedInUser?.name}` : 'Connect your LinkedIn account to publish'}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <LinkedInLogo size={14} color="#ffffff" />
                    <span>{isLinkedInConnected ? 'Publish to LinkedIn' : 'Connect & Publish'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LinkedIn Mockup Card */}
          <div className="linkedin-post-card">
            {/* Author Meta */}
            <div className="post-author-row">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="post-author-avatar">{authorInitials}</div>
              )}
              <div className="post-author-meta">
                <div className="post-author-name">
                  {displayName}
                  {isLinkedInConnected && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.65rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontWeight: 600
                      }}
                    >
                      Verified Account
                    </span>
                  )}
                </div>
                <div className="post-author-title">
                  {displayHeadline}
                </div>
                <div className="post-timestamp">Preview • Ready to Post</div>
              </div>
            </div>

            {/* Post Content with Loading Skeleton */}
            {isGenerating || isAnalyzingImage ? (
              <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '90%' }} />
                <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '95%' }} />
                <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '75%' }} />
                <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '85%' }} />
                {isAnalyzingImage && (
                  <div style={{ textAlign: 'center', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 500, marginTop: 8 }}>
                    📸 Analyzing your image with AI...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Image thumbnail in preview (if post was generated from image) */}
                {imagePreviewUrl && postSource.includes('Image Analysis') && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={imagePreviewUrl}
                      alt="Post source"
                      style={{
                        width: '100%',
                        maxHeight: 220,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </div>
                )}
                <textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="post-body-text"
                  style={{
                    width: '100%',
                    minHeight: 200,
                    border: '1px solid transparent',
                    background: 'transparent',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    padding: '12px 0',
                    outline: 'none',
                    whiteSpace: 'pre-wrap',
                    cursor: 'text'
                  }}
                  placeholder="Your generated post will appear here. You can edit it before saving..."
                />
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    textAlign: 'right',
                    marginTop: -4,
                    fontStyle: 'italic'
                  }}
                >
                  ✏️ Click to edit before saving
                </div>
              </div>
            )}

            {/* A/B Hook Tester Widget */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0a66c2', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} />
                  A/B Hook Tester &amp; Alternates
                </span>
                <button
                  type="button"
                  onClick={handleGenerateHooks}
                  disabled={isGeneratingHooks}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                >
                  {isGeneratingHooks ? 'Generating...' : '⚡ Generate 4 Alternate Hooks'}
                </button>
              </div>

              {hookVariations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {hookVariations.map((h, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: '#f8fafc', 
                        padding: '6px 10px', 
                        borderRadius: 6, 
                        fontSize: '0.75rem',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span style={{ flex: 1, marginRight: 8, color: '#334155' }}>
                        <strong>#{i+1}:</strong> "{h}"
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyHook(h)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.7rem', height: 'auto' }}
                      >
                        Use This Hook
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post Metrics Details Card (Real Metrics) */}
          <div
            style={{
              marginTop: 16,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12
            }}
          >
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Character Count
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {charCount} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ 3000</span>
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Word Count
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {wordCount} words
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Est. Read Time
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ~{estReadTimeSec}s
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Generator Source
              </span>
              <span className="badge badge-linkedin" style={{ marginTop: 2 }}>
                {postSource.includes('Local') ? 'Local Rules' : postSource}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
