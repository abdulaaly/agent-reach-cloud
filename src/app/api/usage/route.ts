import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "user_demo_01";

  const stats = db.getStats(userId);
  if (!stats) {
    return new Response(JSON.stringify({ ok: false, error: "User not found" }), { status: 404 });
  }

  const logs = db.getUsageLogs(userId, 100);

  return new Response(
    JSON.stringify({
      ok: true,
      stats,
      logs,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
