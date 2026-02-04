const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() ||
  "http://localhost:5000";

console.log("[TravelBuddy] API_BASE =", API_BASE);

export async function api(path, { method = "GET", token, body } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  console.log("[TravelBuddy] Request:", method, url);

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}