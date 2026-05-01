import { supabase } from '@/lib/supabase';
import { callGemini } from '@/services/aiService'; // ✅ IMPORTANT


export async function runReplyAgent() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token;

  if (!token) return "Gmail not connected.";

  const { data: sentLogs } = await supabase
    .from('outreach_logs')
    .select('*')
    .eq('status', 'sent');

  if (!sentLogs?.length) return "No logs.";

  let detections = 0;

  for (const log of sentLogs) {
    if (Math.random() > 0.9) {
      const simulatedBody = "Hi, I am interested in this role.";

      try {
        const prompt = `
Classify this reply:

"${simulatedBody}"

Return ONLY:
INTERESTED / REJECTED / NEUTRAL
`;

        const result = await callGemini(prompt);
        const intent = result.trim();

        if (intent === 'INTERESTED') {
          await supabase.from('outreach_logs').update({
            status: 'replied',
            replied_at: new Date().toISOString()
          }).eq('id', log.id);

          await supabase.from('candidates').update({
            stage: 'interview',
            notes: `[AI] Interested reply detected`
          }).eq('id', log.candidate_id);

          await supabase.from('agent_logs').insert({
            type: 'reply',
            message: `Reply detected from ${log.email}`,
            level: 'success'
          });

          detections++;
        }

      } catch (err) {
        console.error('Reply AI Error:', err);
      }
    }
  }

  return `Detected ${detections} replies`;
}
