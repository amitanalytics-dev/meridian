import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

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
    const convex  = getConvex()
    const actions = await convex.query(api.adminOps.getActions, { sessionId })
    return new Response(JSON.stringify(actions), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/actions GET]", err)
    return new Response(JSON.stringify({ error: "fetch failed" }), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const body = (await req.json()) as {
      action:     string
      sessionId?: string
      task?:      string
      dueAt?:     number
      actionId?:  string
    }

    const convex = getConvex()

    if (body.action === "create") {
      if (!body.sessionId || !body.task) {
        return new Response(JSON.stringify({ error: "sessionId and task required" }), { status: 400 })
      }
      const id = await convex.mutation(api.adminOps.createAction, {
        sessionId: body.sessionId,
        task:      body.task,
        dueAt:     body.dueAt,
      })
      return new Response(JSON.stringify({ id }), {
        status:  200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (body.action === "complete") {
      if (!body.actionId) {
        return new Response(JSON.stringify({ error: "actionId required" }), { status: 400 })
      }
      await convex.mutation(api.adminOps.completeAction, {
        actionId: body.actionId as Id<"adminActions">,
      })
      return new Response(JSON.stringify({ success: true }), {
        status:  200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (body.action === "dismiss") {
      if (!body.actionId) {
        return new Response(JSON.stringify({ error: "actionId required" }), { status: 400 })
      }
      await convex.mutation(api.adminOps.dismissAction, {
        actionId: body.actionId as Id<"adminActions">,
      })
      return new Response(JSON.stringify({ success: true }), {
        status:  200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400 })
  } catch (err) {
    console.error("[admin/actions POST]", err)
    return new Response(JSON.stringify({ error: "action failed" }), { status: 500 })
  }
}
