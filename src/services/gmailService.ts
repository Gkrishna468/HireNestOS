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
