import { z } from "zod";

const organizationSlugPattern = /^[a-z0-9-]*$/;

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters."),
  slug: z
    .string()
    .regex(organizationSlugPattern, "Slug can only contain lowercase letters, numbers, and hyphens.")
    .optional(),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export function normalizeOrganizationSlug(name: string, slug?: string) {
  const base =
    slug?.trim() ||
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return base.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}