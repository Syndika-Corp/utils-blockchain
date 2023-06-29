import 'dotenv/config';
import { MissingEnvVarError } from './errors/missing-env-var';
export function getEnvVar(name: string, defaultValue = undefined): string {
  const value = process.env[name];

  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new MissingEnvVarError(name);
}
