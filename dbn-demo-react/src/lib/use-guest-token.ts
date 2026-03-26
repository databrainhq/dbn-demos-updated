import { useState, useCallback } from "react";
import { API_BASE_URL, DEFAULT_CLIENT_ID } from "./config";

export type TokenState = "idle" | "loading" | "setup" | "ready" | "error";

interface TokenOptions {
  clientId?: string;
  permissions?: Record<string, boolean>;
  params?: Record<string, unknown>;
  expiryTime?: number;
}

export function useGuestToken() {
  const [state, setState] = useState<TokenState>("idle");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const fetchToken = useCallback(async (opts: TokenOptions = {}) => {
    setState("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/guest-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: opts.clientId || DEFAULT_CLIENT_ID || "default",
          ...(opts.permissions && { permissions: opts.permissions }),
          ...(opts.params && { params: opts.params }),
          ...(opts.expiryTime && { expiryTime: opts.expiryTime }),
        }),
      });
      const data = await res.json();

      if (res.ok && data.configured === false) {
        setState("setup");
        return "";
      }
      if (res.ok && data.guestToken) {
        setToken(data.guestToken);
        setState("ready");
        return data.guestToken as string;
      }
      setState("error");
      setError(data.error || "Failed to get guest token");
      return "";
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Failed to connect to API");
      return "";
    }
  }, []);

  return { state, token, error, fetchToken };
}
