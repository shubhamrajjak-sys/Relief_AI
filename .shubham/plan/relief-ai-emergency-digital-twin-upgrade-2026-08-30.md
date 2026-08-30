# RELIEF.AI — Emergency Digital Twin Upgrade

## Goal
Upgrade the existing RouteLifeline experience into **RELIEF.AI**, a premium AI emergency-logistics platform with a live 3D digital twin, while preserving the current route, ticker, simulation behavior, timeline, comparison, impact content, and responsive structure.

## Visual and typography system
- Shift the palette toward deep charcoal/black, white, neon green, restrained cyan, and hazard-only red/orange.
- Use Space Grotesk for display text, Inter for body copy, and JetBrains Mono for telemetry and technical labels.
- Replace the broad aurora look with cleaner map-grid depth, localized water/hazard glows, glass surfaces, and restrained grain.
- Add a sub-1.5-second initialization sequence with a reduced-motion bypass.

## Navigation and narrative
- Rebrand the navbar to **RELIEF.AI** with Problem, Solution, How It Works, Simulation, and Impact anchors.
- Add compact-on-scroll glass behavior and a **Launch Simulation** action.
- Reframe the page journey so it reads clearly as disaster → network failure → GPS failure → hazard detection → AI reroute → delivery.

## Hero and 3D digital twin
- Replace the hero’s image-based route map with a client-only React Three Fiber scene.
- Build a stylized isometric terrain showing hills, debris, floodwater, damaged bridge, warehouse, shelter, road network, hazards, and relief vehicles.
- Render animated unsafe and safe route paths, route particles, pulsing markers, subtle fog/rain, and a moving convoy.
- Add restrained pointer parallax on capable desktop devices; disable it on touch, reduced-motion, and constrained displays.
- Layer accessible DOM telemetry cards for road status, AI route distance, and critical cargo over the scene.

## Existing sections, upgraded
- Convert the operational section into **When the map lies, people wait** with four concise problem cards and animated mini-diagrams.
- Upgrade the current comparison into **The map doesn’t stop. It adapts**, preserving the interactive comparison while clarifying traditional GPS versus dynamic routing.
- Rework the timeline into a clear **How It Works** sequence.
- Turn the existing command metrics into an explicitly labeled **Demo Simulation** impact band; avoid fabricated real-world claims.
- Preserve and restyle the existing field-impact cards as illustrative hackathon personas.

## Interactive simulation
- Preserve the current disaster simulation control and toast.
- Synchronize simulation state with the 3D scene so a route becomes hazardous, a warning pulse appears, the safe path redraws, and the convoy visibly reroutes.
- Add clickable 3D hazard and convoy targets that update an accessible details panel with flood depth/risk or cargo/rerouting status.

## Performance and accessibility
- Lazy-load the 3D component and provide a lightweight loading/fallback surface.
- Cap pixel ratio and geometry/particle counts, reuse materials/geometries, and keep frame updates in refs rather than React state.
- Provide reduced-motion behavior, keyboard-accessible controls and map targets, readable contrast, and semantic labels.
- Preserve mobile stacking, remove desktop-only floating cards where space is tight, and prevent horizontal overflow.

## Technical details
- Keep TanStack Start and the existing `/` route; mark the home route client-only for WebGL safety.
- Add `three`, React Three Fiber, Drei, and Three.js types compatible with React 19.
- Split the 3D scene, DOM HUD, and page content into focused components while keeping the current functionality intact.
- Update route metadata and font links for RELIEF.AI.
- Verify loading, simulation, map interaction, responsive desktop/mobile rendering, motion fallback, horizontal overflow, and browser console state.
