# RouteLifeline — Command Center Aurora

## Goal
Transform the current single hero into a premium, cinematic emergency-logistics command center without changing the app architecture.

## Experience
- Rebrand the interface as **RouteLifeline** and apply the dark navy, electric teal, amber, crimson, and violet “Command Center Aurora” visual language.
- Preserve the generated disaster-routing landscape as the narrative backdrop while layering subtle aurora movement, grain, route telemetry, and glass controls.
- Load Space Grotesk for display text and Inter for interface/body text.

## Interactive command center
- Build a live situation ticker beneath the navigation with continuously scrolling updates that pause on hover.
- Expand the hero into an operational overview with animated stats, convoy/cargo status, moving route markers, and a persistent live-system badge.
- Add a **Simulate Disaster Event** control that triggers a visible route hazard, shockwave, animated reroute redraw, alert toast, and smoothly reordered priority queue.
- Add contextual animated stickers for convoys, alerts, flood risks, medical cargo, and verified routes.

## New sections
- **Disaster Timeline:** sequential vertical event progression with timestamps and scroll entrance motion.
- **Before vs After:** draggable comparison slider contrasting failed traditional GPS routing with RouteLifeline’s safe reroute.
- **Field Impact:** three glass quote cards from field coordinators and shelter managers.

## Motion and responsiveness
- Add staggered page entrances, headline shimmer, count-up stats, route movement/trails, card lift/glow, button feedback, and reduced-motion fallbacks.
- Keep animation restrained and operational rather than playful; emoji stickers remain small layered accents.
- Verify desktop and mobile layouts, interactions, horizontal overflow, and browser console state.

## Technical details
- Keep TanStack Start routing and the existing `/` route.
- Implement interactivity in focused React components using CSS keyframes and IntersectionObserver; no backend is required for this simulated command-center experience.
- Centralize all colors, shadows, gradients, typography, and animation utilities in `src/styles.css` using semantic tokens.
- Update route metadata to RouteLifeline-specific title and social descriptions.
