import { ZodError } from "zod";
import { AppException } from "./errors";
import type { ActionResult } from "./action-result";

// helper функція
function mapZodErrors(error: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_error";
    result[key] ??= [];
    result[key].push(issue.message);
  }

  return result;
}

export function withAction<T>(
  action: () => Promise<T>,
): Promise<ActionResult<T>> {
  return action()
    .then((data) => ({ ok: true as const, data }))
    .catch((error) => {
      if (error instanceof ZodError) {
        return {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            fields: mapZodErrors(error),
          },
        };
      }

      if (error instanceof AppException) {
        return {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            fields: error.fields,
          },
        };
      }

      console.error(error);

      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
        },
      };
    });
}
