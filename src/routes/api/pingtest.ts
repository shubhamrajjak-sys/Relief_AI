import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/pingtest")({
  server: {
    handlers: {
      GET: async () => {
        const t = Date.now();
        const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": process.env["LOVABLE_API_KEY"] ?? "" },
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            input: [
              { role: "system", content: [{ type: "input_text", text: "You are terse." }] },
              { role: "user", content: [{ type: "input_text", text: "hi" }] },
            ],
            stream: true,
            store: false,
            reasoning: { effort: "low", summary: "auto" },
            include: ["reasoning.encrypted_content"],
          }),
        });
        return Response.json({ status: res.status, ms: Date.now() - t, hasBody: !!res.body });
      },
    },
  },
});
