import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(
      JSON.stringify({ ok: false, error: "Authentication required: missing userId" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const tokens = db.getUserTokens(userId);
  return new Response(JSON.stringify({ ok: true, tokens }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, label } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required parameter: userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { token, rawKey } = db.createToken(userId, label || "Remote MCP Key");
    return new Response(
      JSON.stringify({
        ok: true,
        token,
        rawKey, // Returned once so the user can copy their new API key
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Failed to create token" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tokenId } = body;

    if (!userId || !tokenId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing userId or tokenId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const active = db.toggleToken(userId, tokenId);
    return new Response(JSON.stringify({ ok: true, active }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tokenId = searchParams.get("tokenId");

    if (!userId || !tokenId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing userId or tokenId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const revoked = db.revokeToken(userId, tokenId);
    return new Response(JSON.stringify({ ok: true, revoked }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
