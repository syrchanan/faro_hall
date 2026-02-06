// src/utils/seed.ts
// Stable seed utilities (base64url).

const BASE_KEY = 'seed';

export function base64UrlEncode(str: string): string {
  try {
    const bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(_, p) {
      return String.fromCharCode(parseInt(p, 16));
    });
    return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    return encodeURIComponent(str);
  }
}

export function base64UrlDecode(input: string): string {
  try {
    let v = input.replace(/-/g, '+').replace(/_/g, '/');
    while (v.length % 4) v += '=';
    const bin = atob(v);
    const utf8 = bin.split('').map(c => {
      const code = c.charCodeAt(0).toString(16).toUpperCase();
      return '%' + (code.length < 2 ? '0' + code : code);
    }).join("");
    return decodeURIComponent(utf8);
  } catch (e) {
    try { return decodeURIComponent(input); } catch { return input; }
  }
}

export function seedToUrl(seed: string, params?: Record<string, string | number | boolean>): string {
  const encoded = base64UrlEncode(seed);
  if (typeof window === 'undefined') return '/?seed=' + encodeURIComponent(encoded);
  const url = new URL(window.location.href);
  url.searchParams.set(BASE_KEY, encoded);
  if (params) Object.keys(params).forEach(k => url.searchParams.set(k, String((params as any)[k])));
  return url.pathname + url.search;
}

export function urlToSeed(urlLike: string): string {
  try {
    const url = new URL(urlLike, (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://example.com');
    const v = url.searchParams.get(BASE_KEY);
    if (!v) return "";
    return base64UrlDecode(v);
  } catch (e) {
    const m = (urlLike || "").match(/[?&]seed=([^&]+)/);
    if (!m) return "";
    return base64UrlDecode(decodeURIComponent(m[1]));
  }
}

export async function deterministicSeedFromEntropy(entropy?: string | number | Uint8Array): Promise<string> {
  const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => (b < 16 ? "0" : "") + b.toString(16)).join("");
  if (typeof entropy === "number") entropy = String(entropy as number);
  if (typeof entropy === "string") {
    if (typeof window !== "undefined" && (window as any).crypto && (window.crypto as any).subtle) {
      const enc = new TextEncoder();
      const buf = await (window.crypto.subtle.digest("SHA-1", enc.encode(entropy)) as Promise<ArrayBuffer>);
      return toHex(buf).slice(0, 20);
    }
    // FNV-1a 32-bit fallback
    let h = 2166136261 >>> 0;
    for (let i = 0; i < (entropy as string).length; i++) { h ^= (entropy as string).charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return (h >>> 0).toString(16);
  }
  if (typeof window !== "undefined" && (window as any).crypto && (window.crypto as any).getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => (b < 16 ? "0" : "") + b.toString(16)).join("");
  }
  return Promise.resolve(Math.random().toString(16).slice(2));
}
