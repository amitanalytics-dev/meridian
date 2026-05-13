import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const ADMIN_KEY = process.env.ADMIN_KEY ?? "meridian2025"

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId required" }), { status: 400 })
  }

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    const [notes, actions, emails] = await Promise.all([
      convex.query(api.adminOps.getNotes,    { sessionId }),
      convex.query(api.adminOps.getActions,  { sessionId }),
      convex.query(api.adminOps.getEmailLog, { sessionId }),
    ])

    return new Response(JSON.stringify({ notes, actions, emails }), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/profile GET]", err)
    return new Response(JSON.stringify({ error: "profile fetch failed" }), { status: 500 })
  }
}
