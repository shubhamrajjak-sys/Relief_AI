import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Bridge,
  CircleAlert,
  CloudRain,
  Crosshair,
  MapPinned,
  Navigation,
  Radio,
  Route as RouteIcon,
  ShieldCheck,
  Truck,
  Warehouse,
  Waves,
} from "lucide-react";

import type { TwinSelection } from "@/components/disaster-digital-twin";

const DisasterDigitalTwin = lazy(() => import("@/components/disaster-digital-twin"));

const tickerItems = [
  ["BRIDGE S7", "STRUCTURAL RISK DETECTED", "critical"],
  ["CONVOY 02", "DELIVERED TO SHELTER ALPHA", "safe"],
  ["ROUTE C", "WATER LEVEL +0.3M", "warning"],
  ["RIDGE PASS", "ACCESS VERIFIED", "safe"],
  ["CARGO 04", "INSULIN PRIORITY ELEVATED", "critical"],
];

const timeline = [
  ["01", "06:42", "Disaster", "Earthquake destabilizes the river valley and surrounding hills."],
  ["02", "06:51", "Road network collapses", "Debris blocks arterial roads; Bridge S7 reports structural damage."],
  ["03", "07:01", "GPS fails", "Static navigation continues directing heavy vehicles into compromised corridors."],
  ["04", "07:03", "AI detects hazards", "Flood, bridge, and accessibility signals are fused into one live network."],
  ["05", "07:04", "AI reroutes relief", "Priority cargo is redirected around the flood through Ridge Pass."],
  ["06", "07:39", "Supplies arrive", "The convoy reaches the isolated shelter through a verified corridor."],
];

const problemCards = [
  { number: "01", title: "Damaged roads", copy: "Earthquake and landslides make arterial and rural roads unsafe.", icon: RouteIcon },
  { number: "02", title: "Flooded intersections", copy: "Fast-moving water changes road accessibility in real time.", icon: Waves },
  { number: "03", title: "Unsafe bridges", copy: "Structural damage prevents heavy relief vehicles from crossing.", icon: Bridge },
  { number: "04", title: "Stranded convoys", copy: "Conventional GPS continues routing vehicles toward hazards.", icon: Truck },
];

const selectionDetails: Record<TwinSelection, { eyebrow: string; title: string; rows: string[]; tone: string }> = {
  flood: { eyebrow: "Road status", title: "Route C · Flooded", rows: ["Flood depth  1.8M", "Vehicle access  BLOCKED", "Risk  HIGH"], tone: "danger" },
  convoy: { eyebrow: "Vehicle", title: "Convoy #07", rows: ["Cargo  INSULIN + BLOOD", "Status  REROUTING", "Priority  CRITICAL"], tone: "safe" },
  bridge: { eyebrow: "Bridge status", title: "Bridge S7 · Unsafe", rows: ["Integrity  COMPROMISED", "Heavy access  BLOCKED", "Inspection  PENDING"], tone: "danger" },
  shelter: { eyebrow: "Relief shelter", title: "Shelter Alpha", rows: ["Access  ISOLATED", "Need  MEDICAL SUPPLIES", "Route  VERIFIED"], tone: "safe" },
};

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
        const progress = Math.min((now - start) / 850, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
  return { ref, value };
}

function Ticker() {
  return (
    <div className="ticker-shell" aria-label="Live situation updates">
      <div className="ticker-label"><Radio /> LIVE NETWORK</div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map(([label, copy, tone], index) => (
            <span key={`${label}-${index}`} className={`ticker-item ticker-${tone}`}><b>{label}</b>{copy}<i /></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ hidden }: { hidden: boolean }) {
  return (
    <div className={`boot-screen ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden}>
      <div className="boot-mark"><span>RELIEF</span><b>.AI</b></div>
      <div className="boot-track"><i /></div>
      <div className="boot-lines"><span>INITIALIZING EMERGENCY NETWORK</span><span>LOADING DIGITAL TERRAIN</span><span>CONNECTING ROUTE ENGINE</span><b>SYSTEM READY ✓</b></div>
    </div>
  );
}

function SceneFallback() {
  return <div className="scene-fallback"><div className="scene-grid" /><span>LOADING DIGITAL TERRAIN…</span></div>;
}

function HeroTwin({ simulated, onSelect, selection, reducedMotion }: { simulated: boolean; onSelect: (value: TwinSelection) => void; selection: TwinSelection; reducedMotion: boolean }) {
  const detail = selectionDetails[selection];
  return (
    <div className={`twin-shell ${simulated ? "is-rerouting" : ""}`}>
      <div className="twin-topbar"><span><i /> LIVE DIGITAL TWIN</span><b>REGION 08 · 07:14 UTC</b></div>
      <div className="twin-canvas">
        <Suspense fallback={<SceneFallback />}><DisasterDigitalTwin simulated={simulated} reducedMotion={reducedMotion} onSelect={onSelect} /></Suspense>
      </div>
      <div className="twin-card twin-card-road"><small>ROAD STATUS</small><b>NH-27</b><strong>FLOODED</strong></div>
      <div className="twin-card twin-card-route"><small>AI ROUTE</small><b>14.2 KM</b><strong>SAFE ✓</strong></div>
      <div className="twin-card twin-card-cargo"><small>RELIEF PRIORITY</small><b>INSULIN</b><strong>CRITICAL</strong></div>
      <div className={`twin-inspector inspector-${detail.tone}`} aria-live="polite">
        <button type="button" onClick={() => onSelect(selection)} aria-label="Selected map object"><Crosshair /></button>
        <div><small>{detail.eyebrow}</small><b>{detail.title}</b>{detail.rows.map((row) => <span key={row}>{row}</span>)}</div>
      </div>
      <div className="twin-legend"><span><i className="safe" /> SAFE AI ROUTE</span><span><i className="danger" /> UNSAFE GPS ROUTE</span><span>DRAG / HOVER TO INSPECT</span></div>
    </div>
  );
}

function ComparisonSimulation({ simulated, onSimulate }: { simulated: boolean; onSimulate: () => void }) {
  return (
    <div className={`route-simulation ${simulated ? "is-active" : ""}`}>
      <div className="simulation-column traditional-route">
        <div className="sim-heading"><span>01</span><div><small>STATIC NAVIGATION</small><h3>Traditional GPS</h3></div></div>
        <div className="route-diagram"><Warehouse /><i /><Truck /><i /><Waves /><b>×</b></div>
        <div className="route-alert"><CircleAlert /> ROUTE CONTINUES INTO FLOOD ZONE</div>
      </div>
      <div className="simulation-switch"><button type="button" onClick={onSimulate} aria-label="Run AI route simulation"><Navigation /><span>{simulated ? "ROUTE RECALCULATED" : "RUN REROUTE"}</span></button></div>
      <div className="simulation-column ai-route">
        <div className="sim-heading"><span>02</span><div><small>LIVE NETWORK INTELLIGENCE</small><h3>AI Dynamic Routing</h3></div></div>
        <div className="route-diagram"><Warehouse /><i /><Crosshair /><i /><RouteIcon /><i /><ShieldCheck /></div>
        <div className="route-success"><ShieldCheck /> VERIFIED CORRIDOR TO SHELTER ALPHA</div>
      </div>
    </div>
  );
}

function DemoMetric({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Activity }) {
  const counter = useCountUp(value);
  return <div className="demo-metric"><Icon /><span ref={counter.ref}>{counter.value === 0 ? "—" : counter.value === 24 ? "24/7" : `${counter.value.toString().padStart(2, "0")}`}</span><small>{label}</small></div>;
}

export function CommandCenter() {
  const [simulated, setSimulated] = useState(false);
  const [toast, setToast] = useState(false);
  const [selection, setSelection] = useState<TwinSelection>("flood");
  const [booted, setBooted] = useState(false);
  const [compactNav, setCompactNav] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    const timer = window.setTimeout(() => setBooted(true), media.matches ? 50 : 1320);
    const onScroll = () => setCompactNav(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { media.removeEventListener("change", sync); window.removeEventListener("scroll", onScroll); window.clearTimeout(timer); };
  }, []);

  function simulate() {
    setSimulated(true);
    setSelection("convoy");
    setToast(true);
    window.setTimeout(() => setToast(false), 3800);
  }

  return (
    <main className="relief-page">
      <LoadingScreen hidden={booted} />
      <div className="grid-layer" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      <header className={`relief-header ${compactNav ? "is-compact" : ""}`}>
        <nav className="relief-nav" aria-label="Primary navigation">
          <a href="#top" className="brand" aria-label="RELIEF.AI home"><span className="brand-mark"><RouteIcon /></span><b>RELIEF<span>.AI</span></b></a>
          <div className="nav-links"><a href="#problem">Problem</a><a href="#solution">Solution</a><a href="#how-it-works">How It Works</a><a href="#simulation">Simulation</a><a href="#impact">Impact</a></div>
          <button type="button" onClick={simulate} className="launch-button"><span>Launch Simulation</span><ArrowRight /></button>
        </nav>
        <Ticker />
      </header>

      <div className={`alert-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite"><CircleAlert /><div><b>Hazard detected · Route C</b><small>Convoy 07 rerouting through verified Ridge Pass corridor.</small></div></div>

      <section id="top" className="hero-command">
        <div className="hero-inner">
          <div className="hero-copy stagger-in">
            <div className="system-status"><i /> AI EMERGENCY ROUTING SYSTEM — ONLINE</div>
            <h1>The Paralyzed <span>Relief Supply Chain</span></h1>
            <p>When roads fail, conventional GPS fails too. AI dynamically reroutes critical relief supplies through safe, accessible paths.</p>
            <div className="hero-actions"><a className="primary-cta" href="#solution">Explore the Solution <ArrowRight /></a><a className="secondary-cta" href="#problem">View the Problem</a></div>
            <div className="story-flow" aria-label="Problem to solution flow"><span>DISASTER</span><i>→</i><span>GPS FAILS</span><i>→</i><span>AI REROUTES</span><i>→</i><span>RELIEF ARRIVES</span></div>
          </div>
          <div className="hero-twin animate-stage-in"><HeroTwin simulated={simulated} onSelect={setSelection} selection={selection} reducedMotion={reducedMotion} /></div>
        </div>
      </section>

      <section id="problem" className="problem-section section-band">
        <div className="section-inner">
          <div className="section-heading reveal-section"><div><span className="section-kicker">THE FAILURE CHAIN</span><h2>When the map lies,<br /><em>people wait.</em></h2></div><p>A disaster does not only destroy infrastructure. It invalidates every route decision built on yesterday’s map.</p></div>
          <div className="problem-grid">
            {problemCards.map(({ number, title, copy, icon: Icon }, index) => <article key={title} className="problem-card reveal-section" style={{ animationDelay: `${index * 80}ms` }}><div className="problem-card-top"><span>{number}</span><Icon /></div><div className="mini-scene"><i /><i /><i /><b /></div><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section id="solution" className="solution-section">
        <div className="section-inner">
          <div className="section-heading reveal-section"><div><span className="section-kicker">DYNAMIC ROUTE INTELLIGENCE</span><h2>The map doesn’t stop.<br /><em>It adapts.</em></h2></div><p>RELIEF.AI turns changing field conditions into safe, cargo-aware movement.</p></div>
          <div id="simulation" className="reveal-section"><ComparisonSimulation simulated={simulated} onSimulate={simulate} /></div>
          <div className="capability-row"><span>REAL-TIME HAZARD DETECTION</span><span>DYNAMIC ROUTE OPTIMIZATION</span><span>ROAD ACCESSIBILITY</span><span>RELIEF PRIORITIZATION</span></div>
        </div>
      </section>

      <section id="how-it-works" className="timeline-section section-band">
        <div className="timeline-layout">
          <div className="timeline-intro reveal-section"><span className="section-kicker">HOW IT WORKS</span><h2>From impact<br />to delivery.</h2><p>One shared digital twin keeps every decision traceable as the terrain changes.</p></div>
          <ol className="timeline-list">
            {timeline.map(([number, time, title, copy], index) => <li key={title} className="timeline-item reveal-section" style={{ animationDelay: `${index * 70}ms` }}><span className="timeline-number">{number}</span><time>{time}</time><div><h3>{title}</h3><p>{copy}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section id="impact" className="impact-section">
        <div className="section-inner">
          <div className="demo-heading reveal-section"><div><span className="section-kicker">DEMO SIMULATION</span><h2>Operational clarity,<br />without false certainty.</h2></div><p>Interface states below demonstrate the platform’s monitoring model. They are not real-world performance claims.</p></div>
          <div className="metric-grid reveal-section"><DemoMetric value={24} label="Routes monitored" icon={RouteIcon} /><DemoMetric value={12} label="Hazards detected" icon={CircleAlert} /><DemoMetric value={7} label="Relief vehicles" icon={Truck} /><DemoMetric value={8} label="Safe routes" icon={ShieldCheck} /></div>
          <div className="impact-note reveal-section"><Boxes /><div><small>FIELD COORDINATOR · ILLUSTRATIVE PERSONA</small><blockquote>“The route changed before our drivers reached the flooded junction. Every convoy could see the same verified corridor.”</blockquote></div></div>
        </div>
      </section>

      <footer className="relief-footer"><div><span className="brand"><span className="brand-mark"><RouteIcon /></span><b>RELIEF<span>.AI</span></b></span><p>Emergency logistics intelligence · Hackathon digital twin</p></div><a href="#top">Back to top ↑</a></footer>
      <div className="live-badge"><i /><span><b>SYSTEM ACTIVE</b><small>MONITORING DEMO NETWORK</small></span></div>
    </main>
  );
}
