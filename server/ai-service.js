import { CATEGORIES } from "./analysis.js";

const categories=new Map(CATEGORIES.map((c)=>[c.key,c]));
const priorities=new Set(["low","medium","high","critical"]);

function validate(result){
  if(!result||!categories.has(result.category)||!priorities.has(result.priority))throw new Error("AI returned an invalid category or priority.");
  const confidence=Number(result.confidence); if(!Number.isFinite(confidence)||confidence<0||confidence>1)throw new Error("AI returned invalid confidence.");
  const summary=String(result.summary||"").trim().slice(0,500); if(summary.length<10)throw new Error("AI returned an invalid summary.");
  const expected=categories.get(result.category).department;
  return {category:result.category,priority:result.priority,priorityScore:{low:30,medium:55,high:78,critical:95}[result.priority],department:result.department===expected?result.department:expected,confidence,summary};
}

export async function analyzeWithProvider(report){
  const provider=(process.env.AI_PROVIDER||"").toLowerCase();
  if(!provider)throw new Error("AI provider is not configured.");
  if(provider!=="openai-compatible")throw new Error("Unsupported AI provider.");
  const apiKey=process.env.AI_API_KEY; const model=process.env.AI_MODEL; const base=(process.env.AI_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,"");
  if(!apiKey||!model)throw new Error("AI credentials are incomplete.");
  const taxonomy=[...categories.values()].map(c=>`${c.key}: ${c.department}`).join("; ");
  const response=await fetch(`${base}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},signal:AbortSignal.timeout(15000),body:JSON.stringify({model,temperature:0,response_format:{type:"json_object"},messages:[{role:"system",content:`Analyze civic reports. Return JSON only: category, priority (low|medium|high|critical), department, confidence (0..1), summary. Categories/departments: ${taxonomy}`},{role:"user",content:JSON.stringify({title:report.title,description:report.description,userCategory:report.category,address:report.address})}]})});
  if(!response.ok)throw new Error(`AI provider request failed (${response.status}).`);
  const payload=await response.json(); return validate(JSON.parse(payload.choices?.[0]?.message?.content||"{}"));
}
