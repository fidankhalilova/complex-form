// setTimeout-simulated backend: username check, submit, and a retry helper for network failures.
export class NetworkError extends Error {}
export class ServerError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const TAKEN = ['admin', 'root', 'john'];

export async function checkUsername(username: string): Promise<boolean> {
  await delay(600);
  return !TAKEN.includes(username.toLowerCase());
}

export async function submitForm(values: Record<string, string>): Promise<void> {
  await delay(1000);
  if (values.username === 'offline' || Math.random() < 0.3) {
    throw new NetworkError('Network error. Check your connection.');
  }
  if (values.email === 'taken@example.com') {
    throw new ServerError('This email is already registered.');
  }
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2, wait = 500): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!(e instanceof NetworkError) || retries === 0) throw e;
    await delay(wait);
    return withRetry(fn, retries - 1, wait * 2);
  }
}