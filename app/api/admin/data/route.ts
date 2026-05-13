import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const ADMIN_KEY = process.env.ADMIN_KEY ?? "meridian2025"

export async function GET(req: NextRequest) {
  // Auth check
  const adminKey = req.headers.get("x-admin-key")
  if (adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    const [assessments, stats, stageData, allActions] = await Promise.all([
      convex.query(api.readiness.getAllAssessments),
      convex.query(api.readiness.getAdminStats),
      convex.query(api.adminOps.getAllCurrentStages),
      convex.query(api.adminOps.getAllPendingActions),
    ])

    // Map pending actions to { sessionId, pending } counts
    const pendingMap = new Map<string, number>()
    for (const action of allActions) {
      const prev = pendingMap.get(action.sessionId) ?? 0
      pendingMap.set(action.sessionId, prev + 1)
    }
    const pendingActionCounts = Array.from(pendingMap.entries()).map(
      ([sessionId, pending]) => ({ sessionId, pending }),
    )

    return new Response(
      JSON.stringify({ stats, leads: assessments, stageData, pendingActionCounts }),
      {
        status:  200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (err) {
    console.error("[admin/data]", err)
    return new Response(JSON.stringify({ error: "data fetch failed" }), { status: 500 })
  }
}
