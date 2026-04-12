import { z } from "zod";

export const twoFactorPasswordSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export type TwoFactorPasswordFormValues = z.infer<typeof twoFactorPasswordSchema>;