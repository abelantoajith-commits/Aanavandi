# PRD: Offline Dynamic-QR Student Concession Verification System

**Doc owner:** (you)
**Target build tool:** Google Antigravity
**Target deploy:** Vercel
**Build budget:** 5 hours (prototype/demo)
**Version:** 1.0

---

## 1. Problem Statement

Bus conductors currently verify student concession passes manually (paper/ID cards), which is slow and easy to forge or reuse. We want a two-role web app — **Student** and **Conductor** — where a student shows a QR code that changes every day, the conductor scans it with their phone camera, and the app instantly shows the student's identity and concession status. The whole flow must work **with zero network connectivity** (no Wi-Fi, no mobile data, no backend calls) at the moment of scanning, since buses often have poor connectivity.

## 2. Goals

- One web app, two "modes": **Student** and **Conductor**, selected on first load.
- Student sees a QR code that is cryptographically tied to *today's date* — visually and functionally different every day.
- Conductor scans the QR with the device camera and, **without any network call**, resolves it to a specific pre-registered student's profile.
- A given day's QR can be accepted by the conductor **at most once** (prevents simple replay/reuse of a screenshot within the same day).
- Conductor gets a running log of today's (and past) scans, filterable/searchable.
- Everything installable as a PWA so it behaves like a native app and works offline after first load.
- Deployable as a single project on Vercel.

## 3. Non-Goals (out of scope for the 5-hour prototype)

- Real document verification or a human review pipeline — the student's document-upload/approval flow (§5.2.0) is a *simulated* approval for the demo, not real KYC (see §6.6). Students themselves are still seeded/pre-loaded (name, ID, course, concession dates); only the "upload documents → get approved" step is new.
- Live sync between the Student's phone and the Conductor's phone over Bluetooth/WebRTC/NFC — **the QR code itself is the only data channel**. The Conductor's "Sync" button (§6.8) is unrelated to this — it doesn't talk to the Student's phone at all.
- Fully airtight anti-fraud (see §6 — a screenshot shared with another *person* can still be scanned once; we only prevent silent duplicate scanning by the system).
- Multi-conductor/multi-bus data reconciliation into a central server. (Flagged as a fast-follow, see §10.)
- True asymmetric crypto (RSA/ECDSA key pairs) — see §6 for why an HMAC-based scheme is the correct choice for this timebox.

## 4. Users & Roles

| Role | Device | Primary need |
|---|---|---|
| Student | Own phone, opens app in "Student" mode | Show a valid, unique-looking QR for today; see history/expiry of their concession |
| Conductor | Own phone/tablet, opens app in "Conductor" mode | Scan QR, get instant accept/reject + student identity, keep a log |

Both roles share one codebase/deployment; the mode is chosen from a landing screen and persisted locally (`localStorage`/route), so each installed PWA "remembers" which role it is.

## 5. Feature Breakdown

### 5.1 Conductor mode

1. **Scan QR** (primary/home tab)
   - Opens device camera, live-decodes QR.
   - On decode, runs validation pipeline (§6.3) and shows a full-screen result card:
     - ✅ Accepted: student photo-less avatar/initials, name, ID, course, concession status, valid-until date, big green check.
     - ❌ Rejected: reason shown explicitly — `Invalid QR`, `Expired (wrong date)`, `Already used today`, `Unknown student`, `Concession expired`.
   - Every scan (accepted or rejected) is written to the local scan log immediately.
2. **Logs**
   - Today's scans by default, toggle to see previous days.
   - Search by student name/ID.
   - Each row: timestamp, student name/ID, course, accepted/rejected + reason.
   - "Export logs" → download current log as CSV/JSON (client-side blob download, still offline).
3. **Settings**
   - Conductor name, route/bus number (stored locally, stamped onto each log entry).
   - "Clear local data" (with confirmation) — wipes scans only, never the student roster.
   - "Reload student roster" — for the demo, re-seeds the local database from the bundled JSON if it was cleared.
   - **Sync** button — updates a `lastSyncedAt` timestamp shown in Settings; see §6.8 for exactly what this does (and doesn't) mean in a fully-offline app, and the two build options depending on time left.

### 5.2 Student mode

0. **Onboarding: Document Upload & Approval** (gate, shown before the dashboard on first run)
   - A brand-new student profile starts in `pending` status: the whole app is locked behind a full-screen message — *"Upload your documents to activate your concession pass"* — with an upload control (file input, accepts image/PDF, client-side only, no real backend).
   - Once a file is selected, the app shows a **"Waiting for approval…"** state with a small loading animation for ~5 seconds (simulated review — see §6.7). No real verification happens in the prototype; this is a scripted delay for demo realism.
   - After the delay, an **"Approved ✅"** confirmation message appears briefly, the student's local status flips to `approved`, and the app auto-navigates into the normal Student dashboard (My QR / Calendar / Profile).
   - If the app is reopened while still `pending` (shouldn't normally happen since approval is immediate), it returns to the same upload screen rather than the dashboard — status is persisted in IndexedDB, not just component state.
   - The uploaded file itself is stored locally (as a Blob in IndexedDB) purely so the Profile tab can show a "Document on file" thumbnail/filename — it is never transmitted anywhere, consistent with the fully-offline design.

1. **My QR** (primary/home tab)
   - Large, high-contrast QR code, regenerated automatically at local-midnight.
   - Label under QR: student name, ID, "Valid for: `<today's date>`".
   - Small live countdown to next regeneration (nice demo touch, not functionally required).
   - Manual "Regenerate" button for demoing the day-to-day change without waiting for midnight (dev/demo convenience — can be hidden in a "prod" build flag).
2. **Concession Calendar**
   - Month grid; days the concession was *used* (i.e., accepted by some conductor scan — for the prototype this is simulated locally per student record, see §6.7) are marked.
   - Concession validity window and "days remaining" shown below the grid.
3. **Profile**
   - Name, student ID, course/class, concession start/expiry date, static "photo" placeholder.

## 6. Core Technical Design: The Dynamic QR

### 6.1 Why not the naive "just put student ID + date in the QR" approach
Anyone who inspects the QR could construct a fake payload for a different student ID. We need the conductor to be able to verify the QR **was actually issued by that student's key**, offline, with no server round-trip.

### 6.2 Why not full asymmetric crypto (the "private key on phone, public key on conductor" idea)
It's the theoretically "correct" answer, but for a 5-hour build it's the wrong trade-off:
- You'd need real per-student keypair generation, secure key storage, and a key-distribution step before the demo even works.
- Signature verification libraries and payload sizes make the QR bigger and slower to scan, for a benefit (protecting against a well-resourced attacker) that isn't the actual demo risk.

**Recommendation: symmetric HMAC-SHA256, one secret per student, both sides pre-seeded.**
Because this is a closed system with a pre-loaded roster (not open registration), both the Student build and the Conductor build can already ship with the same per-student secret baked into their local "student roster" seed data. This is functionally equivalent to a signature for this threat model (a party without the secret cannot forge a valid token) and is implementable in ~30 minutes with the Web Crypto API (`crypto.subtle.importKey` + `HMAC` + `SHA-256`), which is available offline in every modern mobile browser.

> Production note (post-prototype): move to real per-student asymmetric keys issued at enrollment time, so no shared secret ever has to live in two places. Documented as a fast-follow in §10, not attempted in the 5-hour build.

### 6.3 QR payload & validation pipeline

**Payload (JSON, then QR-encoded):**
```json
{
  "sid": "S001",
  "date": "2026-09-16",
  "nonce": "A82F91C4",
  "mac": "b64-encoded-HMAC-SHA256(sid|date|nonce, studentSecret)"
}
```

**Conductor-side validation, in order (short-circuit on first failure):**
1. QR decodes to valid JSON matching the schema → else `Invalid QR`.
2. `sid` exists in the local roster → else `Unknown student`.
3. Recompute HMAC using that student's secret (from local roster) over `sid|date|nonce` and compare to `mac` (constant-time compare) → else `Invalid QR` (tampered).
4. `date` === conductor device's local today → else `Expired QR`.
5. `(sid, date)` pair not already present in today's *accepted* scan log → else `Already used today`.
6. Student's concession window (`validFrom`–`validUntil`) contains today → else `Concession expired`.
7. All pass → `Accepted`; write `{sid, date, nonce, ts, result: "accepted"}` to scan log and (for the demo) mark that date as "used" in the student's own local calendar record.

### 6.4 Daily regeneration
On the Student side, a token is (re)computed whenever `date` changes: `nonce` is a fresh random value each time it's generated, so yesterday's QR is invalid both because the date fails check (4) and because the MAC won't match if nonce were reused. Regenerating simply means: pick new nonce → recompute HMAC → re-render QR.

### 6.5 Honest limitation to state in the demo narrative
A screenshot of today's QR, sent to a second person, will still scan successfully **once** (the system cannot know who is physically holding the phone). What the prototype *does* guarantee is **one accepted scan per token per day**, and that yesterday's token is worthless today. State this proactively when presenting — it reads as rigor, not a gap.

### 6.6 Simulated document approval (§5.2.0)
For the 5-hour prototype, "approval" is intentionally fake: any uploaded file is accepted, a `setTimeout` (~5s) drives the "Waiting for approval…" animation, and the student record's status is flipped from `pending` to `approved` locally — there is no real document verification, OCR, or human review, and nothing leaves the device. This is enough to demo the *product concept* ("no QR pass until your documents are approved") without needing a verification backend that a 5-hour build can't responsibly deliver anyway (verifying a student ID document is its own project). State this plainly when presenting, the same way you'd flag the QR-sharing limitation above.

> Production note (fast-follow, §10): a real version needs a human/admin review queue (or a document-verification API) before flipping a student to `approved`, plus a rejection path with a resubmission flow — neither is in scope here.

### 6.7 Why the calendar might not perfectly reflect conductor-side scans across devices
Since the two apps never talk to each other except through the QR, the *conductor's* device is the source of truth for "was this student scanned today," while the *student's* calendar view is a local convenience. For the prototype, seed the student's calendar from the same local demo data so the two views look consistent on stage; call out in the README that real cross-device reconciliation needs a sync step (§10).

### 6.8 Conductor "Sync" button — what it actually does here
The whole point of this app is that scanning never needs a network call, so "sync" can't mean "push scans to a live server" without contradicting §1–§3. Pick one of these two honest versions depending on how much time is left when you get to it:

- **Demo version (recommended, ~15 min to build):** tapping Sync shows a brief "Syncing…" spinner (1–2s, same fake-delay pattern as §6.6), then a toast like *"Synced 12 scans, 0 conflicts"* using numbers pulled from the real local scan log — it's honest about what's *counted* (real local data) while the transport is simulated, since there's genuinely nothing to sync to yet.
- **Real version (only if time allows, and better as a fast-follow — §10):** Sync exports the local scan log as a JSON/CSV file (client-side download or Web Share API), which a person can later import into another device or a spreadsheet — this is a real, working offline "sync via sneakernet," not a simulation, and it's the natural stepping stone toward the multi-bus reconciliation feature already flagged in §10.

Either way, be upfront on stage about which one you built — the demo version demonstrates the *concept* of syncing, the export version actually moves data.

## 7. Data Model (IndexedDB, both apps share the shape)

```ts
// students.ts
interface Student {
  sid: string;              // "S001"
  name: string;
  course: string;
  secret: string;           // shared HMAC key material (demo-only; base64)
  validFrom: string;        // ISO date
  validUntil: string;       // ISO date
  usedDates: string[];      // ISO dates, for the calendar view
  approvalStatus: "pending" | "approved";  // gates access to the dashboard (§5.2.0)
  documentBlob?: Blob;      // uploaded file, stored locally only, never transmitted
  documentName?: string;    // original filename, for the Profile tab display
}

// scans.ts (conductor only)
interface ScanRecord {
  id: string;               // uuid
  sid: string;
  date: string;             // ISO date on the token
  nonce: string;
  ts: number;                // epoch ms of the scan
  result: "accepted" | "rejected";
  reason?: string;          // populated when rejected
  conductorName?: string;
  route?: string;
}

// settings.ts (conductor)
interface ConductorSettings {
  conductorName: string;
  route: string;
  lastSyncedAt?: number;    // epoch ms, set by the Sync button (§6.8)
}
```

Use **Dexie.js** as a thin wrapper over IndexedDB (much less boilerplate than raw IndexedDB, still fully offline).

## 8. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Vite + React + TypeScript | Fast dev server, tiny prod bundle, first-class PWA plugin, deploys cleanly to Vercel as a static build |
| Styling | Tailwind CSS | Fast to build clean-looking screens inside a tight timebox |
| Local DB | Dexie.js (IndexedDB wrapper) | Simple async API, works fully offline, survives reloads |
| QR generation | `qrcode.react` (or `qrcode` npm lib to canvas) | Zero-network client-side QR rendering |
| QR scanning | `html5-qrcode` (or `@yudiel/react-qr-scanner`) | Camera access + decode entirely client-side |
| Crypto | Native Web Crypto API (`crypto.subtle`) | HMAC-SHA256 built into every modern mobile browser, no extra dependency |
| Offline/installable | `vite-plugin-pwa` (Workbox under the hood) | Service worker + manifest so the app is installable and works with airplane mode on |
| Hosting | Vercel (static build output) | One-command deploy, matches your requirement |

## 9. Suggested Project Structure

```
concession-app/
├── src/
│   ├── modes/
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── MyQR.tsx
│   │   │   ├── Calendar.tsx
│   │   │   └── Profile.tsx
│   │   └── conductor/
│   │       ├── ConductorDashboard.tsx
│   │       ├── ScanQR.tsx
│   │       ├── ScanResultCard.tsx
│   │       ├── Logs.tsx
│   │       └── Settings.tsx
│   ├── db/
│   │   ├── db.ts              # Dexie schema/instance
│   │   ├── students.ts
│   │   ├── scans.ts
│   │   └── seed.ts            # demo roster of 3–5 students
│   ├── qr/
│   │   ├── generateToken.ts   # build payload + HMAC, render QR
│   │   └── validateToken.ts   # the pipeline in §6.3
│   ├── crypto/
│   │   └── hmac.ts            # Web Crypto HMAC helpers
│   ├── App.tsx                # role selection + routing
│   └── main.tsx
├── public/
│   └── manifest.webmanifest
├── vite.config.ts             # + vite-plugin-pwa config
└── vercel.json
```

## 10. Explicitly Deferred (fast-follows, not for the 5-hour build)

- Per-student real keypairs (ECDSA) generated at enrollment instead of a shared HMAC secret.
- A lightweight sync step (e.g., conductor exports scan log → student app or backend imports it) so the student-side calendar reflects *actual* conductor scans rather than a locally-mirrored demo value.
- Real backend + auth for a live multi-bus deployment (this prototype intentionally has none).
- Photo ID on the student profile / scan result card.
- Admin console for managing the roster instead of a hardcoded seed file.

## 11. 5-Hour Build Plan

| Time | Block | Deliverable |
|---|---|---|
| 0:00–0:25 | Scaffold + role routing | Vite+React+TS+Tailwind project boots; landing screen picks Student/Conductor and remembers it |
| 0:25–0:55 | Student onboarding gate | Upload screen → 5s fake "waiting for approval" → approved message → unlocks dashboard; `approvalStatus` persisted in Dexie |
| 0:55–1:30 | Student: QR + profile | `MyQR.tsx` renders a static (not yet signed) QR; Profile tab shows seeded data + uploaded document filename |
| 1:30–2:10 | Crypto + dynamic token | `hmac.ts` + `generateToken.ts` wired in; QR payload now includes date/nonce/mac; regenerating changes the QR visibly |
| 2:10–3:00 | Conductor: scanner | Camera opens, decodes QR, shows raw decoded payload on screen (validation not wired yet) |
| 3:00–3:40 | Validation pipeline + result card | Full §6.3 pipeline wired; accept/reject states with reasons render correctly |
| 3:40–4:05 | Logs + calendar + Sync button | Scan writes to Dexie; Logs tab lists them; Student calendar reflects `usedDates`; Sync button wired per §6.8 (demo version) |
| 4:05–4:30 | PWA + offline | `vite-plugin-pwa` configured, manifest + icons added, test in airplane mode |
| 4:30–5:00 | Polish + deploy | Status badges, empty states, `vercel deploy`, final smoke test on two phones |

**Rule for the session:** don't touch visual polish before the 4:30 mark — a working onboarding-gate + accept/reject/already-used flow is the entire demo. If time runs short, cut PWA polish (4:05–4:30) before you cut anything earlier in the list.

## 12. Demo Script (2 phones, side by side)

1. Open the Student app fresh → locked "Upload your documents" screen → upload any file → 5s "Waiting for approval…" animation → "Approved ✅" → dashboard unlocks. This is your opening beat: it sells the "no pass without approval" concept before the QR even appears.
2. Student phone shows today's QR + "Valid for 16 September 2026."
3. Conductor scans it → ✅ Accepted card with full student details → appears in Logs.
4. Conductor scans the *same* QR again → ❌ "Already used today."
5. On the student phone, tap "Regenerate" (or wait past simulated midnight) → QR visibly changes.
6. Conductor scans the *new* QR → ✅ Accepted again, proving the day-to-day change works and the old token is dead.
7. On the conductor phone, open Settings → tap **Sync** → show the "Synced N scans" confirmation, and be ready to explain honestly (per §6.8) whether it's the simulated version or the real export version you built.

## 13. Deployment (Vercel)

- `npm run build` produces a static `dist/` (Vite default) — Vercel auto-detects the Vite framework preset, no server config needed.
- Add a `vercel.json` only if you need SPA fallback routing:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- Because everything is client-side/offline-first, there are no environment variables or serverless functions required for the prototype.

## 14. Open Questions for You (fill in before/while building)

- How many demo students do you want seeded (3–5 is plenty)?
- Should "Conductor" be a hard-coded single account for the demo, or should Settings let you type any name/route freely? (Recommend: freely, no login — matches the offline/no-backend spirit.)
- Do you want the "manual regenerate" button visible in the final demo build, or hidden so the QR only changes at real local midnight?
