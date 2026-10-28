import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import multer from 'multer';

// Load environment variables from .env in project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI client (Supports both OpenRouter and OpenAI)
const openRouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
const rawOpenAiKey = (process.env.OPENAI_API_KEY || '').trim();

let activeApiKey = '';
let aiProvider = 'None';
let baseURL = undefined;
let defaultModel = 'gpt-4o-mini';

if (openRouterKey && !openRouterKey.includes('your_')) {
  activeApiKey = openRouterKey;
  aiProvider = 'OpenRouter';
  baseURL = 'https://openrouter.ai/api/v1';
  defaultModel = process.env.AI_MODEL || 'openai/gpt-4o-mini';
} else if (rawOpenAiKey && !rawOpenAiKey.includes('your_')) {
  activeApiKey = rawOpenAiKey;
  if (rawOpenAiKey.startsWith('sk-or-')) {
    // Automatically detect OpenRouter key format
    aiProvider = 'OpenRouter';
    baseURL = 'https://openrouter.ai/api/v1';
    defaultModel = process.env.AI_MODEL || 'openai/gpt-4o-mini';
  } else {
    aiProvider = 'OpenAI';
    baseURL = undefined; // Official OpenAI endpoint
    defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';
  }
}

const hasValidKey = Boolean(activeApiKey);

const aiClient = hasValidKey
  ? new OpenAI({
      apiKey: activeApiKey,
      ...(baseURL ? { baseURL } : {}),
      ...(aiProvider === 'OpenRouter'
        ? {
            defaultHeaders: {
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
              'X-Title': 'LinkedAI Optimizer'
            }
          }
        : {})
    })
  : null;

// LinkedIn credentials check
const hasLinkedInConfig = Boolean(
  process.env.LINKEDIN_CLIENT_ID &&
  process.env.LINKEDIN_CLIENT_SECRET
);

// Active LinkedIn Session State (persists while backend server is running)
let linkedInSession = null;

/**
 * Health / API Status check endpoint
 * Tells the frontend whether AI (OpenRouter / OpenAI) and LinkedIn are configured.
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: hasValidKey,
    provider: aiProvider,
    model: defaultModel,
    hasLinkedInConfig,
    isLinkedInConnected: Boolean(linkedInSession && linkedInSession.accessToken)
  });
});

/**
 * Generate LinkedIn Post endpoint
 * Sends prompt to OpenAI or OpenRouter with strict creator system prompt.
 */
app.post('/api/generate-post', async (req, res) => {
  try {
    const {
      topic,
      tone = 'Thought Leadership',
      format = 'Hook + Value + CTA',
      includeEmojis = true,
      includeHashtags = true,
      model
    } = req.body;

    // Validation
    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Topic is required.'
      });
    }

    // Check API Key
    if (!hasValidKey || !aiClient) {
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message: 'AI API key is missing. Add your OPENROUTER_API_KEY or OPENAI_API_KEY to the backend .env file to enable live AI generation.'
      });
    }

    // Determine target model
    let targetModel = model || defaultModel;
    if (aiProvider === 'OpenRouter' && !targetModel.includes('/')) {
      targetModel = `openai/${targetModel}`;
    }

    // Build specialized prompt
    const systemPrompt = `You are a world-class LinkedIn ghostwriter and content strategist.
Your task is to craft high-impact, authentic, and viral LinkedIn posts for industry professionals and leaders.

Formatting Rules:
1. Opening Hook: The first 1-2 lines must be an irresistible, scroll-stopping hook followed by a blank line before the "see more" link.
2. Structure: Break up thoughts into skimmable 1-2 sentence paragraphs with generous white space.
3. Tone: Embody this exact tone: "${tone}".
4. Layout: Format strictly according to this structure: "${format}".
5. Emojis: ${includeEmojis ? 'Use tasteful, modern emojis at key transitions (e.g. 💡, 🚀, 📌, 🎯, 👇).' : 'Do NOT use any emojis. Use clean bullet points (•) or numbers.'}
6. Hashtags: ${includeHashtags ? 'Conclude the post with 3 to 5 relevant, CamelCase industry hashtags on their own line.' : 'Do NOT include any hashtags.'}
7. Closing CTA: End with an engaging, authentic question that encourages comments and discussion.
8. Style: Avoid corporate clichés and robotic filler phrases (never say "In today's fast-paced world", "Delve into", "Let's unpack this"). Be direct, authoritative, and actionable.`;

    const userPrompt = `Topic to write about: "${topic.trim()}"
Tone: ${tone}
Structure: ${format}
Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}`;

    const completion = await aiClient.chat.completions.create({
      model: targetModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 850
    });

    const generatedPost = completion.choices[0]?.message?.content?.trim();

    if (!generatedPost) {
      throw new Error(`Received empty response from ${aiProvider}.`);
    }

    return res.json({
      post: generatedPost,
      source: aiProvider.toLowerCase(),
      provider: aiProvider,
      model: targetModel
    });
  } catch (error) {
    console.error(`${aiProvider} Generation Error:`, error);

    // Differentiate AI errors
    if (error.status === 401) {
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: `Your ${aiProvider} API key appears to be invalid. Please verify the key in your .env file.`
      });
    }

    if (error.status === 402) {
      return res.status(402).json({
        error: 'INSUFFICIENT_CREDITS',
        message: `Your ${aiProvider} account has insufficient credits. Please top up your balance at openrouter.ai.`
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `${aiProvider} rate limit or credit quota exceeded. Please check your account usage.`
      });
    }

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || `Failed to generate post via ${aiProvider}. You can switch to the local generator fallback.`
    });
  }
});

// ==========================================
// 📸 IMAGE ANALYSIS → LINKEDIN POST ENDPOINT
// ==========================================

// Configure multer for in-memory file handling (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP.`));
    }
  }
});

/**
 * Analyze an uploaded image and generate a LinkedIn post from it.
 * Accepts multipart/form-data with:
 *   - image (file): The image to analyze
 *   - tone (string, optional): Tone of voice
 *   - format (string, optional): Post structure
 *   - includeEmojis (string, optional): 'true' or 'false'
 *   - includeHashtags (string, optional): 'true' or 'false'
 *   - model (string, optional): AI model to use
 */
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'No image file was uploaded. Please select an image.'
      });
    }

    // Check API key
    if (!hasValidKey || !aiClient) {
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message: 'AI API key is missing. Add your OPENROUTER_API_KEY or OPENAI_API_KEY to the backend .env file to enable image analysis.'
      });
    }

    // Parse form fields
    const tone = req.body.tone || 'Thought Leadership';
    const format = req.body.format || 'Hook + Value + CTA';
    const includeEmojis = req.body.includeEmojis !== 'false';
    const includeHashtags = req.body.includeHashtags !== 'false';
    const requestedModel = req.body.model || '';

    // Pick a vision-capable model
    // OpenRouter vision-capable models: openai/gpt-4o-mini, google/gemini-2.0-flash-001, anthropic/claude-3.5-haiku
    let targetModel = requestedModel || defaultModel;
    if (aiProvider === 'OpenRouter' && !targetModel.includes('/')) {
      targetModel = `openai/${targetModel}`;
    }

    // Convert uploaded image buffer to base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    const systemPrompt = `You are a world-class LinkedIn ghostwriter and content strategist.
You will be given an image (screenshot, photo, infographic, chart, meme, event photo, etc.).
Your task:
1. Carefully analyze what the image shows — its subject, context, data, text, emotions, or story.
2. Based on your analysis, craft a high-impact, authentic, viral LinkedIn post that uses the image as a springboard for professional insight, storytelling, or commentary.

Formatting Rules:
1. Opening Hook: The first 1-2 lines must be an irresistible, scroll-stopping hook followed by a blank line.
2. Structure: Break up thoughts into skimmable 1-2 sentence paragraphs with generous white space.
3. Tone: Embody this exact tone: "${tone}".
4. Layout: Format strictly according to this structure: "${format}".
5. Emojis: ${includeEmojis ? 'Use tasteful, modern emojis at key transitions (e.g. 💡, 🚀, 📌, 🎯, 👇).' : 'Do NOT use any emojis. Use clean bullet points (•) or numbers.'}
6. Hashtags: ${includeHashtags ? 'Conclude the post with 3 to 5 relevant, CamelCase industry hashtags on their own line.' : 'Do NOT include any hashtags.'}
7. Closing CTA: End with an engaging, authentic question that encourages comments and discussion.
8. Style: Avoid corporate clichés and robotic filler phrases. Be direct, authoritative, and actionable.
9. Reference the image naturally — describe what you see and tie it to a lesson, trend, or story.`;

    const userPrompt = `Analyze the attached image and generate a compelling LinkedIn post based on what you see.
