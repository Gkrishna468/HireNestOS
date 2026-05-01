export async function fetchEmails() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token;

  if (!token) throw new Error("Gmail not connected");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=has:attachment",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return data.messages || [];
}

/**
 * Extract readable email text safely
 */
export function extractEmailText(payload: any): string {
  if (!payload) return "";

  const parts = payload.parts || [];

  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      try {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } catch {
        return "";
      }
    }
  }
  /**
 * Fetch emails with attachments
 */
export async function fetchEmails() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    throw new Error("Gmail not connected");
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=has:attachment",
    {
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    }
  );

  const data = await res.json();

  return data.messages || [];
}

  return "";
}
