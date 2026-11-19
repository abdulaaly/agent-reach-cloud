import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  computeUnits: number;
  tier: "free" | "starter" | "pro" | "agency";
  createdAt: string;
}

export interface ApiToken {
  id: string;
  userId: string;
  keyPrefix: string;     // e.g. "ar_live_a1b2..."
  keyHash: string;       // SHA-256 hash of the full token
  label: string;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
  requestCount: number;
}

export interface OAuthClient {
  clientId: string;
  clientSecret?: string;
  clientName: string;
  redirectUris: string[];
  createdAt: string;
}

export interface OAuthCode {
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge?: string;
  codeChallengeMethod?: "S256" | "plain";
  expiresAt: number;
}

export interface OAuthToken {
  tokenHash: string;
  userId: string;
  clientId: string;
  scope: string;
  expiresAt: number;
  createdAt: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  tokenId?: string;
  toolName: string;
  channel: string;
  computeCost: number;
  durationMs: number;
  status: "success" | "rate_limited" | "error";
  timestamp: string;
  querySummary?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId: string;
  amountCents: number;
  creditsAdded: number;
  tier: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: Record<string, User>;
  tokens: Record<string, ApiToken>;           // keyed by tokenId
  oauthClients: Record<string, OAuthClient>;  // keyed by clientId
  oauthCodes: Record<string, OAuthCode>;      // keyed by code
  oauthTokens: Record<string, OAuthToken>;    // keyed by tokenHash
  usageLogs: UsageLog[];
  transactions: Transaction[];
}

const DB_DIR = process.env.VERCEL
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "agent_reach_cloud.json");

const TOKEN_SECRET = process.env.AUTH_SECRET || "agent_reach_enterprise_jwt_hmac_secret_2026";

export function signStatelessKey(userId: string, label: string, type: "live" | "oauth" = "live"): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, l: label, t: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex").substring(0, 24);
  return `ar_${type}_${payload}_${sig}`;
}

export function verifyStatelessKey(rawTokenStr: string): { userId: string; label: string; type: string } | null {
  if (!rawTokenStr.startsWith("ar_live_") && !rawTokenStr.startsWith("ar_oauth_")) {
    return null;
  }
  const isOAuth = rawTokenStr.startsWith("ar_oauth_");
  const prefix = isOAuth ? "ar_oauth_" : "ar_live_";
  const rest = rawTokenStr.substring(prefix.length);
  const lastUnderscore = rest.lastIndexOf("_");
  if (lastUnderscore <= 0) return null;

  const payload = rest.substring(0, lastUnderscore);
  const sig = rest.substring(lastUnderscore + 1);

  const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex").substring(0, 24);
  if (sig !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return { userId: data.u, label: data.l, type: isOAuth ? "oauth" : "live" };
  } catch {
    return null;
  }
}

let memoryDb: DatabaseSchema | null = null;

export function hashString(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function ensureDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
      if (!memoryDb!.oauthClients) memoryDb!.oauthClients = {};
      if (!memoryDb!.oauthCodes) memoryDb!.oauthCodes = {};
      if (!memoryDb!.oauthTokens) memoryDb!.oauthTokens = {};
      return memoryDb!;
    }
  } catch (err) {
    console.warn("Falling back to fresh in-memory database:", err);
  }

  memoryDb = {
    users: {},
    tokens: {},
    oauthClients: {
      "chatgpt": {
        clientId: "chatgpt",
        clientName: "ChatGPT Custom Actions / GPTs",
        redirectUris: [
          "https://chatgpt.com/aip/g-custom/oauth/callback",
          "https://chat.openai.com/aip/g-custom/oauth/callback",
        ],
        createdAt: new Date().toISOString(),
      },
      "claude": {
        clientId: "claude",
        clientName: "Claude Web & Desktop",
        redirectUris: [
          "https://claude.ai/api/mcp/oauth_callback",
          "http://localhost:3000/api/oauth/callback",
        ],
        createdAt: new Date().toISOString(),
      },
    },
    oauthCodes: {},
    oauthTokens: {},
    usageLogs: [],
    transactions: [],
  };

  persistDb();
  return memoryDb;
}

function persistDb() {
  if (!memoryDb) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist database to disk:", err);
  }
}

