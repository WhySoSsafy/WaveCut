export function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
