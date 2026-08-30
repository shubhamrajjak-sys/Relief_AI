import { createFileRoute } from "@tanstack/react-router";

import { ReliefAssistant } from "@/components/relief-assistant";

export const Route = createFileRoute("/ai-assistant")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI Assistant | RELIEF.AI Emergency Route Intelligence" },
      { name: "description", content: "Ask the RELIEF.AI assistant about flood-affected roads, bridge risk, route blockages and relief cargo priority." },
      { property: "og:title", content: "AI Assistant | RELIEF.AI Emergency Route Intelligence" },
      { property: "og:description", content: "A domain-specific emergency relief and route intelligence assistant built into the RELIEF.AI platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReliefAssistant,
});
