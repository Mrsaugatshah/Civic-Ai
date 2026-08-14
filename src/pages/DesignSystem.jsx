import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Plus,
  Bell,
  Settings,
  Search,
  MapPin,
  Camera,
  CheckCircle2,
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  FileWarning,
  Users,
  TrendingUp,
  Send,
  Info,
  AlertTriangle,
  CircleAlert,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Navbar, Logo } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { IssueCard } from "@/components/civic/IssueCard";
import { StatCard } from "@/components/civic/StatCard";
import { AICard, AIOrb } from "@/components/civic/AICard";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Page scaffolding                                                     */
/* ------------------------------------------------------------------ */

function Section({ id, eyebrow, title, description, children, className }) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, className }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-soft">
      <div className={cn("h-16", className)} />
      <div className="p-2.5">
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function DemoField({ label, children, error, hint }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demo data                                                            */
/* ------------------------------------------------------------------ */

const ISSUES = [
  {
    category: "Pothole",
    icon: Construction,
    title: "Deep pothole near Bhanu Chowk",
    description: "Large pothole on the main road — cars are swerving into the other lane to avoid it.",
    location: "Bhanu Chowk",
    date: "2h ago",
    status: "critical",
    severity: "critical",
    priority: 92,
  },
  {
    category: "Streetlight",
    icon: Lightbulb,
    title: "Streetlight out on Green Lane",
    description: "Three streetlights out, leaving a dark stretch right next to the bus stop.",
    location: "Green Lane",
    date: "Yesterday",
    status: "in_progress",
    severity: "medium",
    priority: 48,
  },
  {
    category: "Waste",
    icon: Trash2,
    title: "Overflowing bin at the market",
    description: "Waste bin overflowing for three days now — it's starting to smell.",
    location: "Central market",
    date: "3 days ago",
    status: "under_review",
    severity: "high",
    priority: 71,
  },
  {
    category: "Water",
    icon: Droplets,
    title: "Water leak on Oak Street",
    description: "Pipe has been leaking since morning, water pooling across the sidewalk.",
    location: "Oak Street",
    date: "5h ago",
    status: "resolved",
    severity: "low",
    priority: 22,
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DesignSystem() {
  const [notify, setNotify] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Button
        asChild
        variant="outline"
        className="fixed bottom-6 right-6 z-modal bg-white/90 shadow-lift backdrop-blur-sm hover:shadow-ai-glow"
      >
        <Link to="/">
          <ArrowLeft size={15} />
          View landing page
        </Link>
      </Button>
      <Navbar active="Home" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ------------------------------ Hero ------------------------------ */}
        <div className="relative overflow-hidden py-20 text-center sm:py-24">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_35%,black,transparent)]" />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-2xl"
          >
            <Badge variant="secondary" className="mb-5 px-3 py-1">
              <Sparkles size={12} className="mr-1.5 text-ai" />
              UI Foundation · Part 1 of 3
            </Badge>
            <h1 className="font-display text-display font-bold tracking-tight text-foreground text-balance">
              CivicAI <span className="ai-gradient-text">Design System</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
              The visual language behind CivicAI — civic-tech that feels like a real product:
              trustworthy, human, and precise. Every token below is centralized, so every future
              page automatically feels like part of the same product.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Colors", "Typography", "Buttons", "Cards", "Forms", "AI language", "Navigation"].map(
                (label) => (
                  <Badge key={label} variant="outline" className="text-xs font-normal">
                    {label}
                  </Badge>
                )
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-20 pb-24">
          {/* ---------------------------- Colors ---------------------------- */}
          <Section
            id="colors"
            eyebrow="01 · Color"
            title="Color system"
            description="A single semantic palette: civic blue as the brand, quiet neutrals for surfaces, and restrained feedback colors that never shout. The emerald brand tone supports sustainability; indigo is reserved for AI."
          >
            <p className="mb-3 text-sm font-semibold text-foreground">Brand — civic blue</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch name="Primary" hex="#2563EB" className="bg-[#2563EB]" />
              <Swatch name="Primary hover" hex="#1D4ED8" className="bg-[#1D4ED8]" />
              <Swatch name="Primary light" hex="#DBEAFE" className="bg-[#DBEAFE]" />
              <Swatch name="Primary dark" hex="#1E3A8A" className="bg-[#1E3A8A]" />
              <Swatch name="Ring / focus" hex="#2563EB" className="bg-[#2563EB]" />
            </div>

            <p className="mb-3 mt-8 text-sm font-semibold text-foreground">Feedback</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch name="Success" hex="#16A34A" className="bg-[#16A34A]" />
              <Swatch name="Warning" hex="#F59E0B" className="bg-[#F59E0B]" />
              <Swatch name="Error" hex="#DC2626" className="bg-[#DC2626]" />
              <Swatch name="Info" hex="#0EA5E9" className="bg-[#0EA5E9]" />
            </div>

            <p className="mb-3 mt-8 text-sm font-semibold text-foreground">Neutral</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Swatch name="Background" hex="#F8FAFC" className="bg-[#F8FAFC] ring-1 ring-inset ring-border" />
              <Swatch name="Card" hex="#FFFFFF" className="bg-white ring-1 ring-inset ring-border" />
              <Swatch name="Border" hex="#E2E8F0" className="bg-[#E2E8F0]" />
              <Swatch name="Muted" hex="#F1F5F9" className="bg-[#F1F5F9]" />
              <Swatch name="Muted text" hex="#64748B" className="bg-[#64748B]" />
              <Swatch name="Foreground" hex="#0F172A" className="bg-[#0F172A]" />
            </div>

            <p className="mb-3 mt-8 text-sm font-semibold text-foreground">Brand &amp; AI accents</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch name="Brand — emerald" hex="#0D9488" className="bg-[#0D9488]" />
              <Swatch name="Brand light" hex="#CCFBF1" className="bg-[#CCFBF1]" />
              <Swatch name="AI — indigo" hex="#6366F1" className="bg-[#6366F1]" />
              <Swatch name="AI gradient" hex="#EEF2FF → #EDE9FE" className="bg-ai-gradient" />
            </div>
          </Section>

          <Separator />

          {/* -------------------------- Typography -------------------------- */}
          <Section
            id="typography"
            eyebrow="02 · Type"
            title="Typography"
            description="Plus Jakarta Sans for display, Inter for body, JetBrains Mono for metadata. Hierarchy over weight — headings feel human, not heavy."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div className="border-b pb-4">
                    <p className="font-mono text-[11px] text-muted-foreground">Display · clamp(2.25rem → 3.5rem) · bold</p>
                    <p className="font-display mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Cities work better together.
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <p className="font-mono text-[11px] text-muted-foreground">H1 · 2.25rem · bold</p>
                    <p className="font-display mt-1 text-2xl font-bold tracking-tight text-foreground">
                      Report a problem in your city
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <p className="font-mono text-[11px] text-muted-foreground">H2 · 1.5rem · semibold</p>
                    <p className="font-display mt-1 text-xl font-semibold tracking-tight text-foreground">
                      How the AI priority engine works
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <p className="font-mono text-[11px] text-muted-foreground">H3 · 1.125rem · semibold</p>
                    <p className="font-display mt-1 text-lg font-semibold tracking-tight text-foreground">
                      Streetlight maintenance
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground">Body · 0.875rem · regular</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      CivicAI reads every citizen report — photo, description, and location — and
                      tells authorities which problem to fix first, out of hundreds.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="mb-3 text-sm font-semibold text-foreground">Small &amp; caption</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-muted-foreground">Small · metadata, timestamps</span>
                        <span className="text-xs text-muted-foreground">2h ago · Chitwan</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Caption · supporting info</span>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          sdg 11 · civictech
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="mb-3 text-sm font-semibold text-foreground">Weights</p>
                    <div className="space-y-2 font-display">
                      {[
                        ["Bold · display", "font-bold"],
                        ["Semibold · H", "font-semibold"],
                        ["Medium · emphasis", "font-medium"],
                        ["Regular · body", "font-normal"],
                      ].map(([label, cls]) => (
                        <p key={label} className={cn("text-lg text-foreground", cls)}>
                          {label}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>

          <Separator />

          {/* --------------------------- Buttons ---------------------------- */}
          <Section
            id="buttons"
            eyebrow="03 · Interaction"
            title="Buttons"
            description="Every variant shares the same tokens: rounded-md, medium height, a 150ms hover, and a subtle press. Loading states use the spinner; never block with static disabled text."
          >
            <div className="space-y-8">
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Variants</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button>Report an issue</Button>
                  <Button variant="secondary">Secondary action</Button>
                  <Button variant="outline">Outline action</Button>
                  <Button variant="ghost">Ghost action</Button>
                  <Button variant="destructive">Delete report</Button>
                  <Button variant="success">Mark resolved</Button>
                  <Button variant="ai">
                    <Sparkles size={15} /> Analyze with CivicAI
                  </Button>
                  <Button variant="link">Link action</Button>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Sizes &amp; icon buttons</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button variant="outline" size="icon" aria-label="Add">
                    <Plus size={16} />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Notifications">
                    <Bell size={16} />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings size={16} />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Search">
                    <Search size={16} />
                  </Button>
                  <Button>
                    <MapPin size={15} /> Use my location
                  </Button>
                  <Button>
                    <Camera size={15} /> Attach a photo
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">States</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button disabled>
                    <Loader2 size={15} className="animate-spin" />
                    Analyzing with AI
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>
                    <Send size={14} /> Submitting…
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* --------------------------- Badges ----------------------------- */}
          <Section
            id="badges"
            eyebrow="04 · Status"
            title="Badges"
            description="Soft backgrounds, matching text, a small icon, and pill shape. Color never carries meaning alone — every badge is labeled."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow status</CardTitle>
                  <CardDescription>The lifecycle of a citizen report.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <StatusBadge status="resolved" />
                  <StatusBadge status="in_progress" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="under_review" />
                  <StatusBadge status="critical" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semantic</CardTitle>
                  <CardDescription>Base badge variants map to the feedback palette.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">Resolved</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="info">Under review</Badge>
                  <Badge variant="ai">AI Verified</Badge>
                  <Badge variant="destructive">Critical</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severity</CardTitle>
                  <CardDescription>The AI's urgency assessment.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <SeverityBadge severity="critical" />
                  <SeverityBadge severity="high" />
                  <SeverityBadge severity="medium" />
                  <SeverityBadge severity="low" />
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          {/* ---------------------------- Cards ----------------------------- */}
          <Section
            id="cards"
            eyebrow="05 · Components"
            title="Cards"
            description="Border + a whisper of shadow + spacing. Cards lift 2px on hover — enough to feel alive, not enough to feel gimmicky."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {ISSUES.map((issue) => (
                <IssueCard key={issue.title} issue={issue} />
              ))}
            </div>

            <p className="mb-3 mt-10 text-sm font-semibold text-foreground">Statistics</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={FileWarning} label="Open issues" value="1,284" hint="across 12 wards" />
              <StatCard
                icon={CheckCircle2}
                label="Resolved this month"
                value="342"
                tone="success"
                trend={{ direction: "up", value: "12%" }}
              />
              <StatCard icon={Users} label="Active citizens" value="8,910" tone="brand" />
              <StatCard
                icon={TrendingUp}
                label="Avg. resolution"
                value="3.2 days"
                tone="ai"
                trend={{ direction: "down", value: "0.4d" }}
              />
            </div>
          </Section>

          <Separator />

          {/* ---------------------------- Forms ----------------------------- */}
          <Section
            id="forms"
            eyebrow="06 · Input"
            title="Forms"
            description="Friendly labels, helpful hints, and human error messages. One clear action per step — never a wall of fields."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report an issue</CardTitle>
                  <CardDescription>A compact preview of the reporting flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DemoField
                    label="What's wrong?"
                    hint="Be specific — the AI reads this to pick a category."
                  >
                    <Textarea
                      rows={3}
                      placeholder="e.g. A large pothole near the school gate, cars are swerving…"
                    />
                  </DemoField>

                  <DemoField label="Where did it happen?" hint="You can use your current location.">
                    <div className="flex gap-2">
                      <Input placeholder="Nearest landmark or street" className="flex-1" />
                      <Button variant="outline" type="button">
                        <MapPin size={15} /> Locate
                      </Button>
                    </div>
                  </DemoField>

                  <DemoField label="Category" hint="You can leave this to the AI.">
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect (AI)</SelectItem>
                        <SelectItem value="pothole">Pothole</SelectItem>
                        <SelectItem value="streetlight">Streetlight</SelectItem>
                        <SelectItem value="waste">Waste</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </DemoField>

                  <DemoField label="Your name" error="Please enter a valid name.">
                    <Input placeholder="Asha Mistry" aria-invalid="true" />
                  </DemoField>

                  <div className="flex items-center gap-2">
                    <Checkbox id="anon" />
                    <label htmlFor="anon" className="text-sm text-muted-foreground">
                      Report anonymously
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Radios and switches in one place.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <RadioGroup defaultValue="everyone">
                      <p className="text-sm font-medium">Who can see my reports?</p>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="everyone" id="r1" />
                        <label htmlFor="r1" className="text-sm text-muted-foreground">
                          Everyone in my city
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="authorities" id="r2" />
                        <label htmlFor="r2" className="text-sm text-muted-foreground">
                          Only authorities
                        </label>
                      </div>
                    </RadioGroup>
                    <Separator />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Status updates</p>
                        <p className="text-xs text-muted-foreground">
                          Email me when my report's status changes
                        </p>
                      </div>
                      <Switch checked={notify} onCheckedChange={setNotify} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI priority</CardTitle>
                    <CardDescription>The score authorities use to queue work.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PriorityMeter score={92} />
                    <PriorityMeter score={58} />
                    <PriorityMeter score={24} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ------------------------ AI visual language -------------------- */}
          <Section
            id="ai"
            eyebrow="07 · Intelligence"
            title="AI visual language"
            description="AI lives in indigo and violet — a soft glow, a sparkle, a gradient. It's unmistakable but never sci-fi. No neon, no pulsing grids."
          >
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-10 text-center">
                <AIOrb size={112} />
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">AI Orb</p>
                  <p className="mx-auto mt-1 max-w-[200px] text-xs text-muted-foreground">
                    Pure CSS — reserved for empty states and feature highlights.
                  </p>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <AICard badge="AI Priority Detection" title="This issue needs attention first">
                  A deep pothole near the school gate scores 92/100 — driven by high severity,
                  duplicate reports, and proximity to a school.
                </AICard>
                <AICard badge="AI Verification" title="Photo &amp; description match">
                  The image matches the reported category with 94% confidence. No duplicate
                  report found within 120m.
                </AICard>
              </div>
            </div>
          </Section>

          <Separator />

          {/* --------------------------- Feedback --------------------------- */}
          <Section
            id="feedback"
            eyebrow="08 · Feedback"
            title="Feedback & status"
            description="Alerts, progress, skeletons, and toasts — all written to sound human."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Report received</AlertTitle>
                  <AlertDescription>
                    Your report is on its way. We'll keep you updated.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Almost there</AlertTitle>
                  <AlertDescription>Add a photo to help the AI verify the issue.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>Upload failed</AlertTitle>
                  <AlertDescription>We couldn't upload that image. Try again.</AlertDescription>
                </Alert>
                <Alert variant="ai">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>AI analysis complete</AlertTitle>
                  <AlertDescription>
                    Classified as <strong>Pothole</strong>, severity <strong>Critical</strong>.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Progress &amp; skeleton</p>
                  <Progress value={64} className="max-w-md" />
                  <div className="mt-4 flex max-w-md items-center gap-3 rounded-lg border bg-card p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="About AI scoring">
                        <Info size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>How the AI priority score works</TooltipContent>
                  </Tooltip>
                  <Button
                    onClick={() =>
                      toast("Your report is on its way", {
                        description: "We'll email you the moment the status changes.",
                      })
                    }
                  >
                    <Bell size={15} /> Trigger a toast
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Before you submit</DialogTitle>
                        <DialogDescription>
                          Your report is shared with the relevant city department. You can stay
                          anonymous if you prefer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Submit report</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Tabs</p>
                  <Tabs defaultValue="map">
                    <TabsList>
                      <TabsTrigger value="map">Map view</TabsTrigger>
                      <TabsTrigger value="list">List view</TabsTrigger>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                    </TabsList>
                    <TabsContent value="map" className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                      Map view content goes here.
                    </TabsContent>
                    <TabsContent value="list" className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                      List view content goes here.
                    </TabsContent>
                    <TabsContent value="stats" className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                      Stats content goes here.
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ------------------------- Navigation --------------------------- */}
          <Section
            id="navigation"
            eyebrow="09 · Navigation"
            title="Navigation"
            description="Sticky, translucent, and quiet. Primary action always visible — even on mobile."
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Navbar active="City map" />
                <div className="flex h-40 items-center justify-center border-b bg-grid">
                  <p className="text-sm text-muted-foreground">Demo canvas — the navbar sits above</p>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </main>

      <Footer />

      {/* -------------------- Token/accessibility strip -------------------- */}
      <div className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xs text-muted-foreground">UI Foundation</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["4px spacing scale", "6–18px radius", "150–350ms motion", "AA contrast", "44px targets"].map(
              (t) => (
                <Badge key={t} variant="secondary" className="text-xs font-normal">
                  {t}
                </Badge>
              )
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            Design tokens live in <span className="font-mono">tailwind.config.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
