import { FileImage, Mic, FileText, MapPin, Sparkles, Pencil, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reportCategoryMeta } from "./reportMeta";

function ReviewRow({ icon, label, onEdit, children }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <div className="mt-0.5 text-sm text-foreground">{children}</div>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="-mr-2 h-8 shrink-0 px-2 text-xs" onClick={onEdit}>
        <Pencil size={12} />
        Edit
      </Button>
    </div>
  );
}

export function ReviewStep({ report, analysis, edits, onJump }) {
  const { media = [], transcript = "", description = "", location } = report;
  const category = edits.category ?? analysis?.category;

  const catMeta = category ? reportCategoryMeta(category) : null;
  const CatIcon = catMeta?.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="divide-y divide-border/70 px-2 sm:px-2">
            <ReviewRow icon={<FileImage size={15} />} label="Evidence" onEdit={() => onJump(0)}>
              {media.length > 0 || transcript ? (
                <span className="flex flex-wrap items-center gap-2">
                  {media.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="flex -space-x-2">
                        {media.slice(0, 3).map((m) => (
                          <img
                            key={m.id}
                            src={m.preview}
                            alt=""
                            className="h-8 w-8 rounded-md border object-cover"
                          />
                        ))}
                      </span>
                      {media.length} photo{media.length > 1 ? "s" : ""}
                      {media.length > 3 && " +"}
                    </span>
                  )}
                  {transcript && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mic size={13} className="text-ai" />
                      Voice note
                    </span>
                  )}
                  {media.length === 0 && !transcript && (
                    <span className="text-muted-foreground">None added</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">None added</span>
              )}
            </ReviewRow>

            <ReviewRow icon={<FileText size={15} />} label="Description" onEdit={() => onJump(1)}>
              <p className="line-clamp-2 max-w-md leading-relaxed">
                {description || transcript || "No description yet"}
              </p>
            </ReviewRow>

            <ReviewRow icon={<MapPin size={15} />} label="Location" onEdit={() => onJump(2)}>
              <span>{location?.name ?? "No location set"}</span>
            </ReviewRow>

            <ReviewRow icon={<Sparkles size={15} />} label="AI analysis" onEdit={() => onJump(3)}>
              {category ? (
                <div className="flex flex-wrap items-center gap-2">
                  {catMeta && CatIcon && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${catMeta.tone}`}>
                      <CatIcon size={12} />
                      {catMeta.label}
                    </span>
                  )}
                  <Badge variant="secondary" className="font-normal">Citizen-selected category</Badge>
                  <span className="text-xs text-muted-foreground">AI recommendations run after the report is safely stored.</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Choose a category before submitting</span>
              )}
            </ReviewRow>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-brand/20 bg-brand-light/40 p-4">
        <p className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>
            Your evidence is used to analyze and process this civic report. Only the information
            needed to route and resolve it is shared with the responsible team. Photos are not
            shared on social media.
          </span>
        </p>
      </div>
    </div>
  );
}
