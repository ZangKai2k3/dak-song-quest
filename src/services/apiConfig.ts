/**
 * Cấu hình kết nối API chung cho toàn bộ ứng dụng
 */
export const getBackendUrl = (): string => {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return "http://localhost:5000";
    if (h.startsWith("192.168.") || h.startsWith("10.") || h.startsWith("172.")) {
      return `http://${h}:5000`;
    }
  }
  return "https://flatworm-unroll-estate.ngrok-free.dev";
};

const fetchWithTimeout = async (url: string, opts: RequestInit, timeoutMs = 8000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: opts.signal || controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const base = getBackendUrl();
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers || {});
  headers.set("ngrok-skip-browser-warning", "true");

  try {
    const res = await fetchWithTimeout(`${base}${fullPath}`, { ...options, headers });
    return res;
  } catch (err) {
    // Nếu kết nối chính thất bại hoặc timeout, thử fallback giữa localhost và ngrok
    const fallbackBase =
      base.includes("localhost") || base.includes("127.0.0.1")
        ? "https://flatworm-unroll-estate.ngrok-free.dev"
        : "http://localhost:5000";

    try {
      const fallbackRes = await fetchWithTimeout(`${fallbackBase}${fullPath}`, { ...options, headers }, 5000);
      return fallbackRes;
    } catch {
      throw err;
    }
  }
};

