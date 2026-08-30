import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Minus,
  Mountain,
  Package,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Upload,
  Waves,
} from "lucide-react";

import demoMap from "@/assets/demo-satellite-map.jpg";
import satelliteBefore from "@/assets/satellite-valley-before.jpg";
import satelliteAfter from "@/assets/satellite-valley-after.jpg";

type ScenarioKey = "flood" | "landslide" | "blockage" | "bridge";
type Stage = "idle" | "disaster" | "blocked" | "analyzing" | "rerouting" | "delivering" | "delivered";

type Hazard = {
  id: string;
  label: string;
  x: number;
  y: number;
  tone: "danger" | "warning" | "water" | "purple" | "dark";
  severity: string;
  impact: string;
};

type Scenario = {
  label: string;
  emoji: string;
  detected: string;
  hazardLabel: string;
  zone: string;
  zoneTone: string;
  hazards: Hazard[];
  blocked: { d: string; x: number; y: number };
  original: string;
  safe: string;
  roads: [string, string][];
  stats: [string, string][];
  recommendation: string;
};

const WAREHOUSE = { x: 11, y: 80 };
const SHELTER = { x: 88, y: 17 };

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  flood: {
    label: "Flood",
    emoji: "🌊",
    detected: "FLOOD DETECTED",
    hazardLabel: "Flood",
    zone: "M38 42 L62 34 L74 46 L70 64 L48 70 L34 60 Z",
    zoneTone: "water",
    hazards: [
      { id: "f1", label: "Flood zone", x: 53, y: 52, tone: "water", severity: "HIGH", impact: "BLOCKED" },
      { id: "f2", label: "Submerged intersection", x: 40, y: 63, tone: "danger", severity: "HIGH", impact: "BLOCKED" },
      { id: "f3", label: "Rising water margin", x: 70, y: 44, tone: "warning", severity: "MODERATE", impact: "RESTRICTED" },
    ],
    blocked: { d: "M44 60 L58 46", x: 51, y: 53 },
    original: "M11 80 L26 72 L36 66 L44 60 L58 46 L72 32 L88 17",
    safe: "M11 80 L18 62 L26 44 L42 30 L60 22 L74 15 L88 17",
    roads: [
      ["NH-27 (demo)", "BLOCKED"],
      ["Rural link RL-4 (demo)", "SUBMERGED"],
      ["River bridge S7 (demo)", "UNSAFE"],
      ["Ridge pass RP-2 (demo)", "OPEN"],
    ],
    stats: [["Affected roads", "7"], ["Unsafe bridges", "2"], ["Safe routes", "3"]],
    recommendation: "Northern ridge corridor avoids the flood basin.",
  },
  landslide: {
    label: "Landslide",
    emoji: "🏔",
    detected: "LANDSLIDE DETECTED",
    hazardLabel: "Landslide",
    zone: "M18 46 L34 36 L44 46 L38 60 L22 62 Z",
    zoneTone: "purple",
    hazards: [
      { id: "l1", label: "Landslide zone", x: 30, y: 48, tone: "purple", severity: "HIGH", impact: "BLOCKED" },
      { id: "l2", label: "Slope instability", x: 22, y: 60, tone: "warning", severity: "MODERATE", impact: "RESTRICTED" },
    ],
    blocked: { d: "M26 60 L34 46", x: 30, y: 53 },
    original: "M11 80 L18 70 L26 60 L34 46 L52 34 L70 26 L88 17",
    safe: "M11 80 L28 86 L50 80 L66 62 L78 38 L88 17",
    roads: [
      ["Hill road HR-9 (demo)", "BLOCKED"],
      ["Mountain spur MS-3 (demo)", "UNSAFE"],
      ["Valley bypass VB-1 (demo)", "OPEN"],
    ],
    stats: [["Affected roads", "4"], ["Unsafe slopes", "3"], ["Safe routes", "2"]],
    recommendation: "Lower valley bypass avoids the unstable slope.",
  },
  blockage: {
    label: "Road blockage",
    emoji: "🛣",
    detected: "ROAD BLOCKAGE DETECTED",
    hazardLabel: "Road blockage",
    zone: "",
    zoneTone: "danger",
    hazards: [
      { id: "b1", label: "Debris blockage", x: 62, y: 40, tone: "danger", severity: "HIGH", impact: "BLOCKED" },
      { id: "b2", label: "Congestion build-up", x: 48, y: 52, tone: "warning", severity: "MODERATE", impact: "SLOW" },
    ],
    blocked: { d: "M56 46 L68 34", x: 62, y: 40 },
    original: "M11 80 L26 72 L40 60 L56 46 L68 34 L88 17",
    safe: "M11 80 L30 74 L48 66 L64 56 L78 36 L88 17",
    roads: [
      ["NH-27 segment 4 (demo)", "BLOCKED"],
      ["Service road SR-2 (demo)", "OPEN"],
      ["Town link TL-6 (demo)", "OPEN"],
    ],
    stats: [["Affected roads", "3"], ["Unsafe bridges", "0"], ["Safe routes", "4"]],
    recommendation: "Service road detour restores access to the shelter.",
  },
  bridge: {
    label: "Bridge failure",
    emoji: "🌉",
    detected: "BRIDGE FAILURE DETECTED",
    hazardLabel: "Bridge failure",
    zone: "",
    zoneTone: "dark",
    hazards: [
      { id: "br1", label: "Bridge S7", x: 52, y: 45, tone: "dark", severity: "CRITICAL", impact: "UNSAFE FOR HEAVY VEHICLES" },
      { id: "br2", label: "Approach ramp", x: 44, y: 55, tone: "warning", severity: "MODERATE", impact: "RESTRICTED" },
    ],
    blocked: { d: "M46 54 L58 40", x: 52, y: 46 },
    original: "M11 80 L26 72 L38 62 L46 54 L58 40 L72 30 L88 17",
    safe: "M11 80 L20 60 L32 42 L50 28 L68 20 L88 17",
    roads: [
      ["River bridge S7 (demo)", "UNSAFE"],
      ["North crossing NC-1 (demo)", "OPEN"],
      ["NH-27 (demo)", "OPEN"],
    ],
    stats: [["Affected roads", "2"], ["Unsafe bridges", "1"], ["Safe routes", "2"]],
    recommendation: "North crossing supports heavy relief vehicles.",
  },
};

