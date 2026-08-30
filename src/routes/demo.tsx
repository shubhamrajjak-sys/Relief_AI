import { createFileRoute } from "@tanstack/react-router";

import { ReliefDemo } from "@/components/relief-demo";

export const Route = createFileRoute("/demo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MyRelief.AI Demo | Emergency Route Intelligence" },
      { name: "description", content: "Interactive demo: detect flooded and blocked roads on satellite imagery, then generate a safe relief route to the shelter." },
      { property: "og:title", content: "MyRelief.AI Demo | Emergency Route Intelligence" },
      { property: "og:description", content: "Simulate a disaster, watch roads become unsafe, and see AI recalculate a safe relief corridor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReliefDemo,
});
