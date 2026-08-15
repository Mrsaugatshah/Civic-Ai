import { useAsync } from "@/hooks/useAsync";
import { apiFetch } from "@/services/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Tags } from "lucide-react";

export function Categories() {
  const data = useAsync(async () => (await apiFetch("/api/categories")).data, []);
  return <section id="categories" className="scroll-mt-24"><div className="mb-3"><h2 className="font-display text-lg font-bold">Categories</h2><p className="text-sm text-muted-foreground">Live categories and their responsible departments.</p></div><Card><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{data.loading ? <p className="text-sm text-muted-foreground">Loading categories…</p> : data.error ? <p className="text-sm text-error-foreground">{data.error.message}</p> : data.data?.map((item)=><div key={item.key} className="flex items-start gap-3 rounded-lg border p-3"><span className="rounded-md bg-primary/10 p-2 text-primary"><Tags size={15}/></span><div className="min-w-0"><p className="font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.department}</p><p className="mt-1 text-xs text-muted-foreground">{item.reportCount} report{item.reportCount===1?"":"s"}</p></div></div>)}</CardContent></Card></section>;
}
