import { AppError } from "./app-error";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };
