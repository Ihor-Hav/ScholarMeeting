export type AppError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};
