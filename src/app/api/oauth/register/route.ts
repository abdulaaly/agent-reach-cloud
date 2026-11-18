import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientName = body.client_name || "Universal MCP Client";
    const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];

    const client = db.registerOAuthClient(clientName, redirectUris);

    return new Response(
      JSON.stringify({
        client_id: client.clientId,
        client_secret: client.clientSecret,
        client_name: client.clientName,
        redirect_uris: client.redirectUris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "invalid_client_metadata", error_description: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
