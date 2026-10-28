import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Award,
  Zap,
  ArrowRight,
  RotateCcw,
  Sliders,
  FileText
} from 'lucide-react';

export default function ProfileAnalyzer() {
  // Form State
  const [formData, setFormData] = useState({
    targetRole: 'Senior Full Stack Engineer',
    headline: 'Software Engineer at TechCorp | React & Node.js Developer',
    about:
      'Passionate developer with 5+ years of experience building web applications. I love clean code and working with modern JavaScript frameworks. Open to new engineering opportunities in cloud-scale systems.',
    skills: 'JavaScript, TypeScript, React, Node.js, Express, HTML/CSS, Git, REST APIs',
    experience:
      'Senior Developer at TechCorp (2022 - Present):\n- Built client-facing features using React and Node.js.\n- Reduced page load times by 28% through code splitting.\n- Mentored 3 junior developers and collaborated with product teams.'
  });

  const [errors, setErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImproved, setIsGeneratingImproved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [improvedOutput, setImprovedOutput] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // Quick Role Suggestions
  const roleSuggestions = [
    'Senior Full Stack Engineer',
    'Frontend Lead',
    'Backend / Cloud Architect',
    'Engineering Manager',
    'Product Manager',
    'Data Scientist / AI Engineer'
  ];

  // Industry Keyword Dictionary for Target Roles
  const keywordDictionary = {
    frontend: [
      'TypeScript',
      'React 19',
      'Next.js',
      'State Management (Redux/Zustand)',
      'Performance Optimization',
      'Web Vitals',
      'Tailwind CSS',
      'Accessibility (WCAG)',
      'Automated Testing (Jest/Cypress)',
      'Microfrontends'
    ],
    backend: [
      'Distributed Systems',
      'Microservices Architecture',
      'PostgreSQL / SQL',
      'System Design',
      'Docker & Kubernetes',
      'CI/CD Automation',
      'REST & GraphQL APIs',
      'Redis Caching',
      'Cloud Architecture (AWS/GCP)',
      'Event-Driven Systems'
    ],
    fullstack: [
      'Full Stack Architecture',
      'TypeScript',
      'Distributed Systems',
      'System Design',
      'Cloud Native (AWS/GCP)',
      'Docker & Containerization',
      'CI/CD Pipelines',
      'Database Optimization (SQL/NoSQL)',
      'High-Scale API Design',
      'End-to-End Testing'
    ],
    manager: [
      'Cross-Functional Leadership',
      'Agile / Scrum Planning',
      'Engineering Mentorship',
      'Roadmap & Sprint Execution',
      'Stakeholder Communication',
      'System Architecture Governance',
      'Talent Acquisition & Hiring',
      'Performance Reviews & KPI Tracking'
    ],
    product: [
      'Product Strategy & Vision',
      'User Discovery & Research',
      'A/B Testing & Data Analytics',
      'Go-To-Market (GTM) Strategy',
      'OKRs & KPI Metrics',
      'Feature Prioritization',
      'Cross-Functional Alignment'
    ],
    data: [
      'Machine Learning Pipelines',
      'Python',
      'PyTorch / TensorFlow',
      'Large Language Models (LLMs)',
      'MLOps & Model Deployment',
      'Vector Databases',
      'Data Modeling / ETL',
      'BigQuery / SQL'
    ]
  };

  // Helper to determine role category
  const getRoleCategory = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('front')) return 'frontend';
    if (r.includes('back') || r.includes('cloud') || r.includes('devops')) return 'backend';
    if (r.includes('manage') || r.includes('lead') || r.includes('director')) return 'manager';
    if (r.includes('product')) return 'product';
    if (r.includes('data') || r.includes('ai') || r.includes('ml')) return 'data';
    return 'fullstack';
  };

  // Validation Handler
  const validateForm = () => {
    const errs = {};
    if (!formData.targetRole.trim()) {
      errs.targetRole = 'Target Job Role is required.';
    }
    if (!formData.headline.trim()) {
      errs.headline = 'LinkedIn Headline is required.';
    } else if (formData.headline.trim().length < 5) {
      errs.headline = 'Headline must be at least 5 characters long.';
    }
    if (!formData.about.trim()) {
      errs.about = 'About section is required.';
    } else if (formData.about.trim().length < 20) {
      errs.about = 'About section must be at least 20 characters for meaningful analysis.';
    }
    if (!formData.skills.trim()) {
      errs.skills = 'Please enter at least 2 skills (e.g. React, Node.js, SQL).';
    }
    if (!formData.experience.trim()) {
      errs.experience = 'Experience is required.';
    } else if (formData.experience.trim().length < 15) {
      errs.experience = 'Experience must be at least 15 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Pure Local Deterministic Analysis Engine
  const runLocalAnalysis = () => {
    const { targetRole, headline, about, skills, experience } = formData;
    const combinedAllText = `${targetRole} ${headline} ${about} ${skills} ${experience}`.toLowerCase();

    // 1. Headline Scoring (Max 25)
    let headlineScore = 10;
    const hasRoleInHeadline = headline.toLowerCase().includes(targetRole.toLowerCase().split(' ')[0]);
    if (hasRoleInHeadline) headlineScore += 5;
    if (headline.length >= 45 && headline.length <= 220) headlineScore += 4;
    if (headline.includes('|') || headline.includes('•') || headline.includes('/')) headlineScore += 3;
    if (/\d+/.test(headline) || headline.includes('+') || headline.includes('%') || headline.includes('$')) {
      headlineScore += 3;
    }

    // 2. About Section Scoring (Max 25)
    let aboutScore = 10;
    if (about.length >= 120) aboutScore += 5;
    if (about.includes('\n')) aboutScore += 3; // formatted paragraphs
    const ctaKeywords = ['connect', 'reach out', 'email', 'contact', 'message', 'discuss', '@'];
    const hasCTA = ctaKeywords.some((w) => about.toLowerCase().includes(w));
    if (hasCTA) aboutScore += 4;
    if (about.toLowerCase().includes('specializ') || about.toLowerCase().includes('scale') || about.toLowerCase().includes('achieve')) {
      aboutScore += 3;
    }

    // 3. Skills Scoring (Max 25)
    const parsedSkills = skills
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    let skillsScore = 8;
    if (parsedSkills.length >= 3) skillsScore += 5;
    if (parsedSkills.length >= 5) skillsScore += 6;
    if (parsedSkills.length >= 8) skillsScore += 6;

    // 4. Experience Scoring (Max 25)
    let expScore = 10;
    const hasNumbers = /\d+/.test(experience);
    const hasPercentageOrDollar = experience.includes('%') || experience.includes('$') || experience.includes('x');
    if (hasNumbers) expScore += 4;
    if (hasPercentageOrDollar) expScore += 5;
    const actionVerbs = ['led', 'built', 'architected', 'reduced', 'grew', 'scaled', 'delivered', 'managed', 'designed'];
    const verbCount = actionVerbs.filter((v) => experience.toLowerCase().includes(v)).length;
    if (verbCount >= 2) expScore += 4;
    if (experience.length >= 100) expScore += 2;

    // Total Overall Score (Max 100)
    const overallScore = Math.min(99, Math.max(35, headlineScore + aboutScore + skillsScore + expScore));

    // Compile Strengths
    const strengths = [];
    if (hasRoleInHeadline) {
      strengths.push(`Strong positioning: Target role "${targetRole}" is reflected in your headline.`);
    }
    if (headline.includes('|') || headline.includes('•')) {
      strengths.push('Professional headline structure with clear section dividers for readability.');
    }
    if (hasPercentageOrDollar || hasNumbers) {
      strengths.push('Quantifiable business impact detected in your experience (metrics & figures).');
    }
    if (parsedSkills.length >= 5) {
      strengths.push(`Rich skill variety: Identified ${parsedSkills.length} competencies ready for recruiter search.`);
    }
    if (hasCTA) {
      strengths.push('Call-to-Action present in About section, encouraging outbound recruiter inquiries.');
    }
    if (strengths.length < 3) {
      strengths.push('Clear baseline overview of engineering experience and core tech stack.');
    }

    // Compile Weaknesses
    const weaknesses = [];
    if (!headline.includes('|') && !headline.includes('•')) {
      weaknesses.push('Headline lacks visual separators (| or •), making it harder for recruiters to scan quickly.');
    }
    if (!hasPercentageOrDollar) {
      weaknesses.push('Experience entries lack percentage metrics (e.g., "% latency reduced", "% revenue increased").');
    }
    if (!hasCTA) {
      weaknesses.push('About section lacks a clear invitation or contact email (Call-to-Action) at the bottom.');
    }
    if (parsedSkills.length < 5) {
      weaknesses.push('Skills list has fewer than 5 items; top candidates typically highlight 8–15 relevant skills.');
    }
    if (about.length < 150) {
      weaknesses.push('About section is too brief to provide high algorithmic keyword indexing.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Minor: Consider adding more high-scale keywords to your experience bullet points.');
    }

    // Compile Missing Keywords based on Target Role
    const category = getRoleCategory(targetRole);
    const candidateKeywords = keywordDictionary[category] || keywordDictionary.fullstack;
    const missingKeywords = candidateKeywords.filter((kw) => {
      const lowerKw = kw.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
      return !combinedAllText.includes(lowerKw);
    });

    // Compile Actionable Improvement Suggestions
    const suggestions = [
      `Structure your headline as: "${targetRole} @ [Company] | [Core Achievement / Metric] | [Top 3 Tech Skills]"`,
      'Optimize the first 2 lines of your About section: state the business problem you solve before the "see more" link.',
      'Transform experience bullet points into the Google XYZ formula: "Accomplished [X] measured by [Y] by doing [Z]".',
      `Integrate key missing industry keywords into your Skills & About sections: ${missingKeywords.slice(0, 3).join(', ')}.`,
      'End your About section with a dedicated contact line: "Open to discussions regarding [Target Role] roles: [your-email@domain.com]"'
    ];

    return {
      overallScore,
      headlineScore: Math.round((headlineScore / 25) * 100),
      aboutScore: Math.round((aboutScore / 25) * 100),
      skillsScore: Math.round((skillsScore / 25) * 100),
      expScore: Math.round((expScore / 25) * 100),
      strengths,
      weaknesses,
      missingKeywords: missingKeywords.slice(0, 7),
      suggestions
    };
  };

  const handleAnalyze = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = runLocalAnalysis();
      setAnalysisResult(result);
      setIsAnalyzing(false);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('analysis-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  // Generate Improved Headline and About Section
  const handleGenerateImproved = () => {
    if (!validateForm()) return;

    setIsGeneratingImproved(true);
    setTimeout(() => {
      const { targetRole, skills, experience } = formData;
      const parsedSkills = skills
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const top3Skills = parsedSkills.slice(0, 3).join(' • ') || 'Distributed Systems • Cloud Architecture';

      // Generate enhanced headline
      const generatedHeadline = `${targetRole} | Scaling High-Performance Cloud Platforms ☁️ | ${top3Skills} | Tech Mentorship 🚀`;

      // Generate enhanced About section
      const generatedAbout = `Most ${targetRole}s focus solely on code execution.\nI focus on bridging technical system architecture with high-impact business outcomes.\n\nOver the course of my career, I have specialized in building fault-tolerant, scalable software solutions and fostering engineering cultures that prioritize speed, clarity, and reliability.\n\n🎯 Core Competencies:\n• Technical Domain: ${skills || 'System Architecture, Full Stack Engineering'}\n• Methodologies: System Design, Scalable Cloud Deployments, Microservices, CI/CD\n• Leadership: Engineering Mentorship, Code Quality Standards, Cross-Functional Delivery\n\nProven Impact:\n${experience
        .split('\n')
        .slice(0, 3)
        .join('\n') || '• Architected resilient services supporting business-critical operations.'}\n\n📫 Open to exciting ${targetRole} opportunities, advisory discussions, and tech collaborations. Let’s connect or reach out at: rohit.sharma@example.com`;

      setImprovedOutput({
        headline: generatedHeadline,
        about: generatedAbout
      });
      setIsGeneratingImproved(false);

      // Smooth scroll to generated section
      setTimeout(() => {
        document.getElementById('generated-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 700);
  };

  const handleApplyToForm = () => {
    if (!improvedOutput) return;
    setFormData((prev) => ({
      ...prev,
      headline: improvedOutput.headline,
      about: improvedOutput.about
    }));
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);

    // Automatically re-run analysis to show the score improvement
    setTimeout(() => {
      const updatedFormData = {
        ...formData,
        headline: improvedOutput.headline,
        about: improvedOutput.about
      };
      // Trigger instant evaluation
      const updatedResult = runLocalAnalysis();
      setAnalysisResult(updatedResult);
    }, 300);
  };

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleLoadSample = () => {
    setFormData({
      targetRole: 'Senior Full Stack Engineer',
      headline: 'Software Engineer at TechCorp | React & Node.js Developer',
      about:
        'Passionate developer with 5+ years of experience building web applications. I love clean code and working with modern JavaScript frameworks. Open to new engineering opportunities in cloud-scale systems.',
      skills: 'JavaScript, TypeScript, React, Node.js, Express, HTML/CSS, Git, REST APIs',
      experience:
        'Senior Developer at TechCorp (2022 - Present):\n- Built client-facing features using React and Node.js.\n- Reduced page load times by 28% through code splitting.\n- Mentored 3 junior developers and collaborated with product teams.'
    });
    setErrors({});
  };

  const handleResetForm = () => {
    setFormData({
      targetRole: '',
      headline: '',
      about: '',
      skills: '',
      experience: ''
    });
    setErrors({});
    setAnalysisResult(null);
    setImprovedOutput(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">LinkedIn Profile AI Analyzer</h1>
          <p className="page-subtitle">
            Evaluate your LinkedIn profile against algorithm benchmarks for your target job role without external APIs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleLoadSample} className="btn btn-outline btn-sm" title="Load sample profile data">
            <RotateCcw size={14} />
            <span>Load Sample Profile</span>
          </button>
          <button onClick={handleResetForm} className="btn btn-ghost btn-sm" title="Clear all input fields">
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>Please fill in all required fields marked below to run your profile analysis.</span>
        </div>
      )}

      {appliedNotification && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
          <CheckCircle2 size={20} />
          <span>Applied improved Headline &amp; About section to the form! Running updated analysis...</span>
        </div>
      )}

      {/* Input Form Card */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-title-row">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#0a66c2" />
            Profile Input Details
          </h3>
          <span className="badge badge-linkedin">Local Evaluation Engine</span>
        </div>

        <form onSubmit={handleAnalyze} className="analyzer-form-grid">
          {/* Target Job Role */}
          <div className="form-group">
            <label className="form-label">
              Target Job Role <span className="field-required">*</span>
            </label>
            <input
              type="text"
              value={formData.targetRole}
              onChange={(e) => handleChange('targetRole', e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer, Engineering Manager..."
              className={`form-input ${errors.targetRole ? 'input-error' : ''}`}
            />
            {errors.targetRole && <div className="form-error"><XCircle size={14} /> {errors.targetRole}</div>}

            <div style={{ marginTop: 8 }}>
              <span className="field-hint" style={{ display: 'block', marginBottom: 4 }}>Quick Roles:</span>
              <div className="chips-row">
                {roleSuggestions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleChange('targetRole', r)}
                    className={`chip ${formData.targetRole === r ? 'active' : ''}`}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LinkedIn Headline */}
          <div className="form-group">
            <label className="form-label">
              LinkedIn Headline <span className="field-required">*</span>
              <span className="char-counter">{formData.headline.length} / 220 chars</span>
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="e.g. Senior Software Engineer @ TechCorp | Cloud Architecture | Ex-Google"
              className={`form-input ${errors.headline ? 'input-error' : ''}`}
            />
            {errors.headline && <div className="form-error"><XCircle size={14} /> {errors.headline}</div>}
            <div className="field-hint">Tip: Use separators (| or •) and showcase your target role + quantifiable impact.</div>
          </div>

          {/* About Section */}
          <div className="form-group">
            <label className="form-label">
              About / Summary Section <span className="field-required">*</span>
              <span className="char-counter">{formData.about.length} characters</span>
            </label>
            <textarea
              rows={4}
              value={formData.about}
              onChange={(e) => handleChange('about', e.target.value)}
              placeholder="Paste your LinkedIn About section here..."
              className={`form-textarea ${errors.about ? 'input-error' : ''}`}
            />
            {errors.about && <div className="form-error"><XCircle size={14} /> {errors.about}</div>}
            <div className="field-hint">Tip: The first 3 lines before the 'see more' cutoff are critical for hook retention.</div>
          </div>

          {/* Skills */}
          <div className="form-group">
            <label className="form-label">
              Skills (comma-separated) <span className="field-required">*</span>
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, Distributed Systems, AWS, Docker"
              className={`form-input ${errors.skills ? 'input-error' : ''}`}
            />
            {errors.skills && <div className="form-error"><XCircle size={14} /> {errors.skills}</div>}
            <div className="field-hint">List your top hard and soft skills to test against recruiter keyword radar.</div>
          </div>

          {/* Experience */}
          <div className="form-group">
            <label className="form-label">
              Experience &amp; Achievements <span className="field-required">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              placeholder="Paste your job titles, key responsibilities, and quantifiable achievements..."
              className={`form-textarea ${errors.experience ? 'input-error' : ''}`}
            />
            {errors.experience && <div className="form-error"><XCircle size={14} /> {errors.experience}</div>}
            <div className="field-hint">Include measurable outcomes like percentage gains, revenue numbers, or scale.</div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions-bar">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="btn btn-primary btn-lg"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Evaluating Profile...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Analyze Profile</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGenerateImproved}
              disabled={isGeneratingImproved}
              className="btn btn-ai btn-lg"
            >
              {isGeneratingImproved ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Synthesizing Recommendations...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Improved Headline &amp; About</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div id="analysis-results-section" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          {/* Top Score Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="stat-label">Overall Profile Score</span>
              <div style={{ position: 'relative', margin: '8px 0' }}>
                <span
                  style={{
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    color:
                      analysisResult.overallScore >= 80
                        ? '#057642'
                        : analysisResult.overallScore >= 60
                        ? '#b25e02'
                        : '#cc1016'
                  }}
                >
                  {analysisResult.overallScore}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
              </div>
              <span
                className={`badge ${
                  analysisResult.overallScore >= 80
                    ? 'badge-success'
                    : analysisResult.overallScore >= 60
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
              >
                {analysisResult.overallScore >= 80
                  ? '⭐ All-Star Profile'
                  : analysisResult.overallScore >= 60
                  ? '⚡ Intermediate Strength'
                  : '⚠️ Needs Immediate Polish'}
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Headline Strength</span>
                <span className="badge badge-linkedin">{analysisResult.headlineScore}%</span>
              </div>
              <div className="stat-value">{analysisResult.headlineScore} / 100</div>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${analysisResult.headlineScore}%` }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target role alignment and hook clarity
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">About Hook Readability</span>
                <span className="badge badge-warning">{analysisResult.aboutScore}%</span>
              </div>
              <div className="stat-value">{analysisResult.aboutScore} / 100</div>
              <div className="progress-container">
                <div
                  className="progress-fill"
                  style={{
                    width: `${analysisResult.aboutScore}%`,
                    background: analysisResult.aboutScore >= 75 ? 'var(--success)' : 'var(--warning)'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Opening interest &amp; Call-to-Action
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Experience Metrics</span>
                <span className="badge badge-success">{analysisResult.expScore}%</span>
              </div>
              <div className="stat-value">{analysisResult.expScore} / 100</div>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${analysisResult.expScore}%` }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Measurable outcomes &amp; action verbs
              </span>
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="dashboard-grid-2">
            {/* Strengths */}
            <div className="card">
              <div className="card-title-row">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#057642' }}>
                  <CheckCircle2 size={18} />
                  Profile Strengths ({analysisResult.strengths.length})
                </h3>
                <span className="badge badge-success">Optimized</span>
              </div>

              <div className="strengths-list">
                {analysisResult.strengths.map((str, idx) => (
                  <div key={idx} className="analysis-bullet-item" style={{ borderLeft: '3px solid #057642' }}>
                    <Check size={16} className="bullet-icon" color="#057642" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="card">
              <div className="card-title-row">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cc1016' }}>
                  <AlertCircle size={18} />
                  Identified Weaknesses ({analysisResult.weaknesses.length})
                </h3>
                <span className="badge badge-danger">Attention Needed</span>
              </div>

              <div className="weaknesses-list">
                {analysisResult.weaknesses.map((weak, idx) => (
                  <div key={idx} className="analysis-bullet-item" style={{ borderLeft: '3px solid #cc1016' }}>
                    <XCircle size={16} className="bullet-icon" color="#cc1016" />
                    <span>{weak}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Keywords Radar */}
          <div className="card">
            <div className="card-title-row">
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={18} color="#0a66c2" />
                  Missing High-Demand Keywords for "{formData.targetRole}"
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Recruiters search using these specific terms. Adding them into your Skills or Experience can boost inbound search visibility by ~35%.
                </p>
              </div>
              <span className="badge badge-ai">SEO Boost</span>
            </div>

            {analysisResult.missingKeywords.length > 0 ? (
              <div className="chips-row">
                {analysisResult.missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="chip"
                    style={{ backgroundColor: '#e8f3ff', borderColor: '#bfdbfe', color: '#0a66c2', fontWeight: 600 }}
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: '#057642', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 Great job! All primary high-demand keywords for this role category were detected.
              </div>
            )}
          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="card">
            <div className="card-title-row">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="#0a66c2" />
                Actionable Improvement Suggestions
              </h3>
              <span className="badge badge-linkedin">Step-by-Step Guide</span>
            </div>

            <div className="suggestions-list">
              {analysisResult.suggestions.map((sug, idx) => (
                <div key={idx} className="analysis-bullet-item" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                  <span
                    style={{
                      background: 'var(--linkedin-light)',
                      color: 'var(--linkedin-blue)',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ color: '#191919', fontWeight: 500 }}>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generated Improved Headline & About Section */}
      {improvedOutput && (
        <div id="generated-section" className="card" style={{ border: '2px solid #6366f1', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)' }}>
          <div className="card-title-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-ai">
                  <Sparkles size={12} /> AI Optimized Output
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on your target role &amp; skills</span>
              </div>
              <h3 className="card-title" style={{ marginTop: 4 }}>
                Generated Headline &amp; About Section
              </h3>
            </div>

            <button
              onClick={handleApplyToForm}
              className="btn btn-ai btn-sm"
              title="Apply these generated sections directly to the form above"
            >
              <Check size={14} />
              <span>Apply to Form &amp; Re-analyze</span>
            </button>
          </div>

          {/* Improved Headline */}
          <div className="generated-box">
            <div className="generated-box-header">
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--linkedin-blue)' }}>
                ✨ High-Conversion LinkedIn Headline
              </span>
              <button
                onClick={() => handleCopy('improvedHeadline', improvedOutput.headline)}
                className="btn btn-outline btn-sm"
              >
                {copiedKey === 'improvedHeadline' ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                <span>{copiedKey === 'improvedHeadline' ? 'Copied!' : 'Copy Headline'}</span>
              </button>
            </div>
            <div className="generated-content-text" style={{ fontWeight: 600 }}>
              {improvedOutput.headline}
            </div>
          </div>

          {/* Improved About Section */}
          <div className="generated-box">
            <div className="generated-box-header">
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--linkedin-blue)' }}>
                ✨ High-Impact LinkedIn About Section
              </span>
              <button
                onClick={() => handleCopy('improvedAbout', improvedOutput.about)}
                className="btn btn-outline btn-sm"
              >
                {copiedKey === 'improvedAbout' ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                <span>{copiedKey === 'improvedAbout' ? 'Copied!' : 'Copy About'}</span>
              </button>
            </div>
            <div className="generated-content-text">
              {improvedOutput.about}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
