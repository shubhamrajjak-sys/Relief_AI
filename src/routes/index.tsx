import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Network, Route as RouteIcon, ShieldCheck } from "lucide-react";

import reliefRoutingHero from "@/assets/relief-routing-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Paralyzed Relief Supply Chain" },
      {
        name: "description",
        content:
          "AI-powered emergency logistics that reroutes critical relief supplies around damaged roads, floods, and unsafe bridges.",
      },
      { property: "og:title", content: "The Paralyzed Relief Supply Chain" },
      {
        property: "og:description",
        content: "Dynamic, safety-aware routing for disaster relief convoys when conventional maps fail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const hazards = [
  "Damaged Roads",
  "Flooded Intersections",
  "Unsafe Bridges",
  "Stranded Relief Convoys",
];

function Wordmark() {
  return (
    <a href="#top" className="group flex items-center gap-3" aria-label="ReliefRoute home">
      <span className="grid size-8 place-items-center rounded-sm bg-primary text-primary-foreground transition-transform group-hover:rotate-6">
        <Network className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.16em] text-foreground">
        Relief<span className="text-primary">Route</span>
      </span>
    </a>
  );
}

function Index() {
  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Primary navigation">
          <Wordmark />
          <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex">
            <a className="transition-colors hover:text-foreground" href="#problem-signals">Problem</a>
            <a className="transition-colors hover:text-foreground" href="#route-visual">Route intelligence</a>
          </div>
          <a
            href="#route-visual"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-primary/40 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-4"
          >
            Live map <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="relative flex min-h-[760px] items-end pt-16 lg:min-h-[820px]" aria-labelledby="hero-title">
        <div className="absolute inset-0" id="route-visual">
          <img
            src={reliefRoutingHero}
            alt="A relief warehouse dispatching emergency vehicles through a flooded mountain valley, with red unsafe routes and a green safe route toward isolated shelters"
            width={1600}
            height={1056}
            className="h-full w-full object-cover object-[62%_center] lg:object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-hero-shade" aria-hidden="true" />
          <div className="absolute inset-0 bg-grid-mask opacity-40" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-7 pt-28 sm:px-8 sm:pb-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(300px,0.42fr)] lg:items-end lg:px-12 lg:pb-12">
          <div className="max-w-3xl animate-hero-in">
            <div className="mb-6 inline-flex items-center gap-2 border-l-2 border-primary bg-surface-glass px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Dynamic relief routing
            </div>
            <h1 id="hero-title" className="max-w-[820px] text-balance text-[clamp(2.85rem,7vw,6.4rem)] font-black leading-[0.92] tracking-normal text-foreground">
              The Paralyzed Relief <span className="text-primary">Supply Chain</span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              When roads fail, conventional GPS fails too. AI must dynamically reroute critical relief supplies through safe, accessible paths.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <a
                href="#route-visual"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Explore the Solution
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <a
                href="#problem-signals"
                className="inline-flex h-12 items-center justify-center rounded-sm border border-foreground/25 bg-background/30 px-6 text-sm font-bold text-foreground backdrop-blur-md transition-colors hover:border-foreground/60 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View Problem
              </a>
            </div>
          </div>

          <aside className="hidden border-l border-primary/50 bg-surface-glass p-5 backdrop-blur-lg lg:block" aria-label="Routing status">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Route analysis</span>
              <span className="text-primary">Live</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-px bg-border/60">
              <div className="bg-panel/85 p-4">
                <RouteIcon className="mb-5 size-4 text-hazard" aria-hidden="true" />
                <div className="text-xl font-extrabold">4</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Hazards detected</div>
              </div>
              <div className="bg-panel/85 p-4">
                <ShieldCheck className="mb-5 size-4 text-primary" aria-hidden="true" />
                <div className="text-xl font-extrabold">1</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Safe path found</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="flex items-center gap-2"><i className="h-px w-7 bg-hazard" /> Unsafe</span>
              <span className="flex items-center gap-2"><i className="h-px w-7 bg-primary" /> Accessible</span>
            </div>
          </aside>

          <div id="problem-signals" className="border-t border-border/70 pt-5 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-bold uppercase tracking-[0.13em] text-foreground/75 sm:text-xs">
              {hazards.map((hazard, index) => (
                <span key={hazard} className="flex items-center gap-2.5">
                  <span className={index < 3 ? "size-1.5 bg-hazard" : "size-1.5 bg-warning"} aria-hidden="true" />
                  {hazard}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
