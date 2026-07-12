const CF_API = "https://api.cloudflare.com/client/v4";

function cfToken(): string | null {
  return process.env.CLOUDFLARE_API_TOKEN || null;
}

function cfAcct(): string | null {
  return process.env.CLOUDFLARE_ACCOUNT_ID || null;
}

export function cfHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${cfToken()}` };
}

export async function cfFetch(path: string, options: Record<string, any> = {}): Promise<any> {
  const token = cfToken();
  const acct = cfAcct();
  if (!token || !acct) return null;
  const base = path.startsWith("/zones") ? `${CF_API}${path}` : `${CF_API}/accounts/${acct}${path}`;
  const opts: RequestInit = { ...options, headers: { ...cfHeaders(), ...options.headers } };
  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData) && !(opts.body instanceof URLSearchParams) && !(opts.body instanceof ReadableStream) && !(opts.body instanceof ArrayBuffer)) {
    (opts as any).body = JSON.stringify(opts.body);
  }
  try {
    const res = await fetch(base, opts);
    return await res.json();
  } catch {
    return null;
  }
}

export async function cfFetchOrNull(path: string, options: Record<string, any> = {}): Promise<any> {
  return cfFetch(path, options);
}
