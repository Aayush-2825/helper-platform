import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { handleApiError, ApiError } from "./api-error";
import { headers as nextHeaders } from "next/headers";

type HandlerContext = {
  params: Record<string, string>;
  user?: unknown; // Better Auth user type
};

type ApiHandlerConfig<TBody extends z.ZodType = z.ZodTypeAny, TQuery extends z.ZodType = z.ZodTypeAny> = {
  schema?: {
    body?: TBody;
    query?: TQuery;
  };
  requireAuth?: boolean;
};

/**
 * Higher-order function to create a standardized API handler with validation and error handling
 */
export function createApiHandler<
  TBody extends z.ZodType = z.ZodTypeAny,
  TQuery extends z.ZodType = z.ZodTypeAny,
>(
  config: ApiHandlerConfig<TBody, TQuery>,
  handler: (
    req: NextRequest,
    data: { body: z.infer<TBody>; query: z.infer<TQuery> },
    context: HandlerContext
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      let user = undefined;

      // 1. Auth Check
      if (config.requireAuth) {
        const session = await auth.api.getSession({
          headers: await nextHeaders(),
        });
        if (!session?.user) {
          throw ApiError.unauthorized();
        }
        user = session.user;
      }

      // 2. Validation
      let body = undefined;
      let query = undefined;

      if (config.schema?.body) {
        const rawBody = await req.json().catch(() => ({}));
        body = await config.schema.body.parseAsync(rawBody);
      }

      if (config.schema?.query) {
        const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
        query = await config.schema.query.parseAsync(rawQuery);
      }

      // 3. Execution
      return await handler(req, { body: body as z.infer<TBody>, query: query as z.infer<TQuery> }, { ...context, user });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
