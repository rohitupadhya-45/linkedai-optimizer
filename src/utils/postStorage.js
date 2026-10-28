/**
 * LocalStorage utility for managing LinkedIn posts and drafts.
 * Persists data across browser refreshes with zero API dependencies.
 */

const STORAGE_KEY = 'linkedai_posts';

const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: '5 Architecture Lessons for High-Scale Applications',
    content: `Most software engineers obsess over the latest database or shiny framework.\n\nHere is what actually matters when building systems for scale:\n\n1. Network latency > Code micro-optimizations. A slow cross-region query will impact response times faster than unoptimized loops.\n2. Caching requires deliberate strategy. Without deterministic cache keys and TTL jitter, thundering herds can overload replicas.\n3. Observability is essential. Without distributed trace IDs, debugging asynchronous microservices becomes guesswork.\n\nSimplicity and clear service boundaries always outperform accidental complexity.\n\nWhat has been your most valuable scaling lesson? #SoftwareEngineering #SystemDesign #TechLeadership #CloudArchitecture`,
    category: 'System Design',
    tone: 'Thought Leadership',
    format: 'Numbered Listicle',
    status: 'Saved',
    createdAt: 'Oct 25, 2026, 09:30 AM',
    charCount: 685,
    wordCount: 94
  },
  {
    id: 'post-2',
    title: 'Why Technical Leads Focus on Clarity Over Code Volume',
    content: `Early in your engineering career, progress is often measured by how much code you ship.\n\nAs you advance to technical leadership, the highest leverage is preventing unnecessary code from being written.\n\n• The fastest code in production is the code you never have to execute.\n• The highest ROI decisions happen in design reviews, not pull requests.\n• Aligning on system requirements eliminates weeks of wasted rework.\n\nReal leadership is creating clarity so the entire team can move fast with confidence. #EngineeringManagement #TechLeadership #CareerGrowth #SoftwareDevelopment`,
    category: 'Career Growth',
    tone: 'Thought Leadership',
    format: 'Hook + Value + CTA',
    status: 'Ready to Post',
    createdAt: 'Oct 26, 2026, 10:15 AM',
    charCount: 564,
    wordCount: 82
  },
  {
    id: 'post-3',
    title: 'Draft: Thoughts on Developer Tooling & Automation in 2026',
    content: `Unpopular opinion: Adding more developer tools rarely solves a workflow problem.\n\nBefore introducing another tool to your pipeline:\n1. Audit where developers are actually blocked.\n2. Measure build and feedback loop times.\n3. Remove redundant processes before automating them.\n\nSimpler stacks with tighter feedback loops consistently win. #DeveloperProductivity #DevOps #EngineeringExcellence #TechCulture`,
    category: 'Tech Trends',
    tone: 'Contrarian / Punchy',
    format: 'Hook + Value + CTA',
    status: 'Draft',
    createdAt: 'Oct 26, 2026, 02:40 PM',
    charCount: 422,
    wordCount: 57
  }
];

export const getPosts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading posts from localStorage:', err);
    return INITIAL_POSTS;
  }
};

/**
 * Saves or updates a post in localStorage.
 * Prevents empty posts and accidental duplicates.
 */
export const savePost = (post) => {
  try {
    if (!post || !post.content || !post.content.trim()) {
      return {
        success: false,
        error: 'EMPTY_POST',
        message: 'Cannot save an empty post. Please generate or enter post content first.'
      };
    }

    const cleanContent = post.content.trim();
    const posts = getPosts();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check for duplicate by ID or identical content
    const existingIndex = posts.findIndex(
      (p) =>
        (post.id && p.id === post.id) ||
        (p.content && p.content.trim() === cleanContent)
    );

    let updatedPosts;
    let savedEntry;
    let isDuplicate = false;

    if (existingIndex >= 0) {
      // Existing post found with same content or ID -> update in place
      const existing = posts[existingIndex];
      savedEntry = {
        ...existing,
        ...post,
        id: existing.id,
        content: cleanContent,
        updatedAt: formattedDate,
        charCount: cleanContent.length,
        wordCount: cleanContent.split(/\s+/).filter(Boolean).length
      };

      updatedPosts = [...posts];
      updatedPosts[existingIndex] = savedEntry;
      isDuplicate = true;
    } else {
      // Brand new post -> prepend to top of list
      savedEntry = {
        id: post.id || `post-${Date.now()}`,
        title: (post.title && post.title.trim()) || 'Untitled Post',
        content: cleanContent,
        category: post.category || 'General',
        tone: post.tone || 'Thought Leadership',
        format: post.format || 'Hook + Value + CTA',
        status: post.status || 'Ready to Post',
        createdAt: post.createdAt || formattedDate,
        charCount: cleanContent.length,
        wordCount: cleanContent.split(/\s+/).filter(Boolean).length
      };

      updatedPosts = [savedEntry, ...posts];
      isDuplicate = false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));

    // Dispatch reactive events for instant cross-component synchronization
    window.dispatchEvent(new Event('linkedai_posts_updated'));

    return {
      ...savedEntry,
      success: true,
      isDuplicate,
      post: savedEntry,
      message: isDuplicate
        ? 'Post is already in your History. Existing entry was updated.'
        : 'Post successfully saved to Post History!'
    };
  } catch (err) {
    console.error('Error saving post to localStorage:', err);
    return {
      success: false,
      error: 'STORAGE_ERROR',
      message: 'Failed to save post to localStorage: ' + (err.message || err)
    };
  }
};

export const deletePost = (id) => {
  try {
    const posts = getPosts();
    const updated = posts.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('linkedai_posts_updated'));
    return updated;
  } catch (err) {
    console.error('Error deleting post from localStorage:', err);
    return [];
  }
};

export const updatePostStatus = (id, newStatus) => {
  try {
    const posts = getPosts();
    const updated = posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('linkedai_posts_updated'));
    return updated;
  } catch (err) {
    console.error('Error updating status in localStorage:', err);
    return [];
  }
};
