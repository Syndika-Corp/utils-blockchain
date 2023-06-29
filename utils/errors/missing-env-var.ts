export class MissingEnvVarError extends Error {
  constructor(name: string) {
    super(`Environment variable '${name}' not set`);

    Object.setPrototypeOf(this, MissingEnvVarError.prototype);
  }
}
