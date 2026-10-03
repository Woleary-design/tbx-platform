/** Allow only paths on this origin, including after browser URL normalization. */
export function safeNextPath(value?: string | null) {
  const fallback = "/dashboard";
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20\x7f]/.test(value)) return fallback;
  try {
    const base = "https://tbx.invalid";
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
