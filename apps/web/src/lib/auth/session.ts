"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "./client";

interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    role?: string;
  };
}

interface SessionContextValue {
  session: SessionData | null;
  loading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

let cachedSession: SessionData | null | undefined;
let cachedSessionError: Error | null = null;
let inFlightSessionRequest: Promise<SessionData | null> | null = null;

async function requestSession() {
  if (!inFlightSessionRequest) {
    inFlightSessionRequest = authClient
      .getSession()
      .then(({ data }) => {
        cachedSession = data;
        cachedSessionError = null;
        return data;
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error("Failed to load session");
        cachedSessionError = error;
        throw error;
      })
      .finally(() => {
        inFlightSessionRequest = null;
      });
  }

  return inFlightSessionRequest;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(cachedSession ?? null);
  const [loading, setLoading] = useState(cachedSession === undefined);
  const [error, setError] = useState<Error | null>(cachedSessionError);

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await requestSession();
      setSession(data);
      setError(null);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load session");
      setError(nextError);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cachedSession !== undefined) {
      setSession(cachedSession);
      setError(cachedSessionError);
      setLoading(false);
      return;
    }

    void loadSession();
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      refreshSession: loadSession,
    }),
    [session, loading, error]
  );

  return createElement(SessionContext.Provider, { value }, children);
}

/**
 * Hook to get the current session
 * Returns null if user is not authenticated
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return {
    session: context.session,
    loading: context.loading,
    error: context.error,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { session, loading } = useSession();
  return { isAuthenticated: !!session, loading };
}

/**
 * Hook to access user data
 */
export function useUser() {
  const { session, loading, error } = useSession();
  return { user: session?.user || null, loading, error };
}

/**
 * Hook to manage sign out
 */
export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await authClient.signOut();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sign out failed"));
    } finally {
      setLoading(false);
    }
  };

  return { signOut, loading, error };
}

/**
 * Hook to manage 2FA
 */
export function useTwoFactor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enable = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.twoFactor.enable({ password });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyTotp = async (code: string, trustDevice?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice,
      });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const disable = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.twoFactor.disable({ password });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { enable, verifyTotp, disable, loading, error };
}

/**
 * Hook to manage organizations
 */
export function useOrganization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (name: string, slug?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.organization.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const setActive = async (organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.organization.setActive({
        organizationId,
      });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (
    email: string,
    role: "member" | "admin" | "owner" = "member"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await authClient.organization.inviteMember({
        email,
        role,
      });
      if (err) {
        setError(new Error(err.message));
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { create, setActive, inviteMember, loading, error };
}
