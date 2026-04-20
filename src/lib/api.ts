const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8090";

export interface InviteResponse {
  success: boolean;
  method: string;
  error: string;
}

export async function sendInvite(params: {
  phone: string;
  complexName: string;
  sentBy?: string;
}): Promise<InviteResponse> {
  const res = await fetch(`${API_URL}/api/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
