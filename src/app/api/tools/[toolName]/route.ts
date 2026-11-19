import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { executeTool } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolName: string }> }
) {
  const { toolName } = await params;
  const { searchParams } = new URL(request.url);

  let tokenStr = searchParams.get("token") || searchParams.get("api_key");
  const authHeader = request.headers.get("authorization");
  if (!tokenStr && authHeader?.startsWith("Bearer ")) {
    tokenStr = authHeader.substring(7).trim();
  }

  if (!tokenStr) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Authentication required. Pass 'Authorization: Bearer <token>' or query param ?token=<token>",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "WWW-Authenticate": 'Bearer realm="Agent-Reach Cloud"',
        },
      }
    );
  }

  const auth = db.validateToken(tokenStr);
  if (!auth.valid || !auth.user) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: auth.reason || "Unauthorized API token.",
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

  let args: Record<string, any> = {};
  try {
    const text = await request.text();
    if (text) {
      args = JSON.parse(text);
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body in tool invocation." }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  try {
    const quota = db.deductQuota(auth.user.id, auth.token?.id, 1);
    if (!quota.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Compute quota exceeded. Please top up credits in your Agent Reach Cloud dashboard.",
          remainingCredits: quota.remaining,
        }),
        { status: 402, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const result = await executeTool(toolName, args);
    db.recordAuditLog({
      userId: auth.user.id,
      tokenId: auth.token?.id,
      toolName,
      unitsCharged: 1,
      status: result.ok ? "success" : "error",
      metadata: { channel: result.channel },
    });

    return new Response(
      JSON.stringify({
        ok: result.ok,
        tool: toolName,
        channel: result.channel,
        result: result.data || result.items || result,
        error: result.error,
        remainingCredits: quota.remaining,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        tool: toolName,
        error: { code: "EXEC_ERROR", message: err.message || "Failed to execute tool" },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ toolName: string }> }
) {
  const { toolName } = await params;
  const { searchParams } = new URL(request.url);

  let tokenStr = searchParams.get("token") || searchParams.get("api_key");
  const authHeader = request.headers.get("authorization");
  if (!tokenStr && authHeader?.startsWith("Bearer ")) {
    tokenStr = authHeader.substring(7).trim();
  }

  if (!tokenStr) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Authentication required. Pass 'Authorization: Bearer <token>' or query param ?token=<token>",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "WWW-Authenticate": 'Bearer realm="Agent-Reach Cloud"',
        },
      }
    );
  }

  const auth = db.validateToken(tokenStr);
  if (!auth.valid || !auth.user) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: auth.reason || "Unauthorized API token.",
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

  const args: Record<string, any> = {};
  searchParams.forEach((val, key) => {
    if (key !== "token" && key !== "api_key") {
      args[key] = val;
    }
  });

  try {
    const quota = db.deductQuota(auth.user.id, auth.token?.id, 1);
    if (!quota.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Compute quota exceeded. Please top up credits in your Agent Reach Cloud dashboard.",
          remainingCredits: quota.remaining,
        }),
        { status: 402, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const result = await executeTool(toolName, args);
    db.recordAuditLog({
      userId: auth.user.id,
      tokenId: auth.token?.id,
      toolName,
      unitsCharged: 1,
      status: result.ok ? "success" : "error",
      metadata: { channel: result.channel },
    });

    return new Response(
      JSON.stringify({
        ok: result.ok,
        tool: toolName,
        channel: result.channel,
        result: result.data || result.items || result,
        error: result.error,
        remainingCredits: quota.remaining,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        tool: toolName,
        error: { code: "EXEC_ERROR", message: err.message || "Failed to execute tool" },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
