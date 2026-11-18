// In-memory store for pending OAuth 2.0 authorization codes

export interface OAuthCodeData {
  userId: string;
  redirectUri: string;
  expiresAt: number;
}

export const oauthCodes = new Map<string, OAuthCodeData>();
