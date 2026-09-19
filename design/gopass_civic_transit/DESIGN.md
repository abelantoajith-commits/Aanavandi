---
name: GoPass Civic Transit
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5a4138'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8e7166'
  outline-variant: '#e2bfb2'
  surface-tint: '#a63b00'
  primary: '#a23a00'
  on-primary: '#ffffff'
  primary-container: '#cb4a00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb598'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#006b2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00873a'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb598'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.01em
  title-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-utility, civic-grade transit interface engineered specifically for the fast-paced, high-friction environment of public transit. Built for both students presenting passes in packed, moving buses and conductors validating credentials in seconds under blinding outdoor daylight, the aesthetic prioritizes immediate comprehension, tactile durability, and structural clarity.

The visual style blends **Modern Utilitarian Transit** with **Tactile Civic Ergonomics**:
- **High Glanceability:** Information hierarchy is ruthless. Dynamic QR codes, validity counters, route codes, and pass authenticity seals take absolute priority over decorative fluff.
- **Physical Metaphor:** Passes present as tactile, durable physical cards with notched stamps, ticket perforation lines, security holograms, and distinct status edges.
- **Extreme Legibility Under Direct Glare:** The typography and structural contrasts are calibrated for midday sunlight, scratched phone displays, and angled viewing distances.
- **Offline Confidence:** Dedicated system states communicate sync health, local cryptographic verification status, and tamper-evident countdowns to ensure trust between rider and transit operator.

## Colors

The palette is anchored by the vivid, institutional energy of state transit orange, framed by deep slate structural tones and strict functional validation signals.

### Primary Brand
- **Transit Orange (`#E8590C` / `#FF6600`)**: The definitive brand identifier. Used for core primary touchpoints, active transit header bands, primary action buttons, pass category watermarks, and high-priority transit notifications.

### Secondary & Structural Neutrals
- **Deep Slate Neutral (`#0F172A` & `#1E293B`)**: Imparts an authoritative, durable transport foundation. Used for high-contrast headers, conductor scanner reticles, route code blocks, and primary copy.
- **Muted Steel (`#64748B`)**: Used for secondary route labels, expiration subtext, and inactive UI dividers.
- **Clean Crisp Base (`#F8FAFC` to `#FFFFFF`)**: Ensures maximum back-illumination contrast when displaying digital pass QR codes and barcode symbology to optical scanners.

### Transit Status Semantics
- **Emerald Green (`#16A34A`)**: Unambiguous validity. Applied to valid pass banner states, conductor validation checkmarks, active daily timers, and synchronized offline tokens.
- **Crimson Red (`#DC2626`)**: Immediate halt. Applied to expired passes, route invalidity, fare-evasion alerts, and offline cryptographic signature failures.
- **Warm Amber (`#D97706`)**: Intermediate attention. Applied to pending student renewals, passes expiring within 48 hours, and pending server sync buffers.

## Typography

Typography balances rapid scanning with dense administrative data.

- **Plus Jakarta Sans** governs headings, numerical route identifiers, and pass hero titles. Its rounded apertures and contemporary geometric structure project civic authority with a modern, friendly character.
- **Inter** handles all body content, tabular data, terms, and conductor telemetry. It provides clean vertical metric alignments and high micro-legibility at 11px to 14px on lower-tier IPS displays.
- **JetBrains Mono** is reserved exclusively for cryptographic ticket tokens, offline verification hashes, bus route alphanumeric codes (e.g., `KA-01-F-9421`, `ROUTE 335-E`), and timestamp telemetry.
- **Letter Spacing:** All small labels and status badges must feature uppercase tracking (`+0.04em` to `+0.08em`) to preserve legibility when viewed in high-vibration transit conditions.

## Layout & Spacing

The layout utilizes a strict, responsive 4-to-12 column fluid system optimized for single-handed mobile thumb access.

- **Thumb Zone Focus:** Primary validation elements, active pass flipping, and barcode zoom triggers are anchored within the bottom 60% of the viewport.
- **Grid Structure:**
  - **Mobile (<640px):** 4-column layout with `margin: 1rem` (16px) and `gutter: 1rem` (16px).
  - **Tablet (640px - 1024px):** 8-column layout with `margin: 2rem` (32px), optimized for conductor handheld rugged terminals and tablet POS kiosks.
  - **Desktop (>1024px):** 12-column layout with `margin: 3rem` (48px) for administrative institutions, student registration desks, and transport depots.
- **Rhythm Rules:** All layout heights, margins, and gaps adhere to an 8pt base grid (`space-xs: 4px`, `space-sm: 8px`, `space-md: 16px`, `space-lg: 24px`, `space-xl: 32px`).

## Elevation & Depth

This system avoids soft, atmospheric drops in favor of **Crisp Utility Elevation** and **Tonal Layering** to safeguard high contrast in outdoor sunlight.

- **Level 0 (Canvas Base):** `#F8FAFC`. Neutral, low-glare surface behind interactive elements.
- **Level 1 (Pass Cards & Utility Sections):** Pure `#FFFFFF` surface bounded by a high-definition structural hairline outline (`1px solid #E2E8F0`). Shadow is shallow and sharp: `0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active Pass In-Inspection / Modals):** Scaled card depth for physical presentation: `0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)` with a `2px` colored status border (Orange, Green, or Red).
- **Physical Ticket Notches:** Elevation is punctuated using pseudo-skeuomorphic cutouts (concave circular cut notches at the card fold) to delineate the dynamic QR section from route metadata.
- **Conductor Scanner HUD:** Dark elevated overlay (`#0F172A` at 92% opacity) with luminous neon focus reticles in `#16A34A` or `#E8590C`.

## Shapes

The interface embraces a sturdy, tactile geometry that reflects physical composite transit cards:
- **Base Geometry (`roundedness: 2`):** Standard interactive elements (inputs, buttons, list cells) use `0.5rem` (8px).
- **Hero Pass Cards (`rounded-2xl`):** Digital Concession passes use `1rem` to `1.5rem` (16px to 24px) corner radii, mimicking laminated commuter plastic smartcards.
- **Perforated Ticket Nodes:** Symmetric 16px semi-circular notches positioned at card midpoints symbolize physical ticket tear-slits.
- **Status Badges & Chips:** Fully pill-shaped (`9999px`) to immediately separate operational statuses from structural UI boxes.

## Components

### 1. Digital Concession Pass Card (Signature Component)
- **Top Header Ribbon:** 48px banner in brand `#E8590C` containing institutional crest, agency mark, and student category ("STUDENT - HIGHER EDUCATION").
- **Identity Segment:** Student portrait photograph (4:5 ratio, 72x90px) framed in a 2px slate border, flanked by student name, roll number, and institution code.
- **Center Verification Matrix:** Centered high-contrast QR code container (minimum 180x180px pure white substrate) surrounded by a 4px dynamic anti-fraud animated color halo.
- **Perforated Boundary:** Dashed divider line (`border-dashed border-slate-300`) with circular inward notches at left and right edges.
- **Route Segment:** Bold typography declaring Origin and Destination Bus Terminals, allowable interchange stages, and route numbers.

### 2. Status Badges & Stamps
- **Valid Pass:** Pill badge with `#DCFCE7` background, `#16A34A` text, and a live pulsating green beacon dot. Includes dynamic ticking timecode.
- **Expired/Revoked:** `#FEE2E2` background, `#DC2626` text with warning icon and bold strikethrough stamping.
- **Pending/Grace Period:** `#FEF3C7` background, `#D97706` text.

### 3. Conductor Inspection Trigger Buttons
- **Primary Conductor Action (Validate / Scan):** Min-height 52px, background `#E8590C`, text `#FFFFFF`, bold `16px`, corner radius `8px`. Haptic click feedback on mobile press.
- **Secondary Action (Manual Entry / Override):** Surface white, border `2px solid #1E293B`, text `#1E293B`.
- **Destructive Action (Flag Pass / Report Misuse):** Background `#DC2626`, text `#FFFFFF`.

### 4. Input Fields (Registration & Renewal)
- Height 48px, background `#FFFFFF`, border `1.5px solid #CBD5E1`.
- Focused state: `border-color: #E8590C` with a `0 0 0 3px rgba(232, 89, 12, 0.15)` focus ring.
- Fixed label positioned above input in `label-lg` format with `#1E293B` coloration for uncompromised readability.

### 5. Offline Sync Status Bar
- Persistent horizontal dock pinned to screen bottom or beneath navigation.
- Green state: "Offline Ready (Synced Today, 06:30 AM)".
- Amber warning state: "Offline Mode: 2 Days Remaining to Reconnect". Includes instant manual sync trigger.