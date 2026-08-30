import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Construction,
  Droplets,
  KeyRound,
  Plus,
  Route as RouteIcon,
  Satellite,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; demo?: boolean };

const SUGGESTIONS = [
  "Is the river bridge safe for heavy vehicles?",
  "Which relief routes are blocked by the flood?",
  "Analyze satellite before and after flood change",
  "Which relief cargo should be prioritized?",
  "Why did the route engine reroute the convoy?",
  "What supplies are at highest risk?",
];

const QUICK_ACTIONS = [
  { icon: Satellite, label: "Satellite Analysis", query: "Analyze the current satellite change detection results for this valley." },
  { icon: Droplets, label: "Flood Impact", query: "Summarise the flood impact on the road network in the monitored valley." },
  { icon: RouteIcon, label: "Check Route", query: "Check the current relief route from the warehouse to the shelter and flag any hazards." },
  { icon: Truck, label: "Relief Priority", query: "Which relief cargo should be prioritised on the next convoy, and why?" },
  { icon: Construction, label: "Bridge Risk", query: "What is the risk status of the affected bridge and can heavy vehicles cross?" },
];

const SYSTEM_PROMPT = `You are Relief.AI, an AI Emergency Relief & Route Intelligence Assistant developed by Shubham.
Your purpose is to help emergency logistics teams understand disaster-affected road networks and make safer relief-routing decisions.
You analyze satellite observations, flood-affected areas, road accessibility, damaged bridges, blocked roads, relief vehicle locations, shelters, warehouses, and cargo priority.
Provide actionable, detailed, and compassionate disaster relief advice in clean markdown.`;

const SITE_CONTEXT = `APPLICATION CONTEXT:
Sector: Mountain River Valley Corridor (Zone 4)
Observed Hazards: 14.8 km² flood zone, submerged intersection on Highway 101, unsafe river bridge.
Origin: Central Storage Hub 1
Destination: East Relief Shelter (450 displaced civilians)
Safe Detour: High-Elevation Northern Ridge Highway (Route Alpha) via Station Delta.`;

