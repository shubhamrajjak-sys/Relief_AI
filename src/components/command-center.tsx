import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  CircleAlert,
  Clock3,
  MapPinned,
  Network,
  Radio,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import reliefRoutingHero from "@/assets/relief-routing-hero.jpg";

const tickerItems = [
  ["🚨", "Sector 7 bridge flagged unsafe", "critical"],
  ["✅", "Truck #2 delivered to Shelter Alpha", "safe"],
  ["🌊", "Water level rising near Route C", "warning"],
  ["🚚", "Convoy 04 rerouted via Ridge Pass", "safe"],
  ["🩸", "Insulin cargo priority elevated", "critical"],
];

const timeline = [
  ["06:42", "Earthquake struck", "Seismic event registered across the river valley.", "⚡"],
  ["06:51", "Roads compromised", "Debris blocked arterial roads and damaged Bridge S7.", "🚧"],
  ["07:03", "Sensors detect flooding", "Water crossed the safety threshold at Route C.", "🌊"],
  ["07:04", "Routes recalculated", "AI found an accessible corridor through Ridge Pass.", "✅"],
  ["07:39", "Supplies delivered", "Critical cargo reached Shelter Alpha 46 min faster.", "🚚"],
];

const quotes = [
  {
    quote: "The route changed before our drivers reached the flooded junction. That warning saved the entire insulin shipment.",
    name: "Maya Chen",
    role: "Field Logistics Coordinator",
    metric: "46 min saved",
  },
  {
    quote: "We could finally see what was moving, what was blocked, and which shelter needed the next vehicle most.",
    name: "Arun Patel",
    role: "Regional Dispatch Lead",
    metric: "12 routes monitored",
  },
  {
    quote: "The blood bags arrived while our backup refrigeration still had power. Timing was everything.",
    name: "Dr. Lena Ortiz",
    role: "Shelter Medical Manager",
    metric: "100% cargo intact",
  },
];

function useCountUp(target: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 900, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return { ref, value };
}

function Stat({ value, suffix = "", label, tone }: { value: number; suffix?: string; label: string; tone: "safe" | "warning" | "violet" }) {
  const counter = useCountUp(value);
  return (
    <div className={`command-stat command-stat-${tone}`}>
      <span ref={counter.ref} className="font-display text-3xl font-bold sm:text-4xl">{counter.value}{suffix}</span>
      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
    </div>
  );
}

function Ticker() {
  const repeated = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker-shell" aria-label="Live situation updates">
      <div className="mx-auto flex max-w-[1500px] items-center">
        <div className="ticker-label"><Radio className="size-3.5" /> Live situation</div>
        <div className="ticker-viewport">
          <div className="ticker-track">
            {repeated.map(([icon, copy, tone], index) => (
              <span key={`${copy}-${index}`} className={`ticker-item ticker-${tone}`}>
                <span aria-hidden="true">{icon}</span>{copy}<i />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteMap({ simulated }: { simulated: boolean }) {
  return (
    <div className={`route-map ${simulated ? "is-simulated" : ""}`}>
      <img src={reliefRoutingHero} alt="Live disaster relief route map through a flooded mountain valley" width={1600} height={1056} fetchPriority="high" />
      <div className="map-vignette" />
      <svg className="route-overlay" viewBox="0 0 1000 660" role="img" aria-label="Safe and unsafe route overlays">
        <path className="route-line route-safe" d="M110 560 C230 510 245 455 360 430 S500 350 545 300 S610 220 700 175 S830 115 925 72" />
        <path className="route-line route-danger" d="M150 590 C300 560 445 560 560 510 S730 450 795 360 S805 255 915 235" />
        <path className="route-line route-reroute" d="M480 380 C545 420 650 410 700 335 S755 210 870 150" />
        <circle className="shockwave" cx="705" cy="410" r="18" />
        <g className="truck-marker">
          <circle cx="0" cy="0" r="14" />
          <text x="0" y="5" textAnchor="middle">🚚</text>
        </g>
      </svg>
      <span className="map-sticker sticker-flood" aria-label="Flood risk">🌊</span>
      <span className="map-sticker sticker-safe" aria-label="Verified safe route">✅</span>
      <span className="map-sticker sticker-alert" aria-label="Critical route alert">🚨</span>
      <div className="map-topline">
        <span><i className="status-dot" /> AI route telemetry</span>
        <span>07:14:22 UTC</span>
      </div>
      <div className="map-legend">
        <span><i className="legend-safe" /> Accessible</span>
        <span><i className="legend-danger" /> Compromised</span>
      </div>
    </div>
  );
}

function ComparisonSlider() {
  const [position, setPosition] = useState(50);
  return (
    <div className="comparison-shell">
      <div className="comparison-base">
        <img src={reliefRoutingHero} alt="RouteLifeline safe AI rerouting" width={1600} height={1056} loading="lazy" />
        <div className="comparison-tint-safe" />
        <div className="comparison-label comparison-label-right"><span>✅</span><b>RouteLifeline</b><small>Safe corridor found</small></div>
      </div>
      <div className="comparison-before" style={{ width: `${position}%` }}>
        <img src={reliefRoutingHero} alt="Traditional GPS route blocked by hazards" width={1600} height={1056} loading="lazy" />
        <div className="comparison-tint-danger" />
        <div className="comparison-label comparison-label-left"><span>❌</span><b>Traditional GPS</b><small>Convoy stranded</small></div>
      </div>
      <input aria-label="Compare traditional GPS with RouteLifeline" type="range" min="8" max="92" value={position} onChange={(event) => setPosition(Number(event.target.value))} />
      <div className="comparison-divider" style={{ left: `${position}%` }}><span>↔</span></div>
    </div>
  );
}

export function CommandCenter() {
  const [simulated, setSimulated] = useState(false);
  const [toast, setToast] = useState(false);

  function simulate() {
    setSimulated(true);
    setToast(true);
    window.setTimeout(() => setToast(false), 4200);
  }

  return (
    <main className="command-page">
      <div className="aurora-layer" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      <header className="command-header">
        <nav className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Primary navigation">
          <a href="#top" className="flex items-center gap-3" aria-label="RouteLifeline home">
            <span className="logo-mark"><Network className="size-4" /></span>
            <span className="font-display text-sm font-bold tracking-[0.08em]">Route<span className="text-primary">Lifeline</span></span>
          </a>
          <div className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:flex">
            <a href="#command" className="story-link">Command center</a>
            <a href="#timeline" className="story-link">Timeline</a>
            <a href="#impact" className="story-link">Impact</a>
          </div>
          <button type="button" onClick={simulate} className="simulate-button"><Sparkles className="size-4" /> <span className="hidden sm:inline">Simulate disaster event</span><span className="sm:hidden">Simulate</span></button>
        </nav>
        <Ticker />
      </header>

      <div className={`alert-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">
        <span className="sticker-siren">🚨</span><div><b>Route C compromised</b><small>Convoy 04 is being rerouted via Ridge Pass.</small></div>
      </div>

      <section id="top" className="hero-command">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 pb-16 pt-40 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:pb-24 lg:pt-48">
          <div className="stagger-in">
            <div className="eyebrow"><Activity className="size-3.5" /> Emergency intelligence network <span>Live</span></div>
            <h1 className="headline-shimmer font-display">The Paralyzed Relief <em>Supply Chain</em></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">When roads fail, conventional GPS fails too. RouteLifeline dynamically reroutes critical relief supplies through safe, accessible paths.</p>
            <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">
              <a className="primary-command-button" href="#command">Explore live command <ArrowRight className="size-4" /></a>
              <a className="secondary-command-button" href="#timeline">View event timeline</a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
              <Stat value={12} label="Routes monitored" tone="safe" />
              <Stat value={4} label="Active convoys" tone="violet" />
              <Stat value={3} label="Critical alerts" tone="warning" />
            </div>
          </div>
          <div className="relative animate-stage-in">
            <RouteMap simulated={simulated} />
            <span className="floating-sticker sticker-truck" aria-label="Active relief convoy">🚚</span>
            <span className="floating-sticker sticker-blood" aria-label="Critical medical cargo">🩸</span>
          </div>
        </div>
      </section>

      <section id="command" className="section-band">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="section-heading reveal-section">
            <div><span className="section-kicker">Operational intelligence</span><h2 className="font-display">Decisions at the speed of the crisis.</h2></div>
            <p>One shared operational picture turns fragmented hazard signals into safe, prioritized movement.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="glass-panel command-feed reveal-section">
              <div className="panel-heading"><span>Network health</span><span className="safe-copy"><i className="status-dot" /> Operational</span></div>
              <div className="feed-grid">
                <div><small>Coverage</small><b>84%</b><div className="progress-track"><i /></div></div>
                <div><small>Sensor confidence</small><b>97.2%</b><div className="progress-track confidence"><i /></div></div>
                <div><small>Safe corridors</small><b>08</b><div className="signal-bars"><i /><i /><i /><i /></div></div>
              </div>
              <div className="signal-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className={`glass-panel priority-panel reveal-section ${simulated ? "is-reordered" : ""}`}>
              <div className="panel-heading"><span>Priority queue</span><span>ETA</span></div>
              <div className="priority-list">
                <div className="priority-row priority-medical"><span className="row-sticker">🩸</span><div><b>Insulin · Convoy 04</b><small>Shelter Alpha</small></div><strong>{simulated ? "18m" : "24m"}</strong></div>
                <div className="priority-row"><span className="row-sticker">🚚</span><div><b>Potable water · Truck 02</b><small>Ridge Camp</small></div><strong>31m</strong></div>
                <div className="priority-row"><span className="row-sticker">🩹</span><div><b>Trauma kits · Unit 07</b><small>Valley Clinic</small></div><strong>42m</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline" className="timeline-section">
        <div className="mx-auto grid max-w-[1300px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-28">
          <div className="reveal-section"><span className="section-kicker">Incident 08-30</span><h2 className="font-display">From impact to delivery.</h2><p className="mt-5 max-w-md text-muted-foreground">RouteLifeline keeps every decision traceable as field conditions evolve.</p></div>
          <ol className="timeline-list">
            {timeline.map(([time, title, copy, icon], index) => <li key={title} className="timeline-item reveal-section" style={{ animationDelay: `${index * 90}ms` }}><span className="timeline-icon">{icon}</span><time>{time}</time><div><h3>{title}</h3><p>{copy}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="section-band comparison-section">
        <div className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="section-heading reveal-section"><div><span className="section-kicker">Route comparison</span><h2 className="font-display">Same crisis. Different outcome.</h2></div><p>Drag the control to compare static navigation with live, safety-aware routing.</p></div>
          <div className="mt-10 reveal-section"><ComparisonSlider /></div>
        </div>
      </section>

      <section id="impact" className="impact-section">
        <div className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="text-center reveal-section"><span className="section-kicker">Field impact</span><h2 className="font-display mx-auto max-w-2xl">Built for the people making impossible calls.</h2></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {quotes.map((item, index) => <article key={item.name} className="glass-panel quote-card reveal-section" style={{ animationDelay: `${index * 100}ms` }}><span className="quote-mark">“</span><blockquote>{item.quote}</blockquote><div className="quote-person"><div><b>{item.name}</b><small>{item.role}</small></div><strong>{item.metric}</strong></div></article>)}
          </div>
        </div>
      </section>

      <footer className="command-footer"><div className="mx-auto flex max-w-[1300px] flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:px-8 lg:px-12"><span className="font-display font-bold text-foreground">Route<span className="text-primary">Lifeline</span></span><span>AI-powered emergency logistics · Command Center Aurora</span></div></footer>

      <div className="live-badge"><span className="status-dot" /> <span><b>System Active</b><small>Monitoring 12 Routes</small></span></div>
    </main>
  );
}