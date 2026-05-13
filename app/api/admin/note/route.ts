import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const ADMIN_KEY = process.env.ADMIN_KEY ?? "meridian2025"

function getConvex() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
}

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === ADMIN_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId required" }), { status: 400 })
  }

  try {
    const convex = getConvex()
    const notes  = await convex.query(api.adminOps.getNotes, { sessionId })
    return new Response(JSON.stringify(notes), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/note GET]", err)
    return new Response(JSON.stringify({ error: "fetch failed" }), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const { sessionId, note } = (await req.json()) as {
      sessionId: string
      note:      string
    }

    if (!sessionId || !note) {
      return new Response(JSON.stringify({ error: "sessionId and note required" }), { status: 400 })
    }

    const convex = getConvex()
    const id     = await convex.mutation(api.adminOps.addNote, { sessionId, note })
    return new Response(JSON.stringify({ id }), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/note POST]", err)
    return new Response(JSON.stringify({ error: "add note failed" }), { status: 500 })
  }
}