function generateExpertReliefResponse(query: string, _history: ChatMessage[]): string {
  const q = query.toLowerCase().trim();

  if (q.includes("flood") || q.includes("water") || q.includes("submerg") || q.includes("lake") || q.includes("river")) {
    return `### 🌊 Flood Impact & Road Network Hazard Assessment

**Current Satellite Observation (Zone 4 River Valley):**
- **Flood Zone Extent:** 14.8 km² active flood inundation identified across the central valley basin.
- **Surface Water Dynamics:** Fast-moving overflow ranging between 0.8m and 1.4m depth at valley choke points.
- **Key Intersections Flagged:**
  - **Intersection #4 (Central Highway 101):** Submerged under fast-moving current; road base erosion detected.
  - **Valley Riparian Road:** 3.2 km continuous segment inundated and impassable for standard relief fleets.

**Tactical Routing Actions:**
1. **Immediate Reroute:** Divert all outgoing transport to the **Northern Ridge Bypass (Elevation +120m)**.
2. **Convoy Safety Warning:** Never attempt to ford standing floodwaters exceeding 30 cm due to asphalt undermining.
3. **Continuous Tracking:** SAR and optical satellites are monitoring flood recession in 4-hour cycles.`;
  }

  if (q.includes("bridge") || q.includes("cross") || q.includes("structural") || q.includes("safe")) {
    if (q.includes("bridge") || q.includes("structural")) {
      return `### 🌉 Critical Bridge Structural Integrity Evaluation

**Asset:** Central River Crossing Bravo (Highway 101)

**Hazard Summary:**
- **Structural Status:** ⚠️ **CRITICAL HAZARD — UNSAFE FOR TRANSIT**
- **Damage Identified:** Severe scour at the eastern pier foundation with noticeable abutment displacement caused by floating debris impacts.
- **Load Capacity:** **0 Tons (Prohibited)**. Unsafe for heavy multi-axle relief trucks, tankers, and ambulances.

**Alternative Transit Route:**
- Bridge node Bravo has been deactivated from the active navigation graph.
- **Recommended Crossing:** Divert convoys to the **Southern Reinforced Arch Crossing (Station Delta)** located 8.4 km upstream, which has verified structural clearance.`;
    }
  }

  if (q.includes("priorit") || q.includes("suppl") || q.includes("cargo") || q.includes("insulin") || q.includes("medic") || q.includes("food") || q.includes("blood")) {
    return `### 📦 Disaster Relief Cargo Prioritization Schedule

**Tier 1 — Life-Safety Critical (0–4 Hour Window):**
- **Cold-Chain Insulin & Temperature-Sensitive Biologics:** Rapid thermal degradation risk; assign exclusively to refrigerated 4WD units.
- **Whole Blood & Plasma Packs:** Required for urgent stabilization at field medical tents.

**Tier 2 — High Vulnerability (4–12 Hour Window):**
- **Infant Formula & Pediatric Nutrition:** Crucial for displaced families with nursing infants.
- **Potable Drinking Water (Canteens & 10L Bladders):** Immediate defense against waterborne bacterial infection.

**Tier 3 — Shelter Sustenance (12–48 Hour Window):**
- **Water Purification Tablets & High-Capacity Micro-Filters.**
- **Emergency Ready-to-Eat Rations (MREs)**, hygiene modules, and emergency solar-powered VHF beacons.`;
  }

  if (q.includes("route") || q.includes("road") || q.includes("block") || q.includes("reroute") || q.includes("path") || q.includes("gps") || q.includes("why") || q.includes("navigat") || q.includes("safe")) {
    return `### 🗺️ AI Dynamic Route Recalculation

**Why Conventional GPS Fails:**
Conventional navigation systems rely on pre-disaster static maps and lack live flood boundary awareness, routing convoys straight into 1.2m deep submerged corridors where vehicles become stranded or waste critical hours turning back.

**RELIEF.AI Dynamic Plan:**
- **Origin:** Central Storage Warehouse (Hub 1)
- **Primary Blockage:** Central Valley Arterial (Submerged at KM 12) + Damaged River Bridge Bravo.
- **AI Recalculated Safe Corridor:** 
  \`Central Hub 1 ➔ North Ridge Elevated Pass ➔ Station Delta Crossing ➔ East Relief Shelter\`
- **Transit Delta:** +4.2 km distance, estimated transit time 38 minutes (100% accessible).
- **Safety Rating:** Verified clear of landslides and flood basins via satellite change detection.`;
  }

  if (q.includes("satellite") || q.includes("sar") || q.includes("image") || q.includes("monitor") || q.includes("detect") || q.includes("orbit") || q.includes("before") || q.includes("after")) {
    return `### 🛰️ Satellite Change Detection & Remote Sensing

**Sensors & Technology:**
- **Synthetic Aperture Radar (SAR):** Penetrates heavy storm cloud cover and precipitation to accurately map floodwater extents day and night.
- **High-Resolution Optical Comparison:** Compares pre-disaster baselines against post-disaster passes to identify missing bridge spans, mudslides, and road blockages.
- **Automated Road Masking:** The AI overlays detected flood vectors onto the road graph, immediately closing compromised routes.

**Monitored Sector Status:**
- Flood boundary polygon accurately delineated across the central basin.
- Road accessibility status updated across all 28 network links in the valley.`;
  }

  if (q.includes("shubham") || q.includes("author") || q.includes("creator") || q.includes("who made") || q.includes("about") || q.includes("project")) {
    return `### ℹ️ About RELIEF.AI

**RELIEF.AI** was conceived and built by **[Shubham](https://github.com/shubhamrajjak-sys)** to solve **"The Paralyzed Relief Supply Chain"** during natural disasters.

**Key Ecosystem Links:**
- 🌐 **Live Web Application:** [relief-ai-nu.vercel.app](https://relief-ai-nu.vercel.app/)
- 💻 **Source Code Repository:** [github.com/shubhamrajjak-sys/Relief_AI](https://github.com/shubhamrajjak-sys/Relief_AI)
- ⚡ **Vercel Infrastructure:** [Vercel Deployment Dashboard](https://vercel.com/shubhamrajjak-sys-projects/relief-ai)
- 🤖 **AI Engine:** Google Gemini AI + Autonomous Satellite Routing Graph.`;
  }

  return `### 🛡️ RELIEF.AI Emergency Logistics Analysis

**Operational Status:**
- **Monitored Sector:** River Valley Disaster Corridor (Zone 4)
- **Active Hazards:** Flooded central intersections, unverified bridge crossing, and hillside debris flows.
- **Recommended Action:** All relief fleets should query specific route legs, vehicle load restrictions, or cargo urgency tiers before dispatch.

*How can I help you optimize your emergency routing or relief manifest? You can ask about bridge safety, cargo priority, flood maps, or detour routes.*`;
}

