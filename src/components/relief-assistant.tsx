import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Bridge,
  Droplets,
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
  "Is this road safe?",
  "Which route is blocked?",
  "Compare before and after flood conditions",
  "Which relief route should be prioritized?",
  "Why did the route change?",
  "What supplies are at highest risk?",
];

const QUICK_ACTIONS = [
  { icon: Satellite, label: "Analyze Satellite", query: "Analyze the current satellite change detection results for this valley." },
  { icon: Droplets, label: "Flood Impact", query: "Summarise the flood impact on the road network in the monitored valley." },
  { icon: RouteIcon, label: "Check Route", query: "Check the current relief route from the warehouse to the shelter and flag any hazards." },
  { icon: Truck, label: "Relief Priority", query: "Which relief cargo should be prioritised on the next convoy, and why?" },
  { icon: Bridge, label: "Bridge Risk", query: "What is the risk status of the affected bridge and can heavy vehicles cross?" },
];

const DEMO_REPLIES: { match: RegExp; reply: string }[] = [
  {
    match: /flood|water|submerg|before|after|satellite/i,
    reply:
      "! Demo data only — this is the simulated valley scenario, not a live satellite product.\n\nThe before/after comparison shows a flood boundary crossing the valley road network.\n\n- Flooded area: detected\n- Road access: changed\n- Submerged intersection: flagged on the central corridor\n\nNo depth, timing or coordinate data exists in this demo, so I cannot estimate how long the corridor stays impassable.",
  },
  {
    match: /bridge/i,
    reply:
      "! Bridge status in the demo scenario: potentially unsafe.\n\n1. The satellite comparison flags structural uncertainty at the affected bridge.\n2. Heavy relief vehicles should not be routed across it until an inspection confirms load capacity.\n3. Light vehicles are also unverified — the demo carries no inspection record.\n\nRecommended action: treat the bridge as removed from the accessible network and use the alternative corridor around the flood zone.",
  },
  {
    match: /priorit|supply|supplies|cargo/i,
    reply:
      "Cargo prioritisation for an isolated shelter, in order:\n\n1. Insulin and cold-chain medication\n2. Blood bags\n3. Infant nutrition\n4. Potable water\n\nThese degrade fastest or carry the highest life-safety cost when delayed. The demo does not contain an actual cargo manifest, so this is standard prioritisation guidance rather than an analysis of real load data.",
  },
  {
    match: /route|road|block|reroute|safe|why/i,
    reply:
      "ROUTE ANALYSIS — simulated demo data\n\n- Current route: unsafe. The original corridor intersects the detected flood-affected zone and the affected bridge.\n- Reason: submerged intersection plus an unverified bridge crossing.\n- Alternative: the AI corridor routes around the flood boundary to the relief shelter.\n\nConventional navigation keeps the blocked corridor because it relies on the pre-disaster road network.",
  },
];

function demoReply(question: string) {
  return (
    DEMO_REPLIES.find((entry) => entry.match.test(question))?.reply ??
    "I can only work from the simulated demo scenario in this project: satellite change detection, flood-affected roads, the affected bridge, and the warehouse-to-shelter relief route. That specific information is unavailable here."
  );
}

function createId() {
  return Math.random().toString(36).slice(2);
}

function MessageBody({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.split("\n");
    const output: { type: "p" | "ul" | "ol" | "warn"; items: string[] }[] = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
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

  const inline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>,
    );

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "warn") return <p className="assistant-warning" key={index}>{inline(block.items[0] ?? "")}</p>;
        if (block.type === "ul") return <ul key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>;
        if (block.type === "ol") return <ol key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ol>;
        return <p key={index}>{inline(block.items[0] ?? "")}</p>;
      })}
    </>
  );
}

export function ReliefAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

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
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!response.ok || !response.body) throw new Error("gateway");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamed = "";
      let started = false;

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

      if (!started) throw new Error("empty");
    } catch {
      setMessages((current) => [...current, { id: createId(), role: "assistant", content: demoReply(text), demo: true }]);
      setError("AI service is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [busy, messages]);

  const empty = messages.length === 0;

  return (
    <main className="assistant-page">
      <header className="assistant-bar">
        <Link to="/" className="assistant-back"><ArrowLeft /> Back to Platform</Link>
        <div className="assistant-identity">
          <span className="assistant-mark"><Sparkles /></span>
          <b>RELIEF.AI ASSISTANT</b>
          <i className="assistant-online"><em /> ONLINE</i>
        </div>
        <div className="assistant-bar-actions">
          <Button variant="ghost" onClick={() => { setMessages([]); setError(null); setInput(""); inputRef.current?.focus(); }}><Plus /> New Chat</Button>
          <Button variant="ghost" onClick={() => { setMessages([]); setError(null); }}><Trash2 /> Clear Chat</Button>
        </div>
      </header>

      <section className="assistant-shell">
        <div className="assistant-scroll" ref={scrollRef}>
          {empty ? (
            <div className="assistant-intro">
              <span className="assistant-intro-mark"><Satellite /></span>
              <h1>RELIEF.AI</h1>
              <p className="assistant-intro-role">Emergency Logistics Assistant</p>
              <p className="assistant-intro-copy">Ask me about disaster conditions, satellite observations, road accessibility, route risks, or relief logistics.</p>
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
                    {message.demo ? <span className="assistant-demo-badge">DEMO MODE</span> : null}
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
              placeholder="Ask Relief.AI anything..."
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
          <p className="assistant-note">Decision-support demo · responses are based on simulated scenario data.</p>
        </div>
      </section>
    </main>
  );
}
