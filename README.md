<div align="center">
  <h1>🎡 ÇarkıKitap (LitRoulette)</h1>
  <p><strong>An AI-powered, gamified social decision tool that eliminates the monthly "which book?" struggle for book clubs.</strong></p>

  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />

  <br />
  <br />


</div>

---

## 💡 The Vision
Book clubs worldwide share a universal friction point: **decision fatigue**. Selecting the next read often turns into a chaotic debate, derailing the joy of reading together.

**ÇarkıKitap** transforms this administrative chore into a delightful, multiplayer game. By combining AI curation with real-time synchronized animations, it turns "choosing a book" into a shared ritual of suspense and discovery.


## ✨ Core Features 
* 🤖 **AI Literary Curator:** Replaces generic search bars with **Gemini 1.5**. Users collaboratively set constraints (genre, pace, mood), and the LLM returns a strictly formatted, highly targeted 6-book shortlist.
* ⚡ **Synchronized Multiplayer Spin:** Powered by **Supabase WebSockets**. When the host spins the wheel, every connected device in the room plays the exact same Framer Motion physics animation simultaneously.
* 🎭 **Blind Date Mode (Anti-Bias):** Books are hidden behind intriguing, AI-generated single-sentence "hooks." Members judge the premise, not the cover. The real identity is revealed with a confetti burst only after the wheel stops.
* 📱 **Mobile-First UX:** Engineered with a tactile, 60fps spring-physics wheel animation that feels like a premium native application.

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React Server Components (RSC) for optimized performance. |
| **Styling** | Tailwind CSS | Utility-first, responsive, and maintainable UI design. |
| **Animations** | Framer Motion | Fluid spring physics for the core wheel interaction. |
| **Backend & Realtime** | Supabase (PostgreSQL) | Ephemeral room creation, anonymous sessions, and low-latency broadcast channels. |
| **AI Integration** | Google Gemini API | Structured JSON generation for the book pool and hooks. |
| **Data Source** | Google Books API | Reliable and fast retrieval of book cover thumbnails. |
| **State Management** | Zustand | Lightweight global state for room data and animation triggers. |

