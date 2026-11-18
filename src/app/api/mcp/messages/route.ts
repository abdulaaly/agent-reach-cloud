import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleJsonRpcRequest } from "@/lib/mcp";
import { activeSseSessions } from "@/lib/mcp/sse-registry";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  // Extract auth token
  let tokenStr = searchParams.get("token");
  const authHeader = request.headers.get("authorization");
  if (!tokenStr && authHeader?.startsWith("Bearer ")) {
    tokenStr = authHeader.substring(7).trim();
  }

  if (!tokenStr) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: "Missing API token parameter." },
      }),
      { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const auth = db.validateToken(tokenStr);
  if (!auth.valid || !auth.user) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: auth.reason || "Unauthorized" },
      }),
      {
        status: auth.user && auth.user.computeUnits <= 0 ? 402 : 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON." },
      }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const responseRpc = await handleJsonRpcRequest(body, {
    user: auth.user,
    token: auth.token || {
      id: "oauth_" + auth.user.id,
      userId: auth.user.id,
      keyPrefix: "ar_oauth",
      keyHash: "oauth_session",
      label: "OAuth 2.0 Client",
      active: true,
      createdAt: new Date().toISOString(),
      requestCount: 0,
    },
  });

  // If responseRpc is null (notification), return 202 Accepted
  if (responseRpc === null) {
    return new Response(null, { status: 202, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // If there's an active SSE session listener, broadcast the response there as well
  if (sessionId && activeSseSessions.has(sessionId)) {
    const sseSender = activeSseSessions.get(sessionId);
    if (sseSender) {
      sseSender(JSON.stringify(responseRpc));
    }
  }

  return new Response(JSON.stringify(responseRpc), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
