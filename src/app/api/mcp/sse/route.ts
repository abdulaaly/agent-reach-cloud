import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { activeSseSessions } from "@/lib/mcp/sse-registry";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract auth token from Header or Query Param
  let tokenStr = searchParams.get("token");
  const authHeader = request.headers.get("authorization");
  if (!tokenStr && authHeader?.startsWith("Bearer ")) {
    tokenStr = authHeader.substring(7).trim();
  }

  if (!tokenStr) {
    return new Response(
      JSON.stringify({
        error: "Missing API token. Provide Authorization: Bearer <key> or ?token=<key>",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="Agent-Reach Cloud", error="invalid_token", error_description="Bearer token or OAuth required"',
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const auth = db.validateToken(tokenStr);
  if (!auth.valid || !auth.user) {
    return new Response(
      JSON.stringify({
        error: auth.reason || "Unauthorized",
      }),
      {
        status: auth.user && auth.user.computeUnits <= 0 ? 402 : 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const sessionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Create SSE ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // 1. Send the MCP endpoint event immediately according to 2024-11-05 spec
      const messagesUrl = `/api/mcp/messages?sessionId=${sessionId}&token=${encodeURIComponent(tokenStr!)}`;
      controller.enqueue(encoder.encode(`event: endpoint\ndata: ${messagesUrl}\n\n`));

      // Register session for incoming push messages
      const sendEvent = (msg: string) => {
        try {
          controller.enqueue(encoder.encode(`event: message\ndata: ${msg}\n\n`));
        } catch (e) {
          activeSseSessions.delete(sessionId);
        }
      };

      activeSseSessions.set(sessionId, sendEvent);

      // Keepalive heartbeat every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
          activeSseSessions.delete(sessionId);
        }
      }, 15000);

      // Heartbeat teardown
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        activeSseSessions.delete(sessionId);
      });
    },
    cancel() {
      activeSseSessions.delete(sessionId);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
