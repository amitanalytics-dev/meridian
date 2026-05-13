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

    const [assessments, stats] = await Promise.all([
      convex.query(api.readiness.getAllAssessments),
      convex.query(api.readiness.getAdminStats),
    ])

    // assessments already sorted desc by createdAt via by_created index
    return new Response(
      JSON.stringify({ stats, leads: assessments }),
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
