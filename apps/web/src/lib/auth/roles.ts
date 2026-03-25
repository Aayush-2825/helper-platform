export const appRoles = ["user", "customer", "helper", "admin"] as const;

export type AppRole = (typeof appRoles)[number];

export function normalizeRole(role: string | undefined | null): AppRole {
  if (role === "customer" || role === "helper" || role === "admin") {
    return role;
  }

  return "user";
}

export function getHomeRouteForRole(role: string | undefined | null): "/customer" | "/helper" | "/admin" {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedRole === "helper") {
    return "/helper";
  }

  return "/customer";
}