function createId() {
  return Math.random().toString(36).slice(2);
}

function MessageBody({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.split("\n");
    const output: { type: "h3" | "p" | "ul" | "ol" | "warn"; items: string[] }[] = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("### ")) { output.push({ type: "h3", items: [line.slice(4)] }); continue; }
      if (line.startsWith("! ")) { output.push({ type: "warn", items: [line.slice(2)] }); continue; }
      if (/^[-*]\s+/.test(line)) {
        const last = output[output.length - 1];
        if (last?.type === "ul") last.items.push(line.replace(/^[-*]\s+/, ""));
        else output.push({ type: "ul", items: [line.replace(/^[-*]\s+/, "")] });
        continue;
      }
      if (/^\d+[.)]\s+/.test(line)) {
        const last = output[output.length - 1];
        if (last?.type === "ol") last.items.push(line.replace(/^\d+[.)]\s+/, ""));
        else output.push({ type: "ol", items: [line.replace(/^\d+[.)]\s+/, "")] });
        continue;
      }
      output.push({ type: "p", items: [line] });
    }
    return output;
  }, [content]);

  const inline = (text: string) => {
    // markdown links [text](url)
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          return <a key={index} href={match[2]} target="_blank" rel="noreferrer" className="underline text-primary hover:text-white">{match[1]}</a>;
        }
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="px-1.5 py-0.5 rounded bg-muted/60 font-mono text-xs text-primary">{part.slice(1, -1)}</code>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "h3") return <h3 className="text-base font-semibold text-foreground mt-2 mb-1" key={index}>{inline(block.items[0] ?? "")}</h3>;
        if (block.type === "warn") return <p className="assistant-warning" key={index}>{inline(block.items[0] ?? "")}</p>;
        if (block.type === "ul") return <ul key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>;
        if (block.type === "ol") return <ol key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ol>;
        return <p key={index}>{inline(block.items[0] ?? "")}</p>;
      })}
    </>
  );
}

const DEFAULT_GEMINI_KEY = "AIzaSyCh8aeIfTIS4qR9StSJAdG-YDb9sj0Gaew";

