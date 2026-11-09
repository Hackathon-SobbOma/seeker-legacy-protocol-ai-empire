import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import * as db from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";

type Provider = "x" | "linkedin";
type ProviderConfig = {
  provider: Provider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string;
  usePkce: boolean;
};

type OAuthState = {
  provider: Provider;
  userOpenId: string;
  nonce: string;
  verifier?: string;
  exp: number;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
};

const STATE_TTL_MS = 10 * 60 * 1000;

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function providerFrom(value: unknown): Provider | undefined {
  return value === "x" || value === "linkedin" ? value : undefined;
}

function getProviderConfig(provider: Provider): ProviderConfig {
  const config = provider === "x"
    ? {
        provider,
        clientId: ENV.xClientId,
        clientSecret: ENV.xClientSecret,
        redirectUri: ENV.xRedirectUri,
        authorizationUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.x.com/2/oauth2/token",
        scopes: "tweet.read users.read tweet.write offline.access",
        usePkce: true,
      }
    : {
        provider,
        clientId: ENV.linkedinClientId,
        clientSecret: ENV.linkedinClientSecret,
        redirectUri: ENV.linkedinRedirectUri,
        authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        scopes: "openid profile email w_member_social",
        usePkce: false,
      };

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error(`${provider} OAuth is not configured`);
  }
  return config;
}

function requireStateSecret(): string {
  if (!ENV.socialOAuthStateSecret) throw new Error("SOCIAL_OAUTH_STATE_SECRET is not configured");
  return ENV.socialOAuthStateSecret;
}

function sealState(state: OAuthState): string {
  const payload = encode(JSON.stringify(state));
  const signature = encode(createHmac("sha256", requireStateSecret()).update(payload).digest());
  return `${payload}.${signature}`;
}

function openState(value: string, provider: Provider): OAuthState {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) throw new Error("Invalid OAuth state");
  const expected = createHmac("sha256", requireStateSecret()).update(payload).digest();
  const actual = decode(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Invalid OAuth state signature");
  }
  const state = JSON.parse(decode(payload).toString("utf8")) as OAuthState;
  if (state.provider !== provider || !state.userOpenId || !state.nonce || state.exp < Date.now()) {
    throw new Error("Expired or mismatched OAuth state");
  }
  return state;
}

function createPkce() {
  const verifier = encode(randomBytes(32));
  const challenge = encode(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function getEncryptionKey(): Buffer {
  const configured = ENV.socialTokenEncryptionKey;
  if (!configured) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY is not configured");
  const key = /^[0-9a-fA-F]{64}$/.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (key.length !== 32) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY must encode 32 bytes");
  return key;
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1.${encode(iv)}.${encode(cipher.getAuthTag())}.${encode(ciphertext)}`;
}

export function decryptSecret(value: string): string {
  const [version, iv, tag, ciphertext] = value.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Invalid encrypted token");
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), decode(iv));
  decipher.setAuthTag(decode(tag));
  return Buffer.concat([decipher.update(decode(ciphertext)), decipher.final()]).toString("utf8");
}

function getQuery(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function requireUser(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (!user) throw new Error("Authentication required");
  return user;
}

function authorizationUrl(config: ProviderConfig, state: string, challenge?: string): string {
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", state);
  if (config.usePkce && challenge) {
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

async function exchangeCode(config: ProviderConfig, code: string, verifier?: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });
  if (config.provider === "x" && verifier) body.set("code_verifier", verifier);
  if (config.provider === "linkedin") {
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  }
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded" };
  if (config.provider === "x") {
    headers.authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;
  }
  const response = await fetch(config.tokenUrl, { method: "POST", headers, body });
  if (!response.ok) throw new Error(`${config.provider} token exchange failed with HTTP ${response.status}`);
  const result = await response.json() as TokenResponse;
  if (!result.access_token) throw new Error(`${config.provider} token response did not include an access token`);
  return result;
}

async function fetchProfile(provider: Provider, accessToken: string): Promise<{ id: string; displayName: string | null }> {
  const url = provider === "x"
    ? "https://api.x.com/2/users/me?user.fields=name,username"
    : "https://api.linkedin.com/v2/userinfo";
  const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`${provider} profile lookup failed with HTTP ${response.status}`);
  const body = await response.json() as Record<string, any>;
  if (provider === "x") {
    if (!body.data?.id) throw new Error("X profile response did not include an account id");
    return { id: String(body.data.id), displayName: body.data.username ? `@${body.data.username}` : body.data.name ?? null };
  }
  if (!body.sub) throw new Error("LinkedIn profile response did not include an account id");
  return { id: String(body.sub), displayName: body.name ?? body.email ?? null };
}

export function registerSocialOAuthRoutes(app: Express) {
  app.get("/api/social/:provider/connect", async (req: Request, res: Response) => {
    const provider = providerFrom(req.params.provider);
    if (!provider) {
      res.status(404).json({ error: "Unsupported social provider" });
      return;
    }
    try {
      const user = await requireUser(req);
      const config = getProviderConfig(provider);
      const pkce = config.usePkce ? createPkce() : undefined;
      const state = sealState({
        provider,
        userOpenId: user.openId,
        nonce: encode(randomBytes(16)),
        verifier: pkce?.verifier,
        exp: Date.now() + STATE_TTL_MS,
      });
      res.redirect(302, authorizationUrl(config, state, pkce?.challenge));
    } catch (error) {
      console.error(`[Social OAuth] ${provider} connect failed`, error instanceof Error ? error.message : "unknown error");
      res.status(503).json({ error: "Social provider is not configured or user authentication is unavailable" });
    }
  });

  app.get("/api/social/:provider/callback", async (req: Request, res: Response) => {
    const provider = providerFrom(req.params.provider);
    if (!provider) {
      res.status(404).json({ error: "Unsupported social provider" });
      return;
    }
    const code = getQuery(req, "code");
    const stateValue = getQuery(req, "state");
    const oauthError = getQuery(req, "error");
    if (oauthError) {
      res.status(400).json({ error: "Social authorization was declined" });
      return;
    }
    if (!code || !stateValue) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const state = openState(stateValue, provider);
      const user = await db.getUserByOpenId(state.userOpenId);
      if (!user) {
        res.status(401).json({ error: "Application user no longer exists" });
        return;
      }
      const config = getProviderConfig(provider);
      const token = await exchangeCode(config, code, state.verifier);
      const profile = await fetchProfile(provider, token.access_token!);
      await db.upsertSocialConnection({
        userId: user.id,
        provider,
        providerAccountId: profile.id,
        displayName: profile.displayName,
        encryptedAccessToken: encryptSecret(token.access_token!),
        encryptedRefreshToken: token.refresh_token ? encryptSecret(token.refresh_token) : null,
        tokenExpiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
        scopes: token.scope ?? config.scopes,
      });
      res.redirect(302, `/?social=connected&provider=${provider}`);
    } catch (error) {
      console.error(`[Social OAuth] ${provider} callback failed`, error instanceof Error ? error.message : "unknown error");
      res.status(400).json({ error: "Social connection could not be completed" });
    }
  });

  app.get("/api/social/connections", async (req: Request, res: Response) => {
    try {
      const user = await requireUser(req);
      res.json({ connections: await db.getSocialConnectionsByUserId(user.id) });
    } catch {
      res.status(401).json({ error: "Authentication required" });
    }
  });

  app.post("/api/social/:provider/disconnect", async (req: Request, res: Response) => {
    const provider = providerFrom(req.params.provider);
    if (!provider) {
      res.status(404).json({ error: "Unsupported social provider" });
      return;
    }
    try {
      const user = await requireUser(req);
      await db.revokeSocialConnection(user.id, provider);
      res.json({ success: true, provider });
    } catch {
      res.status(401).json({ error: "Authentication required" });
    }
  });
}
