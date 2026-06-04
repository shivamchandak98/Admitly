# Admitly — PRD & Progress Log

## Original problem
Indian school admissions are a hassle. Build a website where parents browse schools (area, fees, facilities, images, reviews, deadlines, admission link), shortlist, save, and track per-child applications with documents, interview dates, notes, reminders.

## Architecture
- React (CRA + Tailwind + shadcn/ui) frontend; FastAPI backend; MongoDB; Emergent Object Storage for document uploads
- Emergent-managed Google OAuth for parents
- Auth via Bearer token in `Authorization` header (localStorage key `admitly_session_token`) — cookies also supported but disabled by infra wildcard CORS

## Personas
- **Parent (primary)**: signs in with Google, browses/shortlists across cities, tracks per-child applications and document checklists
- **School admin (deferred)**: edits school listings (future admin panel)

## Core requirements (static)
1. Browseable school listings with filter + sort + city-switch
2. Per-school detail page with images, fees, facilities, Google rating, 10th-pass %, admission deadline, apply link
3. Favourites
4. Per-application tracker: status, documents (with file upload), interview & reminder dates, notes
5. Calm, distinctive UI (Outfit/Manrope, terracotta + sage palette)

## Implemented (Feb 2026)
- 80 schools seeded across **Mumbai (35), Bangalore (15), Delhi (10), Noida (10), Gurgaon (10)** with Indian-themed imagery, Google ratings, 10th-pass %, fees, facilities
- City switcher (Navbar + Landing + Schools list) backed by CityContext + localStorage
- Listings, filters (area/board/facility/fees/admission open), sort (rating/fees), search
- School detail with Apply link, favourites, tracker dialog
- Parent dashboard with applications, status workflow, document upload (Emergent Object Storage), interview/reminder dates, notes
- 100% test coverage on backend (32 pytest cases) and verified frontend flows

## Backlog
- **P1**: Email/in-app reminders (deadlines & interviews) — likely via Resend + cron
- **P1**: Compare schools side-by-side (2–3 selection)
- **P2**: Admin panel to add/edit schools (so user can grow listings)
- **P2**: City expansion: Pune, Hyderabad, Chennai, Kolkata
- **P2**: Per-application timeline / activity log
- **P3**: Signed short-lived download URLs for documents
- **P3**: Live CBSE pass-percentage sync from official source
- **P3**: WhatsApp reminders
