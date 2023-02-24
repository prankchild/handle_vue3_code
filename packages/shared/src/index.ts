export function isObject(value: unknown): value is Record<any, any> {
  return value !== null && typeof value === "object";
}
