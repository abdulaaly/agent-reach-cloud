import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    let grantType: string | null = null;
    let code: string | null = null;
    let redirectUri: string | null = null;
    let clientId: string | null = null;
    let codeVerifier: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      grantType = formData.get("grant_type") as string;
      code = formData.get("code") as string;
      redirectUri = formData.get("redirect_uri") as string;
      clientId = formData.get("client_id") as string;
      codeVerifier = formData.get("code_verifier") as string;
    } else {
      const body = await request.json();
      grantType = body.grant_type;
      code = body.code;
      redirectUri = body.redirect_uri;
      clientId = body.client_id;
      codeVerifier = body.code_verifier;
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: "invalid_request", error_description: "Missing code parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const authEntry = db.consumeOAuthCode(code);
    if (!authEntry) {
      return new Response(
        JSON.stringify({ error: "invalid_grant", error_description: "Authorization code is invalid or has expired." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Optional redirectUri check
    if (redirectUri && authEntry.redirectUri && redirectUri !== authEntry.redirectUri) {
      // In case of slight URL differences (trailing slash)
      const u1 = new URL(redirectUri).origin + new URL(redirectUri).pathname.replace(/\/$/, "");
      const u2 = new URL(authEntry.redirectUri).origin + new URL(authEntry.redirectUri).pathname.replace(/\/$/, "");
      if (u1 !== u2) {
        return new Response(
          JSON.stringify({ error: "invalid_grant", error_description: "redirect_uri mismatch." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // PKCE Verification (RFC 7636)
    if (authEntry.codeChallenge) {
      if (!codeVerifier) {
        return new Response(
          JSON.stringify({ error: "invalid_request", error_description: "code_verifier required for PKCE." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (authEntry.codeChallengeMethod === "S256") {
        const hash = crypto.createHash("sha256").update(codeVerifier).digest();
        const computed = base64Url(hash);
        if (computed !== authEntry.codeChallenge) {
          return new Response(
            JSON.stringify({ error: "invalid_grant", error_description: "PKCE verification failed: S256 hash mismatch." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      } else {
        // Plain
        if (codeVerifier !== authEntry.codeChallenge) {
          return new Response(
            JSON.stringify({ error: "invalid_grant", error_description: "PKCE verification failed: plain challenge mismatch." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    const user = db.getUser(authEntry.userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "invalid_grant", error_description: "User not found." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Issue standard OAuth access token
    const accessToken = db.issueOAuthToken(user.id, clientId || authEntry.clientId || "universal_client");

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 2592000, // 30 days
        scope: "mcp:tools",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "server_error", error_description: err.message || "Failed to process token request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
