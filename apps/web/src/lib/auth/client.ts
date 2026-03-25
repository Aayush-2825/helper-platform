import { createAuthClient } from "better-auth/react";
import { organizationClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/2fa-verify";
      },
    }),
    organizationClient(),
  ],
});
