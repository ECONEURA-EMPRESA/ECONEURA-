/**
 * Result Pattern for Type-Safe Error Handling
 * Inspired by Rust's Result<T, E>
 */

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export function ok<T, E = Error>(data: T): Result<T, E> {
  return { success: true, data };
}

export function err<T, E = Error>(error: E): Result<T, E> {
  return { success: false, error };
}

/**
 * Async wrapper that catches errors and returns a Result
 */
export async function toResult<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
