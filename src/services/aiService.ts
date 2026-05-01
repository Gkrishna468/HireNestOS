export async function callGemini(prompt: string) {
  const res = await fetch(
    "https://lxunyqrcajytliwllyox.supabase.co/functions/v1/gemini-handler",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }
  );

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
