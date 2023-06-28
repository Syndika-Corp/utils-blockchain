export class InvalidConnectionError extends Error {
  constructor(url: string) {
    super(`Invalid url connection: ${url}.`);

    Object.setPrototypeOf(this, InvalidConnectionError.prototype);
  }
}
