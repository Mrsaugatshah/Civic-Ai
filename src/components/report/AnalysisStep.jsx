import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategorySelector } from "./CategorySelector";

export function AnalysisStep({ analysis, setAnalysis, edits, setEdits }) {
  useEffect(()=>{if(!analysis)setAnalysis({category:"other",categoryLabel:"Other Civic Issue",severity:"pending",priorityScore:null,explanation:"Analysis will run securely after submission."});},[analysis,setAnalysis]);
  const category=edits.category??analysis?.category??"other";
  return <div className="space-y-4"><Card><CardContent className="p-6"><div className="flex gap-3"><Sparkles className="mt-0.5 text-ai" size={20}/><div><h2 className="font-display font-semibold">Backend AI analysis</h2><p className="mt-1 text-sm text-muted-foreground">Choose the category that best describes the issue. After submission, CivicAI’s backend analyzes the report, validates the provider response, and stores recommendations separately from your selection.</p></div></div></CardContent></Card><Card><CardContent className="p-6"><CategorySelector value={category} onChange={(key)=>setEdits({...edits,category:key})}/></CardContent></Card></div>;
}
