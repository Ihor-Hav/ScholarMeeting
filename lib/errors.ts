export class AppException extends Error {
  code: string;
  fields?: Record<string, string[]>;

  constructor({
    code,
    message,
    fields,
  }: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  }) {
    super(message);
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, AppException.prototype);
  }
}
