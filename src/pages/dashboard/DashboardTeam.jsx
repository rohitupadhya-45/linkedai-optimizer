import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Copy,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Lightbulb,
  MessageSquare,
  Bookmark,
  Share2
} from 'lucide-react';
import { savePost } from '../../utils/postStorage';

export default function DashboardTeam() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState(null);

  const categories = ['All', 'Career & Leadership', 'Lessons Learned', 'Contrarian / Hot Take', 'Framework & How-To', 'Storytelling'];

  const templates = [
    {
      id: 'tpl-1',
      title: 'The Unpopular Opinion / Contrarian Take',
      category: 'Contrarian / Hot Take',
      tone: 'Contrarian / Punchy',
      icon: TrendingUp,
      preview: 'Unpopular opinion: [COMMONLY HELD BELIEF] is actually holding you back.',
      content: `Unpopular opinion: [COMMONLY HELD BELIEF] is actually holding you back.

Most people think:
→ [CONVENTIONAL WISDOM 1]
→ [CONVENTIONAL WISDOM 2]

Here is what I've seen working with [TARGET AUDIENCE / INDUSTRY]:

1. [COUNTER-INTUITIVE TRUTH 1]
2. [COUNTER-INTUITIVE TRUTH 2]
3. [COUNTER-INTUITIVE TRUTH 3]

The lesson? Stop optimizing for [OLD METRIC] and start focusing on [NEW LEVERAGE POINT].

Do you agree, or am I missing something? Let's discuss in the comments. 👇

#Leadership #Strategy #ProfessionalGrowth #TechTrends`
    },
    {
      id: 'tpl-2',
      title: '5 Lessons Learned from Failure',
      category: 'Lessons Learned',
      tone: 'Storytelling',
      icon: Lightbulb,
      preview: '[X] years ago, I made a mistake that cost [METRIC / TIME / REVENUE].',
      content: `[X] years ago, I made a critical mistake with [PROJECT / DECISION].

At the time, it felt like a total disaster.
Looking back, it was the best thing that ever happened to my career.

Here are 5 lessons I will never forget:

1. [LESSON 1] - Explain why this matters in 1 sentence.
2. [LESSON 2] - Explain the practical takeaway.
3. [LESSON 3] - Share what you changed as a result.
4. [LESSON 4] - How this shaped your standard today.
5. [LESSON 5] - Why simplicity always wins.

Failure is simply feedback in disguise.

What's a career mistake that taught you the most? #CareerLessons #GrowthMindset #Resilience #Leadership`
    },
    {
      id: 'tpl-3',
      title: 'Step-by-Step Tactical Framework',
      category: 'Framework & How-To',
      tone: 'Educational How-To',
      icon: Award,
      preview: 'How to [ACHIEVE SPECIFIC GOAL] in [TIMEFRAME] (without [COMMON PAIN POINT]):',
      content: `How to [ACHIEVE SPECIFIC GOAL] in [TIMEFRAME] (without [COMMON PAIN POINT]):

I spent [X MONTHS / YEARS] figuring this out. Here is the exact framework:

Phase 1: Foundation
• Step 1: [ACTIONABLE STEP]
• Step 2: [ACTIONABLE STEP]

Phase 2: Execution
• Step 3: [ACTIONABLE STEP]
• Step 4: [ACTIONABLE STEP]

Phase 3: Scale
• Step 5: [ACTIONABLE STEP]

Bookmark this for your next [PROJECT / PLANNING CYCLE]. 📌

What step would you add? #Productivity #Framework #ActionableAdvice #IndustryInsights`
    },
    {
      id: 'tpl-4',
      title: 'Career Milestone & Gratitude',
      category: 'Career & Leadership',
      tone: 'Celebratory',
      icon: Sparkles,
      preview: 'Today marks [MILESTONE / YEAR] at [COMPANY / VENTURE].',
      content: `Today marks [X] years since I started [ROLE / PROJECT / VENTURE].

When I began:
- I had no idea how to [SKILL]
- I was nervous about [CHALLENGE]
- Everything felt overwhelming

Today:
- We delivered [ACHIEVEMENT 1]
- Mentored [NUMBER] engineers and leaders
- Built [KEY ASSET / OUTCOME]

The biggest thank you to [MENTOR / TEAM / SUPPORTERS] who believed in me early on.

To anyone just starting out: the compound effect of small daily habits is real. Keep going. 🚀

#Milestone #Gratitude #CareerJourney #WorkAnniversary`
    },
    {
      id: 'tpl-5',
      title: 'Behind the Scenes Story',
      category: 'Storytelling',
      tone: 'Storytelling',
      icon: MessageSquare,
      preview: 'Here is what really happened behind closed doors when [EVENT] occurred.',
      content: `Here is what really happened when [SITUATION / CRISIS OCCURRED]:

It was [TIME / DAY]. Our [SYSTEM / TEAM / METRIC] was at risk.

Most people saw the final announcement.
Nobody saw the [HOURS / SPRINT / CHAOS] behind the curtain.

Here is what we did in real-time:
1. Stayed calm and triaged [PRIORITY 1]
2. Communicated transparently with all stakeholders
3. Empowered the frontline team to make rapid calls

The outcome? [POSITIVE RESULT].

Transparent communication under pressure is the ultimate superpower.

Have you ever faced a similar crisis? How did your team react? #BehindTheScenes #CrisisManagement #AuthenticLeadership`
    },
    {
      id: 'tpl-6',
      title: 'The High-Leverage Tool / Resource Stack',
      category: 'Framework & How-To',
      tone: 'Educational How-To',
      icon: Bookmark,
      preview: 'The [NUMBER] tools that save me [HOURS] every week in [YEAR]:',
      content: `The [X] tools and habits that save me [10+ hours] every single week:

1. [TOOL / HABIT 1] - For deep work and asynchronous focus.
2. [TOOL / HABIT 2] - For automated code/system reviews.
3. [TOOL / HABIT 3] - For cross-functional documentation.
4. [TOOL / HABIT 4] - For tracking personal architecture notes.

Tools don't solve broken workflows, but the right stack removes friction.

What is your single highest-ROI tool right now? 👇

#TechStack #Productivity #DeveloperExperience #EngineeringLeadership`
    }
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setNotice(`Template copied to clipboard! You can paste it into the Generator.`);
    setTimeout(() => setCopiedId(null), 2500);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUseInGenerator = (tpl) => {
    // Save as draft and redirect
    savePost({
      title: tpl.title,
      content: tpl.content,
      category: tpl.category,
      tone: tpl.tone,
      format: 'Hook + Value + CTA',
      status: 'Draft'
    });
    navigate('/dashboard/generator');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Templates &amp; Formulas</h1>
          <p className="page-subtitle">
            Battle-tested LinkedIn post structures with high hook retention and comment engagement.
          </p>
        </div>
      </div>

      {notice && (
        <div 
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.875rem'
          }}
        >
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-box" style={{ flex: '1 1 280px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search templates by keyword or hook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="chips-row" style={{ margin: 0 }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {filteredTemplates.map(tpl => {
          const Icon = tpl.icon;
          return (
            <div key={tpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: 8, background: 'rgba(10, 102, 194, 0.1)', borderRadius: 8, color: '#0a66c2' }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {tpl.title}
                      </h3>
                      <span className="badge badge-linkedin" style={{ marginTop: 4 }}>
                        {tpl.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  style={{
                    background: '#f8fafc',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    color: '#475569',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 180,
                    overflowY: 'auto',
                    marginBottom: 16
                  }}
                >
                  {tpl.content}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => handleCopy(tpl.id, tpl.content)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {copiedId === tpl.id ? <Check size={14} color="#057642" /> : <Copy size={14} />}
                  <span>{copiedId === tpl.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUseInGenerator(tpl)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span>Open in Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