export const db = {
  // --- User Management ---
  getUser(userId: string): User | null {
    const data = ensureDb();
    return data.users[userId] || null;
  },

  getUserByEmail(email: string): User | null {
    const data = ensureDb();
    const normalized = email.toLowerCase().trim();
    return Object.values(data.users).find((u) => u.email.toLowerCase() === normalized) || null;
  },

  createUser(email: string, name?: string, passwordHash?: string): User {
    const data = ensureDb();
    const normalized = email.toLowerCase().trim();
    const existing = Object.values(data.users).find((u) => u.email.toLowerCase() === normalized);
    if (existing) return existing;

    const id = "usr_" + crypto.randomBytes(8).toString("hex");
    const user: User = {
      id,
      email: normalized,
      name: name || normalized.split("@")[0],
      passwordHash,
      computeUnits: 500, // 500 free starting units
      tier: "free",
      createdAt: new Date().toISOString(),
    };

    data.users[id] = user;
    persistDb();
    return user;
  },

  updateUserUnits(userId: string, delta: number): User | null {
    const data = ensureDb();
    const user = data.users[userId];
    if (!user) return null;
    user.computeUnits = Math.max(0, user.computeUnits + delta);
    persistDb();
    return user;
  },

  getOrCreateUser(email: string, name?: string): User {
    const user = this.getUserByEmail(email);
    if (user) return user;
    return this.createUser(email, name);
  },

  // --- API Key Management (SHA-256 Hashed) ---
  getUserTokens(userId: string): ApiToken[] {
    const data = ensureDb();
    return Object.values(data.tokens).filter((t) => t.userId === userId);
  },

  createToken(userId: string, label: string): { token: ApiToken; rawKey: string } {
    const data = ensureDb();
    const rawKey = signStatelessKey(userId, label.trim() || "Remote MCP Key", "live");
    const keyHash = hashString(rawKey);
    const tokenId = "tok_" + crypto.randomBytes(6).toString("hex");

    const token: ApiToken = {
      id: tokenId,
      userId,
      keyPrefix: rawKey.substring(0, 16),
      keyHash,
      label: label.trim() || "Remote MCP Key",
      active: true,
      createdAt: new Date().toISOString(),
      requestCount: 0,
    };

    data.tokens[tokenId] = token;
    persistDb();
    return { token, rawKey };
  },

  revokeToken(userId: string, tokenId: string): boolean {
    const data = ensureDb();
    const token = data.tokens[tokenId];
    if (token && token.userId === userId) {
      token.active = false;
      persistDb();
      return true;
    }
    return false;
  },

  toggleToken(userId: string, tokenId: string): boolean {
    const data = ensureDb();
    const token = data.tokens[tokenId];
    if (token && token.userId === userId) {
      token.active = !token.active;
      persistDb();
      return token.active;
    }
    return false;
  },

  validateToken(rawTokenStr: string): { valid: boolean; user?: User; token?: ApiToken; isOAuth?: boolean; reason?: string } {
    const data = ensureDb();
    const targetHash = hashString(rawTokenStr.trim());

    // 1. Check API Keys table
    const apiKey = Object.values(data.tokens).find((t) => t.keyHash === targetHash);
    if (apiKey) {
      if (!apiKey.active) {
        return { valid: false, reason: "API key is revoked or inactive." };
      }
      const user = data.users[apiKey.userId];
      if (!user) {
        return { valid: false, reason: "User associated with API key not found." };
      }
      if (user.computeUnits <= 0) {
        return { valid: false, reason: "Compute balance depleted. Please top up credits.", user, token: apiKey };
      }
      return { valid: true, user, token: apiKey, isOAuth: false };
    }

    // 2. Check OAuth access tokens table
    const oauth = data.oauthTokens[targetHash];
    if (oauth) {
      if (oauth.expiresAt < Date.now()) {
        return { valid: false, reason: "OAuth token has expired." };
      }
      const user = data.users[oauth.userId];
      if (!user) {
        return { valid: false, reason: "User associated with OAuth token not found." };
      }
      if (user.computeUnits <= 0) {
        return { valid: false, reason: "Compute balance depleted. Please top up credits.", user };
      }
      return { valid: true, user, isOAuth: true };
    }

    // 3. Stateless Signed Token Verification (Resilient across multi-tenant Serverless Lambdas)
    const verified = verifyStatelessKey(rawTokenStr.trim());
    if (verified) {
      let user = data.users[verified.userId];
      if (!user) {
        user = {
          id: verified.userId,
          email: verified.userId.includes("@") ? verified.userId : `${verified.userId}@agent-reach.cloud`,
          name: verified.label || "Cloud Developer",
          computeUnits: 500,
          tier: "pro",
          createdAt: new Date().toISOString(),
        };
        data.users[verified.userId] = user;
      }
      if (user.computeUnits <= 0) {
        return { valid: false, reason: "Compute balance depleted. Please top up credits.", user };
      }

      const isOAuth = verified.type === "oauth";
      const tokenId = "tok_" + targetHash.substring(0, 10);
      let token = data.tokens[tokenId];
      if (!token) {
        token = {
          id: tokenId,
          userId: verified.userId,
          keyPrefix: rawTokenStr.substring(0, 16),
          keyHash: targetHash,
          label: verified.label,
          active: true,
          createdAt: new Date().toISOString(),
          requestCount: 0,
        };
        data.tokens[tokenId] = token;
      }
      persistDb();
      return { valid: true, user, token, isOAuth };
    }

    // 4. For backward compatibility with tests/development token format
    const legacyToken = Object.values(data.tokens).find((t) => (t as any).token === rawTokenStr);
    if (legacyToken && legacyToken.active) {
      const user = data.users[legacyToken.userId];
      if (user) {
        return { valid: true, user, token: legacyToken, isOAuth: false };
      }
    }

    return { valid: false, reason: "Invalid token: key signature not recognized." };
  },

  // --- OAuth 2.0 Management ---
  registerOAuthClient(clientName: string, redirectUris: string[]): OAuthClient {
    const data = ensureDb();
    const clientId = "client_" + crypto.randomBytes(8).toString("hex");
    const clientSecret = "sec_" + crypto.randomBytes(16).toString("hex");
    const client: OAuthClient = {
      clientId,
      clientSecret,
      clientName: clientName || "Universal MCP Client",
      redirectUris: redirectUris || [],
      createdAt: new Date().toISOString(),
    };
    data.oauthClients[clientId] = client;
    persistDb();
    return client;
  },

  getOAuthClient(clientId: string): OAuthClient | null {
    const data = ensureDb();
    return data.oauthClients[clientId] || null;
  },

  createOAuthCode(params: {
    userId: string;
    clientId: string;
    redirectUri: string;
    codeChallenge?: string;
    codeChallengeMethod?: "S256" | "plain";
  }): string {
    const data = ensureDb();
    const code = "code_" + crypto.randomBytes(16).toString("hex");
    data.oauthCodes[code] = {
      code,
      userId: params.userId,
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      codeChallengeMethod: params.codeChallengeMethod,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    persistDb();
    return code;
  },

  consumeOAuthCode(code: string): OAuthCode | null {
    const data = ensureDb();
    const entry = data.oauthCodes[code];
    if (!entry) return null;
    delete data.oauthCodes[code];
    persistDb();
    if (entry.expiresAt < Date.now()) return null;
    return entry;
  },

  issueOAuthToken(userId: string, clientId: string, scope: string = "mcp:tools"): string {
    const data = ensureDb();
    const rawToken = signStatelessKey(userId, clientId, "oauth");
    const tokenHash = hashString(rawToken);

    data.oauthTokens[tokenHash] = {
      tokenHash,
      userId,
      clientId,
      scope,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      createdAt: new Date().toISOString(),
    };
    persistDb();
    return rawToken;
  },

  // --- Quota & Telemetry ---
  deductCompute(
    userId: string,
    tokenId: string,
    amount: number,
    toolName: string,
    channel: string,
    querySummary?: string,
    durationMs: number = 200
  ): boolean {
    const data = ensureDb();
    const user = data.users[userId];
    if (!user || user.computeUnits < amount) return false;

    user.computeUnits = Math.max(0, user.computeUnits - amount);

    const token = data.tokens[tokenId] || Object.values(data.tokens).find((t) => t.id === tokenId);
    if (token) {
      token.requestCount = (token.requestCount || 0) + 1;
      token.lastUsedAt = new Date().toISOString();
    }

    const log: UsageLog = {
      id: "log_" + crypto.randomBytes(5).toString("hex"),
      userId,
      tokenId: token ? token.id : tokenId,
      toolName,
      channel,
      computeCost: amount,
      durationMs,
      status: "success",
      timestamp: new Date().toISOString(),
      querySummary,
    };
    data.usageLogs.unshift(log);
    if (data.usageLogs.length > 200) {
      data.usageLogs = data.usageLogs.slice(0, 200);
    }

    persistDb();
    return true;
  },

  deductQuota(userId: string, tokenId?: string, amount: number = 1): { success: boolean; remaining: number } {
    const data = ensureDb();
    const user = data.users[userId];
    if (!user) return { success: false, remaining: 0 };
    if (user.computeUnits < amount) return { success: false, remaining: user.computeUnits };

    user.computeUnits -= amount;
    if (tokenId) {
      const token = data.tokens[tokenId];
      if (token) {
        token.requestCount = (token.requestCount || 0) + 1;
        token.lastUsedAt = new Date().toISOString();
      }
    }
    persistDb();
    return { success: true, remaining: user.computeUnits };
  },

  recordAuditLog(params: {
    userId: string;
    tokenId?: string;
    toolName: string;
    unitsCharged: number;
    status: "success" | "error" | "rejected_quota";
    latencyMs?: number;
    metadata?: any;
  }) {
    const data = ensureDb();
    const user = data.users[params.userId];
    if (user) {
      user.computeUnits = Math.max(0, user.computeUnits - params.unitsCharged);
    }

    if (params.tokenId) {
      const token = data.tokens[params.tokenId];
      if (token) {
        token.requestCount = (token.requestCount || 0) + 1;
        token.lastUsedAt = new Date().toISOString();
      }
    }

    const log: UsageLog = {
      id: "log_" + crypto.randomBytes(5).toString("hex"),
      userId: params.userId,
      tokenId: params.tokenId,
      toolName: params.toolName,
      channel: params.metadata?.channel || "mcp",
      computeCost: params.unitsCharged,
      durationMs: params.latencyMs || 150,
      status: params.status === "rejected_quota" ? "rate_limited" : params.status,
      timestamp: new Date().toISOString(),
      querySummary: params.metadata?.target || params.metadata?.query || undefined,
    };

    data.usageLogs.unshift(log);
    if (data.usageLogs.length > 200) {
      data.usageLogs = data.usageLogs.slice(0, 200);
    }

    persistDb();
  },

  getUsageLogs(userId: string, limit: number = 50): UsageLog[] {
    const data = ensureDb();
    return data.usageLogs.filter((l) => l.userId === userId).slice(0, limit);
  },

  addCredits(
    userId: string,
    amount: number,
    orderId: string,
    amountCents: number = 0,
    tier: string = "topup"
  ): User | null {
    const data = ensureDb();
    const user = data.users[userId];
    if (!user) return null;

    user.computeUnits += amount;
    if (tier && tier !== "topup") {
      user.tier = tier as any;
    }

    data.transactions.push({
      id: "txn_" + crypto.randomBytes(5).toString("hex"),
      userId,
      orderId,
      amountCents,
      creditsAdded: amount,
      tier,
      createdAt: new Date().toISOString(),
    });

    persistDb();
    return user;
  },

  getUserStats(userId: string) {
    return this.getStats(userId);
  },

  getStats(userId: string) {
    const data = ensureDb();
    const user = data.users[userId];
    if (!user) return null;

    const userLogs = data.usageLogs.filter((l) => l.userId === userId);
    const totalRequests = userLogs.length;
    const totalComputeUsed = userLogs.reduce((acc, l) => acc + l.computeCost, 0);

    const platformBreakdown: Record<string, number> = {};
    for (const log of userLogs) {
      platformBreakdown[log.channel] = (platformBreakdown[log.channel] || 0) + 1;
    }

    return {
      computeBalance: user.computeUnits,
      tier: user.tier,
      totalRequests,
      totalComputeUsed,
      platformBreakdown,
      recentLogs: userLogs.slice(0, 10),
    };
  },
};
