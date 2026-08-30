import { createFileRoute } from "@tanstack/react-router";

import { SatelliteExperience } from "@/components/satellite-experience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "RELIEF.AI | Satellite Flood Monitoring" },
      { name: "description", content: "Compare satellite views before and after flooding, detect inaccessible roads, and reroute critical relief supplies." },
      { property: "og:title", content: "RELIEF.AI | Satellite Flood Monitoring" },
      { property: "og:description", content: "See satellite change detection identify flooded roads and guide safer relief routes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SatelliteExperience,
});