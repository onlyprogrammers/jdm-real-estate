# JDM Real Estate visual refresh

## Objective and audience
Refresh the existing Gurugram-focused property marketplace so it feels considered, trustworthy, and easy to use for home seekers and property owners. Apply the visual system across the complete existing app, including the home/search experience, listing detail, saved/compare, profile/auth, owner listing form, admin dashboard, and shared navigation/components.

## Direction
A warm, editorial real-estate journal with a quietly premium local character. Keep the existing forest-green and citron identity, but refine it with warm limestone backgrounds, deeper ink, restrained brass/olive accents, generous whitespace, expressive serif headlines, subtle borders, and confident photo-led property cards. Avoid a generic SaaS dashboard look, excessive rounded pills, and visual clutter. Create a clearly recognizable and consistent brand system across routes.

## Typography and palette
Use the existing Newsreader + DM Sans pairing (or a suitable local/system fallback if needed); maintain elegant large serif display headings and legible sans-serif interface text. Palette: warm ivory/limestone canvas, near-black forest ink, rich evergreen primary, muted olive/citron accent, warm taupe secondary surfaces. Define reusable CSS tokens and useful shared interaction/focus treatments.

## Design priorities
- Improve hierarchy, page rhythm, spacing, and responsive behavior across all app routes.
- Make the home page feel like a strong marketplace landing experience, with polished hero/search, locality discovery, listing cards, section headings, and navigation.
- Keep search filters and listing results easy to scan on mobile and desktop.
- Make property details, saved homes, compare, owner form, auth, profile, and admin visually coherent and polished.
- Preserve all existing functional behaviors, accessibility labels and semantics, content meaning, routes, data flow, and mobile bottom navigation.
- Prefer existing local imagery in public/images. No external image service URLs. Do not alter backend/API functionality.
- Limit code changes to styling/layout/presentation unless a tiny interaction adjustment is needed for the design; do not break the current client/server component boundaries.

## Project facts
Next.js 16 App Router, React 19, Tailwind CSS 4, lucide-react. Global design tokens are in app/globals.css. Shared page implementations are in components/home-screen.tsx, components/property-search.tsx, components/shortlists.tsx, components/bottom-nav.tsx, components/auth-form.tsx, components/contact-actions.tsx; route pages are under app/.
