# 🚀 LinkedAI Optimizer — AI-Powered LinkedIn Creator Studio

A full-featured personal branding and content studio built with React 19, Vite 8, Express 5, and OpenRouter AI.

---

## 🌟 Features

### 1. ✍️ AI Post Generator & Studio
- **Multi-Model Support:** OpenAI GPT-4o Mini, Google Gemini 2.0 Flash, Anthropic Claude 3.5 Haiku, Meta Llama 3.3 70B.
- **Tone & Layout Customization:** Choose from Thought Leadership, Storytelling, Contrarian, or Educational formats.
- **Offline Template Engine:** Works seamlessly even without an API key using deterministic templates.

### 2. 📸 Image Upload → AI Vision Post Generation
- Drag-and-drop or upload any image (screenshot, chart, infographic).
- OpenRouter Vision AI analyzes the visual elements and drafts a viral LinkedIn post.
- Inline preview of the image directly inside the LinkedIn feed card mockup.

### 3. 🎯 A/B Hook Tester
- Generate 4 alternative scroll-stopping hooks with 1 click.
- Swap hooks into your post instantly before publishing.

### 4. 🗂️ Content Templates & Formulas
- 12+ pre-formatted frameworks (Lessons Learned, Contrarian Take, Tactical Guide, Milestones).
- 1-click copy or open directly into the Generator studio.

### 5. 📊 Real Local Analytics
- Real statistics calculated from your stored library: words written, reading time, pipeline readiness, and tone breakdown.
- Zero tracking or external databases — all metrics are derived live from your browser's LocalStorage.

### 6. 🔗 LinkedIn OAuth 2.0 & 1-Click Publishing
- Connect your real LinkedIn profile with OpenID connect.
- Publish posts directly from the app to your LinkedIn feed via LinkedIn's UGC Posts API.

### 7. 💾 Local-First Data Management
- Export your entire content library as **CSV** or **JSON** backup.
- Duplicate detection prevents saving duplicate posts into history.

### 8. 🌙 Dark Mode & Preferences
- Toggle between Light and Dark mode.
- Customize default tones, models, emojis, and hashtags in Settings.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, React Router v7, Lucide React
- **Backend:** Node.js, Express 5, Multer (file uploads)
- **AI Engine:** OpenRouter AI / OpenAI Vision API
- **Social Integration:** LinkedIn OAuth 2.0 + UGC Posts REST API

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=openai/gpt-4o-mini
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/auth/linkedin/callback
```

### 3. Run the Development Servers
Open two terminal windows:

```bash
# Terminal 1: Backend Express Server
npm run server

# Terminal 2: Frontend Vite Server
npm run dev
```

Visit http://localhost:5173 for local development.

Production (Render): https://linkedai-optimizer.onrender.com

---

## 📦 Production Build
```bash
npm run build
```
Creates production-ready bundles in the `dist/` directory. Express automatically serves `dist/` when running in production mode.

## ☁️ Deploy
This app is a **Vite frontend + long-running Express API** (file uploads, LinkedIn OAuth session). Deploy it on **Render** using `render.yaml` (`npm run build` then `npm start`). Do not use Vercel for the API — `vercel.json` is not a supported production target for this Express process.
