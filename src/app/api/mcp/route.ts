import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleJsonRpcRequest, MCP_TOOLS } from "@/lib/mcp";

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

// Direct MCP JSON-RPC Handler (Streamable HTTP POST & GET Info)
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);

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
        error: {
          code: -32000,
          message: "Authentication required. Connect via Universal OAuth 2.0 or pass 'Authorization: Bearer <key>'.",
        },
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
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: auth.reason || "Unauthorized",
        },
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

  return new Response(JSON.stringify(responseRpc), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// GET Endpoint for Discovery & Health
export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "agent-reach.cloud";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  return new Response(
    JSON.stringify(
      {
        name: "agent-reach-cloud",
        version: "1.0.0",
        protocolVersion: "2024-11-05",
        description: "Official Agent-Reach Universal Cloud Remote MCP Server",
        contact: "100xdigitizer@gmail.com",
        endpoints: {
          http: `${baseUrl}/api/mcp`,
          sse: `${baseUrl}/api/mcp/sse`,
          oauth_authorization: `${baseUrl}/api/oauth/authorize`,
          oauth_token: `${baseUrl}/api/oauth/token`,
          discovery: `${baseUrl}/.well-known/oauth-authorization-server`,
        },
        tools_count: MCP_TOOLS.length,
        supported_platforms: [
          "YouTube",
          "Reddit",
          "Twitter/X",
          "Xiaohongshu",
          "Bilibili",
          "Xueqiu",
          "GitHub",
          "LinkedIn",
          "Boss Zhipin",
          "V2EX",
          "Xiaoyuzhou FM",
          "Web (Exa)",
          "Jina Reader",
          "Instagram",
          "Facebook",
          "CloakBrowser",
        ],
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
