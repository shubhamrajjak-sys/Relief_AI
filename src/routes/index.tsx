import { createFileRoute } from "@tanstack/react-router";

import { CommandCenter } from "@/components/command-center";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "RELIEF.AI | Emergency Logistics Digital Twin" },
      { name: "description", content: "A live 3D digital twin that detects disaster hazards and reroutes critical relief convoys through safe roads." },
      { property: "og:title", content: "RELIEF.AI | Emergency Logistics Digital Twin" },
      { property: "og:description", content: "See AI detect floods, unsafe bridges, and damaged roads before rerouting critical relief supplies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommandCenter,
});