import { fetchEmails, getEmailDetail, extractEmailText } from "@/services/gmailService";
import { parseResumeWithAI } from "@/services/intelligenceService";
import { supabase } from "@/lib/supabase";

export async function runEmailIngestionAgent() {
  try {
    const emails = await fetchEmails();

    let processed = 0;

    for (const mail of emails.slice(0, 5)) {
      const detail = await getEmailDetail(mail.id);

      const text = extractEmailText(detail.payload);

      if (!text) continue;

      const parsed = await parseResumeWithAI(text);

      await supabase.from("candidates").insert({
        name: parsed.name || "Unknown",
        email: parsed.email || "",
        phone: parsed.phone || "",
        skills: parsed.skills || [],
        current_title: parsed.currentTitle || "",
        summary: parsed.summary || "",
        stage: "screening",
      });

      processed++;
    }

    return `Processed ${processed} emails`;

  } catch (error) {
    console.error("Email ingestion error:", error);
    return "Failed";
  }
}
