import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, ThumbsUp, Bell, Share2, Building2 } from "lucide-react";
import { toast } from "sonner";

import { CATEGORY_LABEL, STATUS_META, departmentFor, priorityLevel } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueTimeline } from "./IssueTimeline";
import { RelatedIssues } from "./RelatedIssues";

function reportedLabel(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "reported just now";
  if (h < 24) return `reported ${h}h ago`;
  const d = Math.floor(h / 24);
  return `reported ${d}d ago`;
}

export function IssueDetailContent({ issue, onSelectRelated }) {
  const [following, setFollowing] = useState(false);
  const Icon = categoryIcon(issue.category);
  const statusMeta = STATUS_META[issue.status] ?? STATUS_META.reported;
  const level = priorityLevel(issue.priority);

  const share = async () => {
    const text = `CivicAI issue: ${issue.title} reported near ${issue.location}. See it on the city map.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Public link copied to clipboard");
    } catch {
      toast.info(text);
    }
  };

  return (
    <div data-testid="issue-detail-content" className="space-y-4">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow"
          style={{ backgroundColor: statusMeta.color }}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABEL[issue.category] ?? "Issue"} · {issue.id}
          </p>
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{issue.title}</h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-transparent" style={{ backgroundColor: `${statusMeta.color}18`, color: statusMeta.color }}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusMeta.color }} />
          {statusMeta.label}
        </Badge>
        <Badge variant="outline" className="font-medium text-foreground">{issue.priority == null ? "AI analysis pending" : `${level.label} priority`}</Badge>
        <Badge variant="secondary" className="font-normal text-muted-foreground">
          <ThumbsUp size={11} className="mr-1 text-primary" />
          {issue.votes}
        </Badge>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-primary" />{issue.location}</span>
        <span className="inline-flex items-center gap-1"><Calendar size={12} />{reportedLabel(issue.reportedAt)}</span>
      </p>

      {issue.priority != null && <PriorityMeter score={issue.priority} />}

      <p className="text-sm leading-relaxed text-foreground/80">{issue.description}</p>

      <div className="rounded-md border bg-accent/40 p-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Building2 size={13} className="text-primary" />
          {departmentFor(issue)}
        </span>
      </div>

      <div className="flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link to={`/reports/${issue.id}`}>View report</Link>
        </Button>
        <Button size="sm" variant={following ? "default" : "outline"} onClick={() => setFollowing((v) => !v)}>
          <Bell size={14} />
          {following ? "Following" : "Follow"}
        </Button>
        <Button size="sm" variant="outline" onClick={share} aria-label="Share this issue">
          <Share2 size={14} />
        </Button>
      </div>

      <IssueTimeline issue={issue} />
      <RelatedIssues issue={issue} onSelect={onSelectRelated} />
    </div>
  );
}