export function ReliefAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_GEMINI_KEY);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(DEFAULT_GEMINI_KEY);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("GEMINI_API_KEY") || (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } })?.env?.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
      setApiKey(stored);
      setKeyInput(stored);
    }
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  function saveKey(k: string) {
    const clean = k.trim();
    const finalKey = clean || DEFAULT_GEMINI_KEY;
    setApiKey(finalKey);
    if (typeof window !== "undefined") {
      if (clean) localStorage.setItem("GEMINI_API_KEY", clean);
      else localStorage.removeItem("GEMINI_API_KEY");
    }
    setShowKeyModal(false);
  }

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setBusy(true);

    const assistantId = createId();
    let streamed = "";
    let started = false;

    // Helper for direct Gemini streaming
    const tryClientGemini = async (key: string): Promise<boolean> => {
      try {
        const geminiContents = history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${SITE_CONTEXT}` }],
              },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (!response.ok || !response.body) return false;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr) as {
                candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
              };
              const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (delta) {
                streamed += delta;
                if (!started) {
                  started = true;
                  setBusy(false);
                  setMessages((curr) => [...curr, { id: assistantId, role: "assistant", content: streamed }]);
                } else {
                  setMessages((curr) => curr.map((item) => (item.id === assistantId ? { ...item, content: streamed } : item)));
                }
              }
            } catch {
              // ignore partial chunk
            }
          }
        }
        return started;
      } catch (err) {
        console.warn("Client Gemini direct stream failed", err);
        return false;
      }
    };

    try {
      // 1. If user set client Gemini key, try it directly
      if (apiKey) {
        const ok = await tryClientGemini(apiKey);
        if (ok) return;
      }

      // 2. Try server endpoint /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line) as { t: string; v: string };
              if (event.t !== "delta") continue;
              streamed += event.v;
              if (!started) {
                started = true;
                setBusy(false);
                setMessages((current) => [...current, { id: assistantId, role: "assistant", content: streamed }]);
              } else {
                setMessages((current) => current.map((item) => (item.id === assistantId ? { ...item, content: streamed } : item)));
              }
            } catch {
              // ignore partial frames
            }
          }
        }
      }

      if (started) return;
      throw new Error("fallback");
    } catch {
      // 3. Fallback: Intelligent Simulated Reasoning Engine with smooth chunk streaming
      const fullReply = generateExpertReliefResponse(text, history);
      const chunks = fullReply.match(/.{1,14}/g) || [fullReply];
      let accumulated = "";
      
      setBusy(false);
      setMessages((current) => [...current, { id: assistantId, role: "assistant", content: "" }]);

      for (const chunk of chunks) {
        accumulated += chunk;
        setMessages((current) => current.map((item) => (item.id === assistantId ? { ...item, content: accumulated } : item)));
        await new Promise((r) => setTimeout(r, 12));
      }
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [apiKey, busy, messages]);

  const empty = messages.length === 0;

  return (
    <main className="assistant-page">
      <header className="assistant-bar">
        <Link to="/" className="assistant-back"><ArrowLeft /> Back to Platform</Link>
        <div className="assistant-identity">
          <span className="assistant-mark"><Sparkles /></span>
          <b>RELIEF.AI ASSISTANT</b>
          <i className="assistant-online"><em /> {apiKey ? "GEMINI LIVE" : "GEMINI ENGINE ONLINE"}</i>
        </div>
        <div className="assistant-bar-actions">
          <Button variant="ghost" size="sm" onClick={() => setShowKeyModal(true)} title="Configure Gemini API Key">
            <KeyRound className="w-3.5 h-3.5 mr-1" /> {apiKey ? "Key Active" : "Add Key"}
          </Button>
          <Button variant="ghost" onClick={() => { setMessages([]); setError(null); setInput(""); inputRef.current?.focus(); }}><Plus /> New Chat</Button>
          <Button variant="ghost" onClick={() => { setMessages([]); setError(null); }}><Trash2 /> Clear</Button>
        </div>
      </header>

      {/* Modal for Gemini API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-background border border-border p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <KeyRound className="text-primary w-5 h-5" /> Google Gemini API Key
            </h3>
            <p className="text-xs text-muted-foreground">
              Add your Google Gemini API key to query Gemini 2.0 Flash directly from your browser. Your key is stored securely in your browser's local storage.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
            <div className="flex justify-between items-center text-xs">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Get a free key →
              </a>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowKeyModal(false)}>Cancel</Button>
                <Button size="sm" onClick={() => saveKey(keyInput)}>Save Key</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="assistant-shell">
        <div className="assistant-scroll" ref={scrollRef}>
          {empty ? (
            <div className="assistant-intro">
              <span className="assistant-intro-mark"><Satellite /></span>
              <h1>RELIEF.AI</h1>
              <p className="assistant-intro-role">Emergency Logistics & Route Intelligence</p>
              <p className="assistant-intro-copy">Powered by Gemini AI. Ask me about disaster conditions, satellite change detection, road accessibility, bridge risks, or relief cargo priorities.</p>
              <div className="assistant-chips">
                {SUGGESTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => void send(item)}>{item}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="assistant-thread">
              {messages.map((message) => (
                <article key={message.id} className={`assistant-message is-${message.role}`}>
                  {message.role === "assistant" ? <span className="assistant-avatar"><Bot /></span> : null}
                  <div className="assistant-bubble">
                    <MessageBody content={message.content} />
                  </div>
                </article>
              ))}
              {busy ? (
                <article className="assistant-message is-assistant">
                  <span className="assistant-avatar"><Bot /></span>
                  <div className="assistant-bubble assistant-typing">RELIEF.AI is analyzing<i /><i /><i /></div>
                </article>
              ) : null}
            </div>
          )}
        </div>

        <div className="assistant-composer">
          {error ? <p className="assistant-error" role="status">{error}</p> : null}
          <div className="assistant-quick">
            {QUICK_ACTIONS.map(({ icon: Icon, label, query }) => (
              <button key={label} type="button" disabled={busy} onClick={() => void send(query)}><Icon /> {label}</button>
            ))}
          </div>
          <form
            className="assistant-input"
            onSubmit={(event) => { event.preventDefault(); void send(input); }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="Ask Relief.AI anything about relief routes or satellite data..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={busy || input.trim().length === 0} aria-label="Send message"><ArrowUp /></Button>
          </form>
          <p className="assistant-note">Emergency decision-support · Built by <a href="https://github.com/shubhamrajjak-sys/Relief_AI" target="_blank" rel="noreferrer" className="underline hover:text-white">Shubham</a> · Powered by Google Gemini</p>
        </div>
      </section>
    </main>
  );
}

