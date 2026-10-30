# SHIKSHYALAYASHAIKSHIKSANSTHA (शिक्षालय शैक्षिक संस्था)
## Official Educational Institute Website & Academic Management Platform

An educational web platform built for **SHIKSHYALAYASHAIKSHIKSANSTHA** (शिक्षालय शैक्षिक संस्था), an academic tuition and exam-preparation institute supporting higher secondary (+2) and university students in Nepal.

---

### 1. Brand Identity & Typography
- **Institute Name:** SHIKSHYALAYASHAIKSHIKSANSTHA
- **Nepali Devanagari:** शिक्षालय शैक्षिक संस्था
- **Tagline:** Quality Education, Bright Future.
- **Alternative Tagline:** Empowering Students Through Quality Education.
- **Color Palette:**
  - Primary: Deep Navy Blue (`#12315A`)
  - Secondary: Royal Blue (`#2457A7`)
  - Accent: Warm Orange / Amber (`#F59E0B`)
  - Alternate Background: Light Gray (`#F5F7FA`)
- **Typography:** Inter & Noto Sans Devanagari for Nepali Unicode support.

---

### 2. The Six Dedicated Academic Programs
1. **Master of Business Studies (MBS) – TU** (`/courses/mbs-tu`)
2. **Bachelor of Business Studies (BBS) – TU** (`/courses/bbs-tu`)
3. **BBA / BBM – TU** (`/courses/bba-bbm-tu`)
4. **+2 Science (NEB)** (`/courses/plus-two-science`)
5. **+2 Management (NEB)** (`/courses/plus-two-management`)
6. **BBA – Pokhara University** (`/courses/bba-pokhara-university`)

*Note: Pokhara University and Tribhuvan University programs are strictly separated in course structures and syllabi.*

---

### 3. Website Pages & URL Routing
- `/` — Homepage (Hero, 6 Course Cards, Why Choose benefits, Teaching Approach, Faculty, Admission CTA, Latest Notices, FAQs, Footer)
- `/about` — About Us (Vision, Mission, Core Educational Values, Philosophy, Transparency Notice)
- `/courses` — Searchable and filterable course catalog
- `/courses/mbs-tu` — MBS – TU Course Detail
- `/courses/bbs-tu` — BBS – TU Course Detail
- `/courses/bba-bbm-tu` — BBA / BBM – TU Course Detail
- `/courses/plus-two-science` — +2 Science Course Detail
- `/courses/plus-two-management` — +2 Management Course Detail
- `/courses/bba-pokhara-university` — BBA – Pokhara University Course Detail
- `/teachers` — Faculty directory with qualifications, specializations, and assigned courses
- `/online-classes` — Online, Offline & Hybrid class modes, tech requirements, join instructions, and security guidelines
- `/study-materials` — Filterable repository of lecture notes, model questions, and past TU/PU papers
- `/notices` — Public notice board with categories, priority tags, and detail reader
- `/gallery` — Categorized campus & learning photo gallery with lightbox
- `/admission` — Official student admission application and inquiry form with instant reference number generator
- `/contact` — Contact details, WhatsApp inquiry button, and direct message inbox
- `/student/login` & `/student/dashboard` — Student portal for authenticated access to registered courses, schedules, and restricted study materials
- `/admin` — Protected administrative dashboard for live statistics, inquiry tracking, course management, teacher management, notice publishing, study materials, and website settings
- `/privacy-policy` & `/terms` — Academic policies and legal terms

---

### 4. Administrator Dashboard Access
- URL: `/admin`
- Passcode: `admin123` (or direct login in dev mode)
- Features:
  - Live statistics (Courses, Faculty, Inquiries, Notices, Materials)
  - Inquiry status updates: `New`, `Contacted`, `Follow-up Required`, `Admission Confirmed`, `Closed`
  - Internal follow-up notes on student leads
  - One-click CSV export of inquiries
  - Full CRUD for Courses, Teachers, Notices, and Study Materials
  - Dynamic Website Settings for instant updates without code modifications

---

### 5. Running & Building Locally

```bash
# Install dependencies
npm install

# Run Vite development server on port 3000
npm run dev

# Compile and check TypeScript types
npm run lint

# Build production bundle
npm run build
```

---

### 6. Firebase Configuration & Deployment

1. Copy `.env.example` to `.env` and fill in your Firebase project parameters if deploying with external Cloud Firestore.
2. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Deploy frontend to Firebase Hosting or Cloud Run:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

### 7. Netlify Deployment (Step-by-Step)

The project includes `netlify.toml` and `public/_redirects` pre-configured for SPA client routing and HTTP caching headers.

#### Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `20`

#### Required Netlify Environment Variables
In **Netlify Dashboard &rarr; Site Configuration &rarr; Environment variables**:
- `VITE_SUPABASE_URL`: `https://pyjsnwazsbdaupjbaqcd.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `sb_publishable_Sb_og4V9GxxLA_yiZCVMdQ_wfydVcil`
- `NODE_VERSION`: `20`

#### Quick Deploy Options
1. **Option A (Git Connect):** Connect your GitHub/GitLab repo. Netlify reads `netlify.toml` automatically.
2. **Option B (Drag and Drop):** Run `npm run build` and drag the resulting `dist/` directory directly into [app.netlify.com/drop](https://app.netlify.com/drop).

