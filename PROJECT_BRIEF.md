# Shelf Scanner — Project Brief

## Overview
Shelf Scanner is a **mobile-first web app** that allows users to:
1. Take or upload a photo of a bookshelf
2. Extract book titles from the image
3. Get personalized book recommendations
4. Save books to read later

This project intentionally has:
- ❌ No user accounts
- ❌ No payments
- ✅ Device-based identity using a `device_id` stored in `localStorage`

The project is built incrementally over **4 weeks**, with a strict focus on completing **Week 1 (upload pipeline)** before any AI features.

---

## Tech Stack

### Frontend 
- React + TypeScript
- Vite (dev server & bundler)
- Mobile-first UI

### Backend
- Node.js
- Express
- TypeScript
- Multer (file uploads)

### Database & Storage
- Supabase PostgreSQL (metadata)
- Supabase Storage (raw images)

### AI (Weeks 2–3 only)
- OpenAI GPT-4o Vision (primary image → text)
- Google Vision OCR (fallback)
- OpenAI GPT-4o (text parsing & recommendations)

### Deployment (Week 4)
- Vercel (client + server)

---

## Core Architecture

### Components
- **Client**: React SPA handling image capture, upload, and UI states
- **Server**: Express API orchestrating uploads, storage, and DB writes
- **Database**: Supabase Postgres storing scans and related metadata
- **Storage**: Supabase Storage bucket (`uploads`) storing raw images

---

## Data Flow (Scan Process)

1. User opens app → generates/retrieves `device_id`
2. User uploads photo
3. Client sends `POST /api/scan`
   - Header: `x-device-id`
   - Body: `multipart/form-data` (`image`)
4. Server receives file via Multer
5. Server uploads image to Supabase Storage (`uploads`)
6. Server inserts row into `scans` table
7. Server returns `{ scanId, imageUrl, status }`
8. Client shows success + preview

⚠️ AI processing starts **Week 2**, not in Week 1

---

## Database Schema (Authoritative)

### Devices
```sql
create table devices (
  device_id uuid primary key,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

