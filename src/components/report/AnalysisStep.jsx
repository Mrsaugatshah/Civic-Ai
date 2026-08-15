import { Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { CategorySelector } from "./CategorySelector";
import { analyzeDraft } from "@/services/report/reportService";
import { listCategories } from "@/services/categories/categoryService";

function normalizeCategory(value) {
  const text = String(value || "").trim().toLowerCase();
  const compact = text.replace(/[^a-z0-9]/g, "");
  return listCategories().find((item) => {
    const candidates = [item.key, item.label, item.key.replaceAll("_", " ")];
    return candidates.some((candidate) => {
      const normalized = String(candidate).toLowerCase();
      return normalized === text || normalized.replace(/[^a-z0-9]/g, "") === compact;
    });
  })?.key || null;
}

export function AnalysisStep({ input, edits, setEdits, guest = false }) {
  const category=edits.category;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    if (!input?.description || input.description.trim().length < 10) return undefined;
    setLoading(true);
    analyzeDraft({ description: input.description, category: category || "other", location: input.location, guest })
      .then((data) => { if (active) { setResult(data); const suggested = normalizeCategory(data.category); if (suggested && !edits.category) setEdits((current) => ({ ...current, category: suggested })); } })
      .catch((error) => {
        if (active) {
          setResult(null);
          // AI is advisory. Keep the guided flow submit-able with the safe
          // existing fallback category when the provider is unavailable.
          if (!edits.category) setEdits((current) => ({ ...current, category: "other" }));
          toast.error("AI analysis is unavailable. Choose a category manually to continue.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // Re-run only when the citizen's description changes; manual category edits must not trigger a new request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input?.description]);
  return <div className="space-y-4"><Card><CardContent className="p-6"><div className="flex gap-3"><Sparkles className="mt-0.5 text-ai" size={20}/><div><h2 className="font-display font-semibold">AI category suggestion</h2><p className="mt-1 text-sm text-muted-foreground">AI suggests a category from your description. You can always change it manually before submitting.</p>{loading&&<p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={13} className="animate-spin"/>Analyzing your report…</p>}{result&&!loading&&<p className="mt-3 text-xs text-muted-foreground">Suggested department: <span className="font-medium text-foreground">{result.department}</span> · {Math.round(result.confidence*100)}% confidence</p>}</div></div></CardContent></Card><Card><CardContent className="p-6"><CategorySelector value={category} onChange={(key)=>setEdits({...edits,category:key})}/></CardContent></Card></div>;
}