Tone: ${tone}
Structure: ${format}
Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}`;

    const completion = await aiClient.chat.completions.create({
      model: targetModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: userPrompt }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 900
    });

    const generatedPost = completion.choices[0]?.message?.content?.trim();

    if (!generatedPost) {
      throw new Error(`Received empty response from ${aiProvider} image analysis.`);
    }

    return res.json({
      post: generatedPost,
      source: 'image-analysis',
      provider: aiProvider,
      model: targetModel
    });
  } catch (error) {
    console.error(`${aiProvider} Image Analysis Error:`, error);

    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: 'Image file is too large. Maximum allowed size is 10 MB.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: `Your ${aiProvider} API key appears to be invalid. Please verify the key in your .env file.`
      });
    }

    if (error.status === 402) {
      return res.status(402).json({
        error: 'INSUFFICIENT_CREDITS',
        message: `Your ${aiProvider} account has insufficient credits. Please top up your balance.`
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `${aiProvider} rate limit exceeded. Please try again shortly.`
      });
    }

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || `Failed to analyze image via ${aiProvider}.`
    });
  }
});

// Handle multer errors as middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: 'Image file is too large. Maximum allowed size is 10 MB.'
      });
    }
    return res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: err.message
    });
  }
  if (err && err.message && err.message.includes('Unsupported image type')) {
    return res.status(400).json({
      error: 'INVALID_FILE_TYPE',
      message: err.message
    });
  }
  next(err);
});

// ==========================================
// 🔗 LINKEDIN OAUTH & PUBLISHING ENDPOINTS
// ==========================================

/**
 * Step 1: Initiate LinkedIn OAuth 2.0 flow
 */
app.get('/api/auth/linkedin', (req, res) => {
  if (!process.env.LINKEDIN_CLIENT_ID) {
    return res.status(500).send('LinkedIn Client ID is missing in .env configuration.');
  }

  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/auth/linkedin/callback';
  const state = `state_${Math.random().toString(36).substring(2, 12)}`;
  // Request OpenID user profile scopes + member social sharing scope
  const scope = 'openid profile email w_member_social';

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authUrl);
});

/**
 * Step 2: Handle OAuth 2.0 redirect callback
 */
app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    console.error('LinkedIn OAuth rejected/error:', error, error_description);
    return res.redirect(`${frontendUrl}/dashboard/generator?linkedin_error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/dashboard/generator?linkedin_error=No+authorization+code+received`);
  }

  try {
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/auth/linkedin/callback';

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error('LinkedIn Token Exchange Failed:', tokenData);
      return res.redirect(`${frontendUrl}/dashboard/generator?linkedin_error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'Token exchange failed')}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile Info via OpenID UserInfo endpoint
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    let profile = {};
    if (userinfoResponse.ok) {
      profile = await userinfoResponse.json();
    } else {
      console.warn('Could not fetch LinkedIn user info:', await userinfoResponse.text());
    }

    // Save session in memory
    linkedInSession = {
      accessToken,
      expiresAt: Date.now() + (tokenData.expires_in || 5184000) * 1000,
      user: {
        sub: profile.sub || '',
        name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn Member',
        givenName: profile.given_name || '',
        familyName: profile.family_name || '',
        email: profile.email || '',
        picture: profile.picture || ''
      }
    };

    console.log(`✅ LinkedIn authenticated for user: ${linkedInSession.user.name} (Sub ID: ${linkedInSession.user.sub})`);
    return res.redirect(`${frontendUrl}/dashboard/generator?linkedin_auth=success`);
  } catch (err) {
    console.error('LinkedIn Callback Error:', err);
    return res.redirect(`${frontendUrl}/dashboard/generator?linkedin_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * Step 3: Get current LinkedIn connection status & profile
 */
app.get('/api/linkedin/me', (req, res) => {
  if (!linkedInSession || !linkedInSession.accessToken) {
    return res.json({
      isConnected: false,
      user: null
    });
  }

  // Check expiration
  if (linkedInSession.expiresAt && Date.now() > linkedInSession.expiresAt) {
    linkedInSession = null;
    return res.json({
      isConnected: false,
      user: null,
      expired: true
    });
  }

  res.json({
    isConnected: true,
    user: linkedInSession.user
  });
});

/**
 * Step 4: Disconnect / Logout LinkedIn
 */
app.post('/api/auth/linkedin/logout', (req, res) => {
  linkedInSession = null;
  res.json({ success: true, message: 'Disconnected from LinkedIn.' });
});

/**
 * Step 5: Publish post directly to LinkedIn
 */
app.post('/api/linkedin/share', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Post text is required.'
      });
    }

    if (!linkedInSession || !linkedInSession.accessToken || !linkedInSession.user?.sub) {
      return res.status(401).json({
        error: 'NOT_AUTHENTICATED',
        message: 'LinkedIn account is not connected. Please connect your LinkedIn account first.'
      });
    }

    // Prepare UGC post payload according to LinkedIn v2 API specification
    const ugcPayload = {
      author: `urn:li:person:${linkedInSession.user.sub}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text.trim()
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedInSession.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(ugcPayload)
    });

    const shareData = await shareResponse.json();

    if (!shareResponse.ok) {
      console.error('LinkedIn Share Error:', shareData);
      return res.status(shareResponse.status || 500).json({
        error: 'LINKEDIN_SHARE_FAILED',
        message: shareData.message || 'LinkedIn rejected the post. Ensure your LinkedIn App has the "Share on LinkedIn" product approved.',
        details: shareData
      });
    }

    const postUrn = shareData.id || '';
    const postUrl = postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : 'https://www.linkedin.com/feed/';

    return res.json({
      success: true,
      postUrn,
      postUrl,
      author: linkedInSession.user.name,
      publishedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('LinkedIn Share Exception:', err);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: err.message || 'Failed to publish post to LinkedIn.'
    });
  }
});

// Serve static built frontend in production if dist directory exists
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA router in production (Express 5 safe)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Failed to send index.html from:', indexPath, err);
      res.status(404).send('Application build in progress or dist/index.html not found. Please ensure "npm run build" ran successfully.');
    }
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(` LinkedAI backend running on http://0.0.0.0:${PORT}`);
  console.log(` AI Engine:      ${aiProvider} (${hasValidKey ? 'Active ✅' : 'Missing (Local fallback active)'})`);
  if (hasValidKey) {
    console.log(` Active Model:   ${defaultModel}`);
  }
  console.log(` LinkedIn API:   ${hasLinkedInConfig ? 'Credentials Configured ✅' : 'Missing in .env'}`);
  console.log(`=================================================`);
});
