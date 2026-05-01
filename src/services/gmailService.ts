import { supabase } from "@/lib/supabase";

/**
 * Fetch email list (with attachments)
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


/**
 * Get full email details
 */
export async function getEmailDetail(id: string) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    throw new Error("Gmail not connected");
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
    {
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch email");
  }

  return await res.json();
}


/**
 * Extract readable text from email
 */
export function extractEmailText(payload: any): string {
  if (!payload) return "";

  const parts = payload.parts || [];

  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      try {
        return atob(
          part.body.data.replace(/-/g, '+').replace(/_/g, '/')
        );
      } catch {
        return "";
      }
    }
  }

  return "";
}
