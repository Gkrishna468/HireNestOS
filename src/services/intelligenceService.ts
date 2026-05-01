import { supabase } from "@/lib/supabase";
import { recordDeal } from "./financialService";
import { calculateAdjustedBudget } from "./marketplaceService";
import { callGemini } from "./aiService"; // ✅ NEW


/**
 * JOB POSTING: Initial trigger for marketplace
 */
export async function processNewJob(job: any) {
  const adjustedBudget = await calculateAdjustedBudget(job.company_id, job.budget);

  await supabase
    .from('jobs')
    .update({ adjusted_budget: adjustedBudget })
    .eq('id', job.id);

  await supabase.from('agent_logs').insert({
    type: 'revenue',
    level: 'info',
    message: `[CFO AGENT] Budget adjusted for ${job.title}. Client Gross: ₹${job.budget} -> Vendor Net: ₹${adjustedBudget}`,
    metadata: { jobId: job.id, gross: job.budget, net: adjustedBudget }
  });
}


/**
 * Resume Parser (FIXED - using Edge Function)
 */
export async function parseResumeWithAI(text: string) {
  const prompt = `
Extract structured JSON from this resume:

Return:
{
  "name": "",
  "email": "",
  "phone": "",
  "currentTitle": "",
  "skills": [],
  "experience": "",
  "education": "",
  "summary": ""
}

TEXT:
${text.substring(0, 5000)}
`;

  try {
    const raw = await callGemini(prompt);

    return JSON.parse(raw);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return {
      name: "Unknown",
      email: "",
      phone: "",
      currentTitle: "",
      skills: [],
      experience: "",
      education: "",
      summary: ""
    };
  }
}


/**
 * AI MATCHING (FIXED)
 */
export async function scoreCandidateForJob(job: any, candidate: any) {
  const prompt = `
Score candidate vs job (0-100):

JOB:
${job.title}
${job.skills?.join(", ")}
${job.description}

CANDIDATE:
${candidate.name}
${candidate.skills?.join(", ")}
${candidate.summary}

Return JSON:
{
 "score": number,
 "reasoning": "",
 "gaps": [],
 "recommendation": "shortlist" | "reserve" | "reject"
}
`;

  try {
    const raw = await callGemini(prompt);
    return JSON.parse(raw);
  } catch (error) {
    console.error("AI Matching Error:", error);
    return { score: 0, reasoning: "Failed", gaps: [], recommendation: 'reject' };
  }
}


/**
 * DECISION AGENT (UNCHANGED LOGIC)
 */
export async function runDecisionAgent() {
  await supabase.from('agent_logs').insert({
    type: 'decision',
    message: 'Autonomous Decision Agent cycle started.',
    level: 'info'
  });

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('stage', 'screening');

  if (!candidates?.length) return "No candidates.";

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open');

  if (!jobs?.length) return "No jobs.";

  let decisions = 0;

  for (const candidate of candidates) {
    let bestMatch: any = null;

    for (const job of jobs) {
      const evaluation = await scoreCandidateForJob(job, candidate);

      if (evaluation.score >= 85) {
        if (!bestMatch || evaluation.score > bestMatch.score) {
          bestMatch = { job, evaluation };
        }
      }
    }

    if (bestMatch) {
      await supabase.from('candidates').update({
        stage: 'interview',
        notes: `[AI AUTO] ${bestMatch.evaluation.score}% match`
      }).eq('id', candidate.id);

      await recordDeal(bestMatch.job, candidate, 150000);
      decisions++;
    }
  }

  return `Done: ${decisions} shortlisted`;
}
