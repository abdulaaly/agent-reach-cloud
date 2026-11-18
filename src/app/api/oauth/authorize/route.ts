import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const clientId = searchParams.get("client_id") || "universal_client";
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state") || "";
  const scope = searchParams.get("scope") || "mcp:tools";
  const userId = searchParams.get("userId");
  const codeChallenge = searchParams.get("code_challenge") || undefined;
  const codeChallengeMethod = (searchParams.get("code_challenge_method") as "S256" | "plain") || undefined;

  if (!redirectUri) {
    return new Response(
      JSON.stringify({ error: "invalid_request", error_description: "Missing redirect_uri parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // If user is already identified and confirmed via login/consent screen
  if (userId) {
    const user = db.getUser(userId);
    if (user) {
      const code = db.createOAuthCode({
        userId: user.id,
        clientId,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
      });

      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("code", code);
      if (state) callbackUrl.searchParams.set("state", state);

      return NextResponse.redirect(callbackUrl.toString(), 302);
    }
  }

  // Redirect to UI Auth Consent page
  const consentUrl = new URL("/auth", request.url);
  consentUrl.searchParams.set("mode", "oauth_consent");
  consentUrl.searchParams.set("client_id", clientId);
  consentUrl.searchParams.set("redirect_uri", redirectUri);
  if (state) consentUrl.searchParams.set("state", state);
  if (scope) consentUrl.searchParams.set("scope", scope);
  if (codeChallenge) consentUrl.searchParams.set("code_challenge", codeChallenge);
  if (codeChallengeMethod) consentUrl.searchParams.set("code_challenge_method", codeChallengeMethod);

  return NextResponse.redirect(consentUrl.toString(), 302);
}
