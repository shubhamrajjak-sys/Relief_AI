import { createFileRoute } from "@tanstack/react-router";

import { CommandCenter } from "@/components/command-center";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RouteLifeline | AI Emergency Logistics" },
      { name: "description", content: "Live, AI-powered routing for critical relief convoys when roads, bridges, and conventional navigation fail." },
      { property: "og:title", content: "RouteLifeline | AI Emergency Logistics" },
      { property: "og:description", content: "A live command center for safe, dynamic disaster relief routing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommandCenter,
});