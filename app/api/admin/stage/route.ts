import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const ADMIN_KEY = process.env.ADMIN_KEY ?? "meridian2025"

const VALID_STAGES = new Set([
  "lead",
  "contacted",
  "onboarded",
  "building",
  "review",
  "ready",
  "submitted",
  "won",
  "lost",
])

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const { sessionId, stage } = (await req.json()) as {
      sessionId: string
      stage:     string
    }

    if (!sessionId || !stage) {
      return new Response(JSON.stringify({ error: "sessionId and stage required" }), { status: 400 })
    }

    if (!VALID_STAGES.has(stage)) {
      return new Response(
        JSON.stringify({ error: `invalid stage. must be one of: ${Array.from(VALID_STAGES).join(", ")}` }),
        { status: 400 },
      )
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const id     = await convex.mutation(api.adminOps.setStage, { sessionId, stage })
    return new Response(JSON.stringify({ id }), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/stage POST]", err)
    return new Response(JSON.stringify({ error: "set stage failed" }), { status: 500 })
  }
}
