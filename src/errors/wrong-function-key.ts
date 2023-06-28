export class WrongFunctionKey extends Error {
  constructor(functionKey: string) {
    super(`Wrong function key: ${functionKey}`);

    Object.setPrototypeOf(this, WrongFunctionKey.prototype);
  }
}
