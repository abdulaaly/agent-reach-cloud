import { NextRequest } from "next/server";
import { db, hashString } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, action } = body;

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Valid email address is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.getUserByEmail(normalizedEmail);

    if (action === "signup") {
      if (existing) {
        return new Response(
          JSON.stringify({ ok: false, error: "An account with this email already exists. Please sign in." }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!password || password.length < 6) {
        return new Response(
          JSON.stringify({ ok: false, error: "Password must be at least 6 characters long." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const passwordHash = hashString(password);
      const user = db.createUser(normalizedEmail, name, passwordHash);
      const tokens = db.getUserTokens(user.id);
      return new Response(
        JSON.stringify({ ok: true, user, tokens, stats: db.getStats(user.id) }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "login") {
      if (!existing) {
        return new Response(
          JSON.stringify({ ok: false, error: "Account not found. Please sign up first." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      if (password && existing.passwordHash) {
        if (hashString(password) !== existing.passwordHash) {
          return new Response(
            JSON.stringify({ ok: false, error: "Incorrect password. Please try again." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      }
      const tokens = db.getUserTokens(existing.id);
      return new Response(
        JSON.stringify({ ok: true, user: existing, tokens, stats: db.getStats(existing.id) }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default: social auth sync (Google / GitHub)
    const user = db.getOrCreateUser(normalizedEmail, name);
    const tokens = db.getUserTokens(user.id);
    const stats = db.getStats(user.id);

    return new Response(
      JSON.stringify({ ok: true, user, tokens, stats }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Authentication error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing required userId parameter" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const user = db.getUser(userId);
  if (!user) {
    return new Response(
      JSON.stringify({ ok: false, error: "User session not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const tokens = db.getUserTokens(userId);
  const stats = db.getStats(userId);

  return new Response(
    JSON.stringify({ ok: true, user, tokens, stats }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
