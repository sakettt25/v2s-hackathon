# 🦸‍♂️ Community Hero (ResoluCity): Hyperlocal Problem Solver

<div align="center">
  <img src="public/logo.png" alt="Community Hero Logo" width="200" height="200" style="border-radius: 20px;" />
  <br />
  <p><b>AI-Powered Civic Reporting & Predictive Analytics Platform</b></p>
  <p><i>Empowering citizens to build smarter, safer, and cleaner cities.</i></p>
</div>

---

## 🌟 The Problem
The core challenge is straightforward but deeply impactful: civic infrastructure reporting in Indian cities is broken. Citizens encounter potholes, busted streetlights, water leaks, and garbage pileups daily, but the process of actually getting these things fixed is painfully fragmented. 

There is no single place to report, no way to know if someone else has already raised the same issue, and absolutely no visibility into whether authorities are doing anything about it. We set out to fix this end to end - not with another complaint box, but with a genuinely intelligent system that can observe, verify, escalate, and resolve civic problems with minimal manual overhead.

## 💡 The Solution Overview
**ResoluCity** is a full-stack civic platform where the AI is not just a chatbot sitting in the corner - it is deeply woven into every step of the issue lifecycle. 

Here is how it works in practice: A citizen spots a broken streetlight. They open our app, snap a photo, and that is it. Our backend sends the image to Gemini, which reads it, figures out the category (broken streetlight), writes a proper title and description, and assigns a severity score. Before submission, the system runs an AI duplicate check against all nearby open issues. 

Once submitted, the issue enters a community verification pipeline. Other citizens in the area see it in a swipe-based interface (think Tinder, but for civic duty) where they swipe right to confirm or left to dispute, earning Hero Points for their participation.

For issues that go stale, a cron-based autonomous agent scans the database, calculates a "community pressure score," and uses Gemini to decide which issues to auto-escalate. On the official side, authorities get a full Command Center with a live predictive heatmap, AI-generated environmental risk predictions, and the ability to generate detailed step-by-step resolution plans. 

---

## 🚀 Key Features

1. **AI-Powered Image and Video Reporting**: Uses Gemini 2.5 Flash for multimodal analysis to extract suggested titles, descriptions, categories, and severity scores directly from photos and videos.
2. **AI Duplicate Detection**: Semantically compares new reports against existing open issues to prevent database bloat, showing confidence levels and links to existing reports.
3. **Geo-Location and Interactive Mapping**: Every issue is pinned to exact GPS coordinates using Google Maps with Advanced Markers.
4. **Community Verification via Swipe Interface**: A "Quick Verify" page presenting open issues as swipeable cards to crowdsource validation.
5. **Auto-Escalation Threshold**: Collects community verifications to automatically flag issues for authority attention.
6. **Autonomous AI Escalation Engine**: A cron-triggered autonomous agent that evaluates stale issues and escalates them based on a calculated community pressure score, entirely without human intervention.
7. **AI Escalation Dashboard**: Allows officials to manually trigger AI scans for stale issues to get detailed urgency classifications and recommended actions.
8. **Predictive AI Command Center**: A live Google Maps severity-weighted heatmap displaying issue density, alongside AI-generated environmental risk assessments.
9. **AI Resolution Plan Generator**: Invokes Gemini to create a structured, step-by-step resolution plan including departments, estimated costs, timelines, and required resources.
10. **Formal Complaint PDF Generator**: Uses Gemini Pro to draft formal complaint texts, renders them as PDFs using React-PDF, and uploads them to Supabase Storage.
11. **AI Privacy Filter**: Detects faces and license plates in images and applies targeted blur patches using Sharp before uploading to storage.
12. **AI Civic Impact Simulator**: Projects real-world impact metrics (safety, environmental, economic, health) if all open issues were resolved.
13. **Impact Analytics Dashboard**: Interactive charts (Recharts) displaying platform-wide KPIs and 7-day predictive risk forecasts.
14. **Gamification with Tier System and Achievements**: Leaderboard with Bronze-Diamond tiers, badges, and transparent point accumulation systems.
15. **Rewards Redemption Marketplace**: Spend Hero Points on real-world rewards (e.g., transit passes, coffee) using securely managed server-side points tracking.
16. **Dispute Resolution Mechanism**: Accountability loop allowing citizens to dispute prematurely closed issues.
17. **Offline Awareness**: Monitors network connectivity and gracefully handles offline drafting.
18. **Real-Time Issue Tracking**: Full lifecycle tracking of issues from open to resolved.

---

## 🛠️ Technologies Used
*   **Framework**: Next.js 15 with App Router and React Server Components
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Component Library**: Radix UI via shadcn/ui
*   **Animation**: Framer Motion
*   **Database and Auth**: Supabase (PostgreSQL with Row Level Security)
*   **Backend Logic**: Next.js Server Actions and API Routes
*   **Charts**: Recharts
*   **PDF Generation**: React-PDF (@react-pdf/renderer)
*   **Image Processing**: Sharp (server side)
*   **QR Code Generation**: qrcode.react

---

## 🌐 Google Technologies Utilized

### Google Gemini API
The Gemini API is the backbone of every intelligent feature in the platform:
*   **Gemini 2.5 Flash**: Multimodal image/video analysis, AI categorization, structured JSON schema output, duplicate detection via semantic comparison, autonomous escalation decision making, environmental risk predictions, resolution plan generation, privacy-aware PII detection, and civic impact simulation.
*   **Gemini 1.5 Pro**: Formal complaint letter generation for official municipal correspondence.
*   **Text Embedding 004**: Generating text embeddings for semantic similarity comparison in the deduplication pipeline. 

### Google AI Studio
Prompts and model configurations were designed and iterated using Google AI Studio before being integrated into the production codebase.

### Google Maps JavaScript API (@vis.gl/react-google-maps)
*   **AdvancedMarker** with custom Pin components for precise issue location marking.
*   **Interactive map** with camera change listeners.
*   **Google Maps Visualization library (HeatmapLayer)** for the Command Center's severity-weighted predictive heatmap.

### Google Cloud Platform
The application is built for deployment on Google Cloud, handling secure environment variable management and providing the infrastructure for the cron-based autonomous escalation engine.

### Google DeepMind Antigravity
Used as a development tool throughout the build phase for implementing complex agentic workflows, debugging server action logic, and iterating on the platform architecture.

---

## 🏃 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/sakettt25/v2s-hackathon.git
cd "Community Hero"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file and add your keys (Supabase, Google Maps, Gemini).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---
*Built with ❤️ for the V2S Hackathon*
