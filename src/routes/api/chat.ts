import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Relief.AI, an AI Emergency Relief & Route Intelligence Assistant.

Your purpose is to help emergency logistics teams understand disaster-affected road networks and make safer relief-routing decisions.

You analyze information such as:
- satellite observations
- flood-affected areas
- road accessibility
- damaged bridges
- blocked roads
- relief vehicle locations
- shelters
- warehouses
- cargo priority

When providing route recommendations:
1. Identify the hazard.
2. Explain why the current route is unsafe or inefficient.
3. Suggest a safer alternative when sufficient data exists.
4. Prioritize critical supplies such as insulin, blood bags, infant nutrition and potable water.
5. Clearly distinguish real data from simulated/demo data.
6. Never invent satellite observations, road conditions, coordinates, statistics or emergency information.
7. If required information is unavailable, explicitly say that the data is unavailable.

The assistant is a decision-support system and should not claim certainty when the available information is incomplete.

Formatting: reply in concise markdown. Use short paragraphs, "- " bullets, or "1. " numbered steps. Prefix an urgent caution line with "! ". Keep answers under 220 words unless the user asks for more.

Stay strictly within the emergency relief, satellite monitoring and routing domain. If asked something unrelated, briefly redirect to that scope.`;

const SITE_CONTEXT = `AVAILABLE APPLICATION CONTEXT (all of it is SIMULATED DEMO DATA from the RELIEF.AI landing experience — never present it as live satellite intelligence):

Satellite change detection panel (before/after imagery of one river valley):
- Flooded area: Detected
- Road access: Changed
- Bridge: Potentially unsafe
- Shelter access: At risk
- Map markers: "Affected bridge" and "Submerged intersection".

Guided walkthrough stages:
01 Earthquake — hillside debris destabilises arterial highways and rural feeder roads.
02 Flood — intersections submerge under fast-moving water and a bridge is flagged unsafe.
03 GPS failure — conventional maps still route the convoy into the blocked corridor, so it turns back.
04 AI rerouting — detected hazards are removed from the network and a safe corridor guides the convoy in.

Routing map nodes: Warehouse (origin), Flooded road hazard (mid-network), Relief shelter (destination).
Routes: the original road corridor is blocked where it intersects the detected flood zone; the AI alternative is drawn around the flood zone to the shelter.

No coordinates, timestamps, live feeds, vehicle telemetry or real satellite products exist in this application. If a user asks for anything beyond the list above, say the data is unavailable.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.error("chat handler hit");
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "unavailable" }, { status: 503 });
        }

        let messages: ChatMessage[] = [];
        try {
          const body = (await request.json()) as { messages?: ChatMessage[] };
          messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
        } catch {
          return Response.json({ error: "invalid_request" }, { status: 400 });
        }
        if (messages.length === 0) {
          return Response.json({ error: "invalid_request" }, { status: 400 });
        }

        const input = [
          { role: "system", content: [{ type: "input_text", text: `${SYSTEM_PROMPT}\n\n${SITE_CONTEXT}` }] },
          ...messages.map((message) => ({
            role: message.role,
            content: [
              message.role === "assistant"
                ? { type: "output_text", text: message.content }
                : { type: "input_text", text: message.content },
            ],
          })),
        ];

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-5.6-sol",
              input,
              stream: true,
              store: false,
              reasoning: { effort: "low", summary: "auto" },
              include: ["reasoning.encrypted_content"],
            }),
          });
        } catch (error) {
          console.error("relief-assistant gateway request failed", error);
          return Response.json({ error: "unavailable" }, { status: 502 });
        }

        console.error("upstream status", upstream.status, !!upstream.body);
        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("relief-assistant gateway error", upstream.status, detail);
          const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 502;
          return Response.json({ error: status === 429 ? "rate_limited" : status === 402 ? "no_credits" : "unavailable" }, { status });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const event = JSON.parse(payload) as { type?: string; delta?: string };
                if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
                  controller.enqueue(encoder.encode(`${JSON.stringify({ t: "delta", v: event.delta })}\n`));
                }
              } catch {
                // ignore partial/non-JSON frames
              }
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "application/x-ndjson; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
