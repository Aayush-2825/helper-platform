import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins/two-factor";
import { organization } from "better-auth/plugins/organization";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendInvitationEmail, sendPasswordResetEmail, sendVerificationEmail } from "@/lib/notifications/email";

export const auth = betterAuth({
  appName: "Helper Platform",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 256,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30, // 30 minutes
  },

  // Email Verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ user, url });
    },
    sendOnSignUp: true,
  },

  // Social OAuth Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURL: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
      scope: ["openid", "profile", "email", "https://www.googleapis.com/auth/calendar"],
      accessType: "offline",
    },
  },

  // Plugins
  plugins: [
    // Two-Factor Authentication
    twoFactor({
      issuer: "Zapier Clone",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
      },
      twoFactorCookieMaxAge: 600, // 10 minutes
    }),

    // Organizations & Teams
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10,
      membershipLimit: 500,
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
      invitationLimit: 100,
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async (data) => {
        await sendInvitationEmail(data);
      },
      teams: {
        enabled: true,
      },
    }),
  ],

  // Session Management
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
      strategy: "jwe", // Encrypted cookies
    },
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
    },
  },

  // Security
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableCSRFCheck: false,
    cookiePrefix: "zapier",
  },

  // User Configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },

  // Account Configuration
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});

// Export types for type safety
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
