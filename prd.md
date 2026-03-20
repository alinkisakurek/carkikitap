# ÇarkıKitap - Product Requirements Document 
**Version:** 1.0 | **MVP Scope:** 4–5 Days 
**Date:** March 2026 

An AI-powered, gamified social decision tool that eliminates the monthly "which book?" struggle for book clubs — transforming a chore into a delightful group ritual[cite: 6, 7].

## 1. Product Overview 

### 1.1 Problem Statement
* Book clubs around the world share a universal pain point: deciding which book to read next.
* Group chats fill with conflicting opinions, meetings get derailed by debate, and members disengage before the discussion even starts[cite: 11].
* The selection process itself — which should be exciting — becomes a chore.

### 1.2 Solution 
* ÇarkıKitap is an interactive, AI-powered social decision app that transforms book selection into a shared, gamified experience.
* Members join a virtual Club Room, apply smart filters to narrow down preferences, and let an AI curate a shortlist of 5–6 titles.
* Those titles are placed onto a physical-feeling spinning wheel. One spin decides the next read — together, in real time.

### 1.3 Target Users 
* Casual book clubs (3–12 members) that meet monthly.
* Friends who read together without a formal structure.
* Online reading communities on Discord / WhatsApp.
* Libraries or educators running student book circles.

### 1.4 Success Metrics (MVP) 
| Metric | Target |
| :--- | :--- |
| Club Rooms created in first week | 50+  |
| Average members per room | 4–8  |
| Wheel spin completion rate | > 85 %  |
| User return rate (second spin) | > 60 %  |
| Time from room creation to spin | < 5 minutes  |

---

## 2. Feature Specifications 

### 2.1 Club Rooms 
**Description:** A Club Room is a lightweight, ephemeral session space that any user can create. It serves as the shared canvas for all subsequent steps.

**User Stories:** 
* As a host, I can create a Club Room with a custom name so I can identify it in my history[cite: 30].
* As a host, I can share an invite link so members can join without registration.
* As a member, I can join a room via a link so I can participate immediately.
* As a member, I can see a live participant list so I know who is in the room.

**Acceptance Criteria:** 
* Room creation takes < 10 seconds from landing page.
* Invite link is copyable with a single tap/click.
* Room persists for 24 hours after last activity, then archives.
* Maximum 20 members per room (MVP limit).

### 2.2 Smart Filtering 
**Description:** Rather than a free-text genre search, members collaboratively set structured filters that are later passed to the AI. This dramatically improves relevance.

**Filter Dimensions:** 
| Filter | Type | Options / Range |
| :--- | :--- | :--- |
| Genre | Multi-select | Fiction, Sci-Fi, Mystery, Non-Fiction, Fantasy, Historical, Romance, Horror, Thriller, Biography, Self-Help, Graphic Novel  |
| Page count | Range slider | Under 200 / 200–350 / 350–500 / 500+ pages |
| Reading pace | Single-select | Light read, Moderate, Dense / Challenging  |
| Publication year | Range | Pre-1950 / 1950–2000 / 2000–2015 / Last 5 years / Any |
| Original language | Multi-select | Originally English, Translated, Either  |
| Mood / Tone | Multi-select | Uplifting, Dark, Humorous, Thought-provoking, Adventurous, Romantic  |
| Discussion potential | Toggle | High (controversial / complex) / Low (light entertainment)  |

**Acceptance Criteria:** 
* Filter UI is completable in under 60 seconds.
* All filters have sensible defaults (any/all) so the room can skip them.
* Filter state is synced across all room members in real time.
* The compiled filter payload is visible to the host before AI submission.

### 2.3 AI-Powered Book Pool 
**Description:** Instead of raw search results, the app sends the filter payload to an LLM (Claude via Anthropic API / Gemini / OpenAI). The model returns a curated list of 5–6 books optimally suited for group discussion given the constraints.

**AI Prompt Strategy:** 
The system prompt instructs the model to act as an expert literary curator. It must return structured JSON with fields: `title`, `author`, `year`, `page_count`, `cover_isbn`, `hook_sentence`, and `why_this_group_would_love_it`.

**Example structured prompt (sent by the backend):** 
```json
System: You are a literary curator for book clubs. Return ONLY valid JSON.
User: Suggest 5-6 books matching these criteria: {
  "genres": ["Sci-Fi","Fiction"],
  "max_pages": 350,
  "published_after": 2019,
  "mood": ["Thought-provoking","Dark"],
  "discussion_potential": "high"
}
Return JSON array: [{title, author, year, page_count, isbn, hook, why_club}]

http://googleusercontent.com/immersive_entry_chip/0
http://googleusercontent.com/immersive_entry_chip/1
http://googleusercontent.com/immersive_entry_chip/2
http://googleusercontent.com/immersive_entry_chip/3

