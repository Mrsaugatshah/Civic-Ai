import { useState } from "react";
import { CheckCircle2, Plus, Sparkles, Tags } from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  listCategories,
  updateCategory,
} from "@/services/categories/categoryService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function CategoryManagement() {
  const [categories, setCategories] = useState(() => listCategories());
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [department, setDepartment] = useState("");

  const reload = () => setCategories(listCategories());

  const addCategory = (event) => {
    event.preventDefault();
    try {
      const category = createCategory({
        label: name,
        keywords: keywords.split(","),
        department,
        source: "admin",
      });
      setName("");
      setKeywords("");
      setDepartment("");
      reload();
      toast.success(`${category.label} is ready for AI sorting.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const setActive = (category, active) => {
    updateCategory(category.key, { active });
    reload();
  };

  const approve = (category) => {
    updateCategory(category.key, { pendingReview: false });
    reload();
    toast.success(`${category.label} approved.`);
  };

  return (
    <section id="categories" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tags size={18} className="text-primary" /> Category management
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                AI sorts reports by keywords. Unrecognized issues create a reviewable category automatically.
              </p>
            </div>
            <Badge variant="secondary">{categories.filter((category) => category.active).length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addCategory} className="grid gap-3 rounded-lg border bg-accent/20 p-4 md:grid-cols-3">
            <div>
              <Label htmlFor="category-name">Category name</Label>
              <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Illegal construction" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="category-keywords">AI keywords</Label>
              <Input id="category-keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="construction, illegal building" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="category-department">Responsible department</Label>
              <div className="mt-1.5 flex gap-2">
                <Input id="category-department" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Urban Planning" />
                <Button type="submit" aria-label="Add category"><Plus size={16} /> Add</Button>
              </div>
            </div>
          </form>

          <div className="grid gap-3 lg:grid-cols-2">
            {categories.map((category) => (
              <div key={category.key} className="flex items-start justify-between gap-4 rounded-lg border bg-background p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{category.label}</p>
                    {category.source === "ai" && <Badge className="gap-1 bg-ai/10 text-ai hover:bg-ai/10"><Sparkles size={11} /> AI-created</Badge>}
                    {category.pendingReview && <Badge variant="outline" className="border-warning/30 text-warning-foreground">Needs review</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{category.department}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {category.keywords.length ? category.keywords.join(", ") : "Manual selection only"}
                  </p>
                  {category.pendingReview && (
                    <Button type="button" variant="outline" size="sm" className="mt-3 h-8" onClick={() => approve(category)}>
                      <CheckCircle2 size={14} /> Approve category
                    </Button>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{category.active ? "Active" : "Off"}</span>
                  <Switch checked={category.active} onCheckedChange={(checked) => setActive(category, checked)} aria-label={`${category.active ? "Disable" : "Enable"} ${category.label}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