const ANALYSIS_STEPS = ["SCANNING HAZARDS", "CHECKING ROAD ACCESS", "ANALYZING ALTERNATIVES", "CALCULATING SAFE ROUTE", "ROUTE FOUND ✓"];
const UPLOAD_STEPS = ["IMAGE RECEIVED ✓", "DETECTING ROADS", "IDENTIFYING HAZARDS", "ANALYZING BLOCKAGES", "CALCULATING ROUTES", "SAFE PATH GENERATED ✓"];

const SUPPLIES = [
  { id: "insulin", label: "Insulin", emoji: "💉", critical: true },
  { id: "blood", label: "Blood bags", emoji: "🩸", critical: true },
  { id: "infant", label: "Infant nutrition", emoji: "👶", critical: true },
  { id: "water", label: "Potable water", emoji: "💧", critical: false },
  { id: "general", label: "General relief", emoji: "📦", critical: false },
];

function useVehicle(pathRef: React.RefObject<SVGPathElement | null>, active: boolean, duration: number, stop: number, onDone: () => void) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!active) { setPos(null); return; }
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, stop);
      const point = path.getPointAtLength(total * t);
      setPos({ x: point.x, y: point.y });
      if (t < stop) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, duration, stop]);
  return pos;
}

export function ReliefDemo() {
  const [scenario, setScenario] = useState<ScenarioKey>("flood");
  const [stage, setStage] = useState<Stage>("idle");
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [zoom, setZoom] = useState(1);
  const [supply, setSupply] = useState("insulin");
  const [compare, setCompare] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [upload, setUpload] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState(-1);
  const [dropActive, setDropActive] = useState(false);
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");

  const timers = useRef<number[]>([]);
  const originalRef = useRef<SVGPathElement>(null);
  const safeRef = useRef<SVGPathElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const data = SCENARIOS[scenario];
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setStage("idle");
    setAnalysisStep(-1);
    setSelectedHazard(null);
  }, [clearTimers]);

  const run = useCallback(() => {
    clearTimers();
    setAnalysisStep(-1);
    setSelectedHazard(null);
    setStage("disaster");
    later(() => setStage("blocked"), 1200);
  }, [clearTimers, later]);

  useEffect(() => { reset(); }, [scenario, reset]);

  // vehicle on original route stops at the blockage
  const blockedPos = useVehicle(originalRef, stage === "blocked", 2600, 0.52, () => {
    setStage("analyzing");
    ANALYSIS_STEPS.forEach((_, i) => later(() => setAnalysisStep(i), 500 * (i + 1)));
    later(() => setStage("rerouting"), 500 * (ANALYSIS_STEPS.length + 1));
    later(() => setStage("delivering"), 500 * ANALYSIS_STEPS.length + 1600);
  });
  const safePos = useVehicle(safeRef, stage === "delivering", 3400, 1, () => setStage("delivered"));

  const vehicle = stage === "delivering" ? safePos : stage === "blocked" ? blockedPos : null;
  const stalled = stage === "analyzing" || stage === "rerouting";
  const showDisaster = stage !== "idle";
  const showSafe = stage === "rerouting" || stage === "delivering" || stage === "delivered";

  const statusLine = useMemo(() => {
    switch (stage) {
      case "idle": return "Standing by — normal network";
      case "disaster": return data.detected;
      case "blocked": return "VEHICLE STOPPED · ROUTE BLOCKED";
      case "analyzing": return "MYRELIEF.AI ANALYZING...";
      case "rerouting": return "SAFE & EFFICIENT ROUTE GENERATED";
      case "delivering": return "RELIEF VEHICLE EN ROUTE";
      default: return "DELIVERY REACHED ✓";
    }
  }, [stage, data.detected]);

  // comparison slider
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const rect = compareRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCompare(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)));
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragging]);

  function handleFile(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUpload(url);
    setUploadStep(-1);
    UPLOAD_STEPS.forEach((_, i) => window.setTimeout(() => setUploadStep(i), 600 * (i + 1)));
  }

  const criticalSupply = SUPPLIES.find((item) => item.id === supply)?.critical;

  return (
    <main className="demo-page">
      <header className="demo-header">
        <Link to="/" className="demo-back"><ArrowLeft /> Back to MyRelief.ai</Link>
        <div className="demo-brand">
          <b>MYRELIEF.AI</b>
          <small>Emergency Route Intelligence</small>
        </div>
        <div className="demo-header-right">
          <span className="demo-status"><i /> SYSTEM ONLINE</span>
          <Link to="/ai-assistant" className="demo-coach"><Sparkles /> Ask AI Coach</Link>
        </div>
      </header>

      <p className="demo-disclaimer">
        <TriangleAlert /> DEMO SIMULATION — all hazards, road names and route metrics on this screen are simulated for demonstration. No live satellite, flood or traffic feeds are connected.
      </p>

      <section className="demo-stage">
        <div className="demo-map-wrap">
          <div className="demo-map-toolbar">
            <div className="demo-run">
              <button type="button" className="demo-primary" onClick={run}><Play /> Run simulation</button>
              <button type="button" className="demo-ghost" onClick={reset}><RotateCcw /> Reset</button>
            </div>
            <div className="demo-zoom">
              <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))} aria-label="Zoom out"><Minus /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(2)))} aria-label="Zoom in"><Plus /></button>
            </div>
          </div>

          <div className={`demo-map scenario-${scenario} stage-${stage}`}>
            <div className="demo-map-inner" style={{ transform: `scale(${zoom})` }}>
              <img src={demoMap} alt="Satellite view of the simulated relief operation area" loading="lazy" width={1600} height={1104} />
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="demo-layer" aria-hidden="true">
                {showDisaster && data.zone ? <path d={data.zone} className={`zone zone-${data.zoneTone}`} /> : null}
                <path ref={originalRef} d={data.original} className={`route route-original ${showDisaster ? "is-unsafe" : ""} ${showSafe ? "is-retired" : ""}`} />
                {showDisaster ? <path d={data.blocked.d} className="route route-blocked" /> : null}
                <path ref={safeRef} d={data.safe} className={`route route-safe ${showSafe ? "is-drawn" : ""}`} />
              </svg>

              <button type="button" className="demo-pin pin-warehouse" style={{ left: `${WAREHOUSE.x}%`, top: `${WAREHOUSE.y}%` }} onClick={() => setSelectedHazard({ id: "wh", label: "Relief warehouse", x: WAREHOUSE.x, y: WAREHOUSE.y, tone: "warning", severity: "STAGING", impact: "DISPATCH POINT" })}>
                <span>📦</span><b>Warehouse</b>
              </button>
              <button type="button" className="demo-pin pin-shelter" style={{ left: `${SHELTER.x}%`, top: `${SHELTER.y}%` }} onClick={() => setSelectedHazard({ id: "sh", label: "Shelter Alpha", x: SHELTER.x, y: SHELTER.y, tone: "danger", severity: "ISOLATED", impact: "AWAITING SUPPLIES" })}>
                <span>📍</span><b>Shelter Alpha</b>
              </button>

              {showDisaster ? data.hazards.map((hazard) => (
                <button key={hazard.id} type="button" className={`demo-hazard hazard-${hazard.tone}`} style={{ left: `${hazard.x}%`, top: `${hazard.y}%` }} onClick={() => setSelectedHazard(hazard)} aria-label={hazard.label}>
                  <i />
                </button>
              )) : null}

              {vehicle ? (
                <div className={`demo-vehicle ${stalled ? "is-stalled" : ""}`} style={{ left: `${vehicle.x}%`, top: `${vehicle.y}%` }}>🚚</div>
              ) : null}
              {stalled ? (
                <div className="demo-vehicle is-stalled" style={{ left: `${data.blocked.x}%`, top: `${data.blocked.y}%` }}>🚚</div>
              ) : null}
              {stage === "delivered" ? <div className="demo-delivered" style={{ left: `${SHELTER.x}%`, top: `${SHELTER.y}%` }}><CheckCircle2 /> DELIVERY REACHED</div> : null}
            </div>

            <div className={`demo-banner ${showDisaster ? "is-visible" : ""}`}>{statusLine}</div>

            {selectedHazard ? (
              <div className="demo-hazard-card" role="dialog" aria-label={selectedHazard.label}>
                <button type="button" onClick={() => setSelectedHazard(null)} aria-label="Close">×</button>
                <small>{selectedHazard.label.toUpperCase()}</small>
                <p>Severity<b>{selectedHazard.severity}</b></p>
                <p>Road impact<b>{selectedHazard.impact}</b></p>
                <p>Status<b>DEMO SIMULATION</b></p>
              </div>
            ) : null}

            <ul className="demo-legend">
              <li><i className="water" /> Flood zone</li>
              <li><i className="danger" /> Blocked road</li>
              <li><i className="safe" /> Safe route</li>
              <li><i className="vehicle" /> Relief vehicle</li>
            </ul>
          </div>
        </div>

        <aside className="demo-panel">
          <div className="demo-card">
            <header><small>DISASTER SCENARIO</small></header>
            <div className="demo-scenarios">
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
                <button key={key} type="button" className={scenario === key ? "is-active" : ""} onClick={() => setScenario(key)}>
                  <span>{SCENARIOS[key].emoji}</span>{SCENARIOS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-card">
            <header><small>MYRELIEF.AI LIVE SCENARIO</small><span className="demo-tag">DEMO SIMULATION</span></header>
            <div className="demo-rows">
              <p>Hazard<b>{data.hazardLabel}</b></p>
              <p>Status<b className={showDisaster ? "is-critical" : ""}>{showDisaster ? "CRITICAL" : "NOMINAL"}</b></p>
              {data.stats.map(([label, value]) => <p key={label}>{label}<b>{value}</b></p>)}
              <p>Current route<b className={showSafe ? "" : showDisaster ? "is-critical" : ""}>{showSafe ? "REROUTED" : showDisaster ? "⚠ BLOCKED" : "OPEN"}</b></p>
              <p>Recommended route<b className="is-safe">{showSafe ? "✓ SAFE" : "PENDING"}</b></p>
            </div>
          </div>

          <div className="demo-card">
            <header><small>ROAD STATUS</small></header>
            <div className="demo-rows">
              {data.roads.map(([name, status]) => (
                <p key={name}>{name}<b className={status === "OPEN" ? "is-safe" : "is-critical"}>{status === "OPEN" ? "OPEN" : `⚠ ${status}`}</b></p>
              ))}
            </div>
          </div>

          <div className="demo-card">
            <header><small>AI ANALYSIS</small></header>
            <ol className="demo-steps">
              {ANALYSIS_STEPS.map((step, index) => (
                <li key={step} className={index <= analysisStep ? "is-done" : ""}>{step}</li>
              ))}
            </ol>
            <p className="demo-note">{showSafe ? data.recommendation : "Run the simulation to generate a safe & efficient route."}</p>
          </div>

          <div className="demo-card">
            <header><small>RELIEF PRIORITY</small></header>
            <div className="demo-supplies">
              {SUPPLIES.map((item) => (
                <button key={item.id} type="button" className={supply === item.id ? "is-active" : ""} onClick={() => setSupply(item.id)}>
                  <span>{item.emoji}</span>{item.label}
                </button>
              ))}
            </div>
            {criticalSupply ? <p className="demo-priority"><TriangleAlert /> HIGH PRIORITY DELIVERY — routing favours safety and access</p> : <p className="demo-note">Standard priority — routing balances safety and travel time.</p>}
          </div>
        </aside>
      </section>

      <section className="demo-section">
        <div className="demo-section-head">
          <h2>Satellite change analysis</h2>
          <p>BEFORE vs AFTER — drag the divider to compare the same corridor. Imagery is illustrative demo data.</p>
        </div>
        <div className="demo-compare" ref={compareRef}>
          <img src={satelliteBefore} alt="Satellite view of the valley before the event" loading="lazy" />
          <div className="demo-compare-after" style={{ clipPath: `inset(0 0 0 ${compare}%)` }}>
            <img src={satelliteAfter} alt="Satellite view of the valley after the event" loading="lazy" />
          </div>
          <span className="demo-compare-label left">BEFORE</span>
          <span className="demo-compare-label right">AFTER</span>
          <div className="demo-compare-handle" style={{ left: `${compare}%` }} onPointerDown={() => setDragging(true)} role="slider" aria-label="Compare before and after" aria-valuenow={Math.round(compare)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") setCompare((value) => Math.max(0, value - 4));
              if (event.key === "ArrowRight") setCompare((value) => Math.min(100, value + 4));
            }}>
            <i />
          </div>
        </div>
        <div className="demo-changes">
          <span><Waves /> Water extent increased across the basin</span>
          <span><TriangleAlert /> Two crossings flagged unsafe</span>
          <span><Mountain /> Ridge corridor remains accessible</span>
        </div>
      </section>

      <section className="demo-section demo-upload-section">
        <div className="demo-section-head">
          <h2>Upload your location</h2>
          <p>Analyze your own area and find a safer relief route. Results are labelled DEMO ANALYSIS — no geolocated routing is performed.</p>
        </div>
        <div className="demo-upload-grid">
          <div
            className={`demo-dropzone ${dropActive ? "is-active" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDropActive(true); }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(event) => { event.preventDefault(); setDropActive(false); handleFile(event.dataTransfer.files?.[0]); }}
          >
            <Upload />
            <b>Upload your satellite screenshot or map image</b>
            <small>Supported: PNG / JPG / JPEG · or drag &amp; drop</small>
            <label className="demo-primary">
              <Plus /> Upload location
              <input type="file" accept="image/png,image/jpeg" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
            <div className="demo-fields">
              <label>Start location<input value={start} onChange={(event) => setStart(event.target.value)} placeholder="Enter starting location" /></label>
              <label>Destination<input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Enter shelter / destination" /></label>
              <button type="button" className="demo-primary" onClick={() => upload && setUploadStep(0)} disabled={!upload}>Analyze route <ArrowRight /></button>
            </div>
          </div>

          <div className="demo-analysis">
            <header><small>YOUR AREA ANALYSIS</small><span className="demo-tag">DEMO ANALYSIS</span></header>
            {upload ? (
              <>
                <div className="demo-analysis-image">
                  <img src={upload} alt="Uploaded map or satellite screenshot" />
                  {uploadStep >= UPLOAD_STEPS.length - 1 ? (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M14 78 L34 62 L58 44 L84 22" className="route route-safe is-drawn" />
                      <circle cx="52" cy="58" r="9" className="zone zone-danger" />
                      <circle cx="72" cy="40" r="7" className="zone zone-warning" />
                    </svg>
                  ) : null}
                  {uploadStep >= UPLOAD_STEPS.length - 1 ? (
                    <div className="demo-overlay-key"><span>🔴 Blocked area</span><span>🟠 Hazard zone</span><span>🟢 Recommended route</span><span>📍 Start</span><span>🏠 Destination</span></div>
                  ) : null}
                </div>
                <ol className="demo-steps">
                  {UPLOAD_STEPS.map((step, index) => <li key={step} className={index <= uploadStep ? "is-done" : ""}>{step}</li>)}
                </ol>
                {uploadStep >= UPLOAD_STEPS.length - 1 ? (
                  <div className="demo-rows">
                    <p>MyRelief.AI recommendation<b className="is-safe">Potentially safer alternative path identified</b></p>
                    <p>Original path<b className="is-critical">⚠ BLOCKED</b></p>
                    <p>Recommended path<b className="is-safe">✓ ALTERNATIVE</b></p>
                    {start || destination ? <p>Corridor<b>{start || "Start"} → {destination || "Destination"}</b></p> : null}
                  </div>
                ) : <p className="demo-note">ANALYZING LOCATION…</p>}
              </>
            ) : (
              <div className="demo-empty"><Package /><p>Upload an image to run a demo analysis of roads, hazards and alternative routes.</p></div>
            )}
          </div>
        </div>
      </section>

      <section className="demo-section demo-coach-band">
        <div>
          <h2>Ask AI Coach</h2>
          <p>“Why is this route blocked?” · “Which route is safer?” · “What changed after the flood?” · “Which road should the convoy avoid?”</p>
        </div>
        <Link to="/ai-assistant" className="demo-primary"><Sparkles /> Open AI Coach</Link>
      </section>

      <footer className="demo-footer"><Droplets /> MyRelief.AI demo simulation · prototype interface, simulated data only</footer>
    </main>
  );
}

export default ReliefDemo;
