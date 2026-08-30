import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronsLeftRight,
  Menu,
  Navigation,
  Satellite,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

import scenicLandscape from "@/assets/scenic-relief-landscape.jpg";
import satelliteAfter from "@/assets/satellite-valley-after.jpg";
import satelliteBefore from "@/assets/satellite-valley-before.jpg";
import { Button } from "@/components/ui/button";

const analysis = [
  ["Flooded area", "Detected", "water"],
  ["Road access", "Changed", "warning"],
  ["Bridge", "Potentially unsafe", "danger"],
  ["Shelter access", "At risk", "danger"],
];

const story = [
  ["01", "Satellite detects change", "Aligned imagery reveals the flood boundary as it crosses roads and settlements."],
  ["02", "Road accessibility updated", "Submerged intersections and the affected bridge are removed from the accessible network."],
  ["03", "AI recalculates route", "The blocked corridor is rejected and a safe alternative is drawn around the flood zone."],
  ["04", "Relief convoy rerouted", "The updated route guides essential supplies toward the isolated shelter."],
];

function SatelliteComparison() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [view, setView] = useState<"before" | "after" | "compare">("compare");

  function updatePosition(value: number) {
    const next = Math.max(2, Math.min(98, value));
    setPosition(next);
    frameRef.current?.style.setProperty("--split", `${next}%`);
  }

  function selectView(next: "before" | "after" | "compare") {
    setView(next);
    updatePosition(next === "before" ? 98 : next === "after" ? 2 : 50);
  }

  function moveFromPointer(clientX: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    updatePosition(((clientX - bounds.left) / bounds.width) * 100);
    setView("compare");
  }

  return (
    <div className="satellite-product" id="before-after">
      <div className="monitor-toolbar">
        <div>
          <span className="eyebrow">SIMULATED SATELLITE VIEW</span>
          <strong>Valley road accessibility</strong>
        </div>
        <div className="view-switch" aria-label="Satellite view mode">
          <Button variant="ghost" className={view === "before" ? "is-active" : ""} onClick={() => selectView("before")}>Before flood</Button>
          <Button variant="ghost" className={view === "compare" ? "is-active" : ""} onClick={() => selectView("compare")}>Compare</Button>
          <Button variant="ghost" className={view === "after" ? "is-active" : ""} onClick={() => selectView("after")}>After flood</Button>
        </div>
      </div>

      <div
        ref={frameRef}
        className="comparison-frame"
        onPointerMove={(event) => { if (event.buttons === 1) moveFromPointer(event.clientX); }}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveFromPointer(event.clientX); }}
      >
        <img src={satelliteAfter} alt="Simulated satellite view after flooding expands across roads and the central intersection" width={1536} height={1024} draggable={false} />
        <div className="before-layer"><img src={satelliteBefore} alt="Simulated satellite view of the same valley before flooding" width={1536} height={1024} draggable={false} /></div>
        <div className="map-shade" />
        <div className="map-label label-before"><span>Before flood</span><b>Road network: accessible</b></div>
        <div className="map-label label-after"><span>After flood</span><b>Road network: partially blocked</b></div>
        <div className="hazard-marker marker-bridge"><i /><span>Affected bridge</span></div>
        <div className="hazard-marker marker-road"><i /><span>Submerged intersection</span></div>
        <div className="comparison-divider" aria-hidden="true"><span><ChevronsLeftRight /></span></div>
        <input
          className="comparison-range"
          type="range"
          min="2"
          max="98"
          value={position}
          onChange={(event) => { updatePosition(Number(event.target.value)); setView("compare"); }}
          aria-label="Reveal before and after flood satellite imagery"
        />
        <div className="simulated-badge"><i /> DEMO SIMULATION</div>
      </div>

      <div className="analysis-strip" aria-label="Satellite change detection results">
        <div className="analysis-title"><Satellite /><div><span>Satellite change detection</span><small>Demo simulation</small></div></div>
        {analysis.map(([label, value, tone]) => <div className={`analysis-item tone-${tone}`} key={label}><span>{label}</span><b><i />{value}</b></div>)}
      </div>
    </div>
  );
}

const walkthrough = [
  { key: "quake", label: "Earthquake", title: "Earthquake strikes", copy: "Hillside debris flows destabilise arterial highways and rural feeder roads." },
  { key: "flood", label: "Flood", title: "Tributaries overflow", copy: "Intersections submerge under fast-moving water and a bridge is flagged unsafe." },
  { key: "gps", label: "GPS Failure", title: "Conventional GPS fails", copy: "Maps still route the convoy into the blocked corridor, so it is forced to turn back." },
  { key: "ai", label: "AI Rerouting", title: "AI reroutes relief", copy: "Detected hazards are removed from the network and a safe corridor guides the convoy in." },
] as const;

function useWalkthrough() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      setStage((current) => {
        if (current >= walkthrough.length - 1) { setPlaying(false); return current; }
        return current + 1;
      });
    }, 3600);
    return () => window.clearTimeout(id);
  }, [playing, stage]);

  return { stage, setStage, playing, setPlaying };
}

type WalkthroughState = ReturnType<typeof useWalkthrough>;

function WalkthroughControls({ state, variant }: { state: WalkthroughState; variant: "hero" | "map" }) {
  const { stage, setStage, playing, setPlaying } = state;
  const step = walkthrough[stage];
  const last = stage === walkthrough.length - 1;

  return (
    <div className={`walkthrough walkthrough-${variant}`} aria-label="Guided disaster walkthrough">
      <div className="walkthrough-steps" role="tablist">
        {walkthrough.map((item, index) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={index === stage}
            className={`walkthrough-step ${index === stage ? "is-current" : ""} ${index < stage ? "is-done" : ""}`}
            onClick={() => { setPlaying(false); setStage(index); }}
          >
            <i />
            <span>{`0${index + 1}`}</span>
            <b>{item.label}</b>
          </button>
        ))}
      </div>
      <div className="walkthrough-body">
        <div className="walkthrough-copy" aria-live="polite">
          <strong>{step.title}</strong>
          <p>{step.copy}</p>
        </div>
        <div className="walkthrough-actions">
          <Button variant="ghost" onClick={() => { setPlaying(false); setStage(Math.max(0, stage - 1)); }} disabled={stage === 0}>Back</Button>
          <Button
            onClick={() => {
              if (last) { setStage(0); setPlaying(true); return; }
              setPlaying(false);
              setStage(stage + 1);
            }}
          >
            {last ? <><RotateCcw /> Replay</> : <>Next <ArrowRight /></>}
          </Button>
          <Button variant="outline" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause walkthrough" : "Autoplay walkthrough"}>
            {playing ? <Pause /> : <Play />}{playing ? "Pause" : "Autoplay"}
          </Button>
        </div>
      </div>
      <div className="walkthrough-progress" aria-hidden="true"><i style={{ width: `${((stage + 1) / walkthrough.length) * 100}%` }} /></div>
    </div>
  );
}

function RoutingMap({ state }: { state: WalkthroughState }) {
  const { stage, setStage, setPlaying } = state;
  return (
    <div className={`routing-map stage-${stage} ${stage >= 3 ? "is-active" : ""}`}>
      <svg viewBox="0 0 1000 500" role="img" aria-label="AI reroutes a relief vehicle away from a flooded road to a shelter">
        <path className="terrain-line terrain-a" d="M10 125C155 30 220 164 340 91s226-36 306 42 180 15 344-77" />
        <path className="terrain-line terrain-b" d="M-20 382c141-94 258-19 347-79s171-64 273-8 230 22 420-75" />
        <path className="river-route" d="M-20 258c128-69 188 29 302-25s160-19 245 41 182 25 245-22 129-46 248-2" />
        <path className="road-line" d="M120 340C270 322 284 198 430 208s188 137 307 69 124-43 173-18" />
        <path className="blocked-route" d="M120 340C270 322 284 198 430 208s92 54 136 59" />
        <path className="safe-route" d="M120 340C224 379 323 403 430 354s176-91 263-23 143-15 217-72" />
      </svg>
      <div className="map-node node-warehouse"><Warehouse /><span>Warehouse</span></div>
      <div className="map-node node-hazard"><X /><span>{stage >= 1 ? "Flooded road" : "Damaged road"}</span></div>
      <div className="map-node node-shelter"><Check /><span>Relief shelter</span></div>
      <div className="route-truck"><Truck /></div>
      <div className="stage-tag"><i />{`STEP 0${stage + 1} — ${walkthrough[stage].label.toUpperCase()}`}</div>
      <div className="route-key"><span><i className="blocked" /> Original route</span><span><i className="safe" /> AI alternative</span></div>
      <Button className="recalculate-button" onClick={() => { setPlaying(false); setStage(3); }}><Navigation />{stage >= 3 ? "Route recalculated" : "Recalculate route"}</Button>
    </div>
  );
}


export function SatelliteExperience() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="satellite-page">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="wordmark" href="#top">RELIEF.AI</a>
          <div className={`nav-menu ${menuOpen ? "is-open" : ""}`}>
            <a href="#problem" onClick={() => setMenuOpen(false)}>Problem</a>
            <a href="#satellite-monitor" onClick={() => setMenuOpen(false)}>Satellite Monitor</a>
            <a href="#before-after" onClick={() => setMenuOpen(false)}>Before / After</a>
            <a href="#ai-routing" onClick={() => setMenuOpen(false)}>AI Routing</a>
          </div>
          <Button asChild className="launch-demo"><a href="#satellite-monitor">Launch demo <ArrowRight /></a></Button>
          <Button variant="ghost" size="icon" className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</Button>
        </nav>
      </header>

      <section id="top" className="scenic-hero">
        <img className="scenic-background" src={scenicLandscape} alt="Mountain river valley viewed through soft morning mist" width={1920} height={1080} />
        <div className="scenic-overlay" />
        <div className="hero-panel">
          <span className="eyebrow">Satellite emergency monitoring</span>
          <h1>The Paralyzed<br /><span>Relief Supply Chain</span></h1>
          <p>When floods transform roads in minutes, satellite intelligence reveals what conventional maps cannot.</p>
          <div className="hero-actions">
            <Button asChild size="lg"><a href="#satellite-monitor">Explore satellite monitor <ArrowRight /></a></Button>
            <Button asChild size="lg" variant="outline"><a href="#before-after">View before / after</a></Button>
          </div>
          <div className="live-status"><i /> Live monitoring simulation</div>
        </div>
        <a className="scroll-cue" href="#problem" aria-label="Scroll to the problem"><span>Discover</span><ArrowDown /></a>
      </section>

      <section id="problem" className="problem-intro reveal-block">
        <span className="eyebrow dark-label">The map before</span>
        <h2>One valley. Two realities.</h2>
        <p>Conventional maps preserve yesterday’s road network. Satellite monitoring exposes the moment floodwater makes that network unreliable.</p>
      </section>

      <section id="satellite-monitor" className="monitor-section">
        <div className="section-heading reveal-block"><span className="eyebrow dark-label">Satellite monitor</span><h2>See the landscape change.</h2><p>Drag the divider to compare the same geography before and after flooding.</p></div>
        <SatelliteComparison />
      </section>

      <section className="change-story">
        <div className="story-intro reveal-block"><span className="eyebrow dark-label">The map changes</span><h2>Detection becomes direction.</h2></div>
        <ol className="story-steps">
          {story.map(([number, title, copy]) => <li key={number} className="reveal-block"><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}
        </ol>
      </section>

      <section id="ai-routing" className="routing-section">
        <div className="routing-copy reveal-block"><span className="eyebrow">AI routing</span><h2>A safer path appears.</h2><p>The detected flood removes the failed corridor. The route engine redirects relief around the hazard and toward the shelter.</p></div>
        <RoutingMap />
      </section>

      <section className="delivery-section reveal-block">
        <span className="eyebrow dark-label">Relief delivery</span>
        <h2>Essentials reach the shelter.</h2>
        <p>Satellite change detection keeps the route grounded in what is accessible now—not what the map remembered.</p>
        <Button asChild size="lg"><a href="#satellite-monitor">Replay comparison <ArrowRight /></a></Button>
      </section>

      <footer><a className="wordmark" href="#top">RELIEF.AI</a><span>Satellite-based flood & road accessibility monitoring</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}