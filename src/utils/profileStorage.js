/**
 * LocalStorage utility for managing User Profile data.
 * Keeps profile information persisted across browser refreshes.
 */

const PROFILE_KEY = 'linkedai_user_profile';

const DEFAULT_PROFILE = {
  fullName: 'Rohit Sharma',
  headline: 'Senior Tech Lead | Cloud Architecture & Scalable Systems',
  about: 'Building resilient, cloud-scale distributed architectures. Passionate about software craftsmanship, high-leverage engineering culture, and mentoring the next generation of engineers.',
  experience: 'Senior Tech Lead at CloudScale Systems (2022 - Present)\n• Architected low-latency microservices pipeline handling 50k+ req/sec with 99.99% availability.\n• Reduced cloud infrastructure costs by 32% through container rightsizing and Redis caching.\n• Mentored 8 engineers across full-stack and backend disciplines.',
  education: 'B.Tech in Computer Science & Engineering\nInstitute of Engineering & Technology (2014 - 2018)',
  skills: 'Cloud Architecture, System Design, React, Node.js, Express, TypeScript, Docker, Kubernetes, AWS',
  linkedinUrl: 'https://www.linkedin.com/in/rohit-sharma-tech',
  photoUrl: ''
};

export const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (err) {
    console.error('Error reading profile from localStorage:', err);
    return DEFAULT_PROFILE;
  }
};

export const saveStoredProfile = (updatedProfile) => {
  try {
    const current = getStoredProfile();
    const merged = { ...current, ...updatedProfile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('linkedai_user_profile_updated'));
    return { success: true, profile: merged };
  } catch (err) {
    console.error('Error saving profile to localStorage:', err);
    return { success: false, error: err.message };
  }
};
