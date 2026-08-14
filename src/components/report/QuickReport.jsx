import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  UploadCloud,
  X,
  MapPin,
  LocateFixed,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  LayoutList,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportSuccess } from "./ReportSuccess";
import {
  analyzeReport,
  submitReport,
  REPORT_PLACES,
} from "@/services/report/reportService";
import { getCategory } from "@/services/categories/categoryService";
import { useAuth } from "@/contexts/AuthContext";

let quickSeq = 0;

export function QuickReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [media, setMedia] = useState([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [phase, setPhase] = useState("form"); // form | analyzing | error | success
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState("");

  const pickFiles = (list) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    for (const file of files) {
      const okType = file.type.startsWith("image/");
      if (!okType) {
        toast.error("This file type isn't supported.");
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("This file is too large. Please choose a smaller file.");
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setMedia((m) => [...m, { id: `q-${++quickSeq}`, name: file.name, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      fallbackLocation();
      return;
    }
    setLocating(true);
    let settled = false;
    const once = (fn) => () => {
      if (settled) return;
      settled = true;
      fn();
    };
    const onSuccess = once(() => {
      setLocation(REPORT_PLACES[0]);
      setLocating(false);
      toast.success("Location set.");
    });
    const onError = once(() => fallbackLocation());
    try {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 6000 });
      setTimeout(once(() => fallbackLocation()), 5000);
    } catch {
      fallbackLocation();
    }
  };

  const fallbackLocation = () => {
    setLocation(REPORT_PLACES[0]);
    setLocating(false);
    toast.info("Using a nearby location — position sharing is unavailable.");
  };

  const submit = async () => {
    if (!media.length && !description.trim()) {
      setError("Add at least one photo or description so we can understand the problem.");
      return;
    }
    if (!description.trim()) {
      setError("Tell us briefly what happened.");
      return;
    }
    if (!location) {
      setError("Add a location so the appropriate team can respond.");
      return;
    }
    setError("");
    setPhase("analyzing");
    try {
      const result = await analyzeReport(
        { description, transcript: "", location },
        {}
      );
      const categoryDefinition = getCategory(result.category);
      const submitResult = await submitReport({
        priority: result.priorityScore,
        categoryLabel: result.categoryLabel,
        categoryDepartment: categoryDefinition?.department ?? result.categoryDepartment,
        category: result.category,
        severity: result.severity,
        description,
        location,
        media: media.map((item) => ({ ...item, kind: "image" })),
        explanation: result.explanation,
        reporter: { id: user?.id, email: user?.email, name: user?.name },
      });
      setSubmission({ ...submitResult, categoryKey: result.category });
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPhase("error");
      toast.error("We couldn't submit your report. Please try again.");
    }
  };

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar active="Home" />
        <main className="px-4 py-10 sm:px-6">
          <ReportSuccess
            submission={submission}
            onTrack={() => navigate("/dashboard")}
            onHome={() => navigate("/")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar active="Home" />
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Quick report
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Photo, location, and a short note — submit in under a minute.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/report">
              <LayoutList size={14} />
              Full report
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Label className="text-sm font-semibold text-foreground">Add a photo</Label>
              {media.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5">
                  {media.map((m) => (
                    <div key={m.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                      <img src={m.preview} alt={m.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove ${m.name}`}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground"
                        onClick={() => setMedia((arr) => arr.filter((x) => x.id !== m.id))}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera size={18} />
                </span>
                <span className="text-sm font-medium text-foreground">Take or upload a photo</span>
                <span className="text-xs text-muted-foreground">Up to 15 MB</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => {
                  pickFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <Label className="text-sm font-semibold text-foreground">Where is it?</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={useMyLocation} disabled={locating}>
                  {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
                  {locating ? "Locating…" : "Use my location"}
                </Button>
                <Select
                  value={location?.name}
                  onValueChange={(name) => {
                    const place = REPORT_PLACES.find((p) => p.name === name);
                    if (place) setLocation(place);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <MapPin size={14} className="text-primary" />
                    <SelectValue placeholder="Choose an area" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_PLACES.map((place) => (
                      <SelectItem key={place.name} value={place.name}>
                        {place.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {location && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 size={12} className="text-success-foreground" />
                  {location.name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <Label htmlFor="quick-description" className="text-sm font-semibold text-foreground">
                What's happening?
              </Label>
              <Textarea
                id="quick-description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                rows={3}
                maxLength={300}
                placeholder="e.g. A deep pothole outside the school gate that cars keep hitting."
                className="text-[15px] leading-relaxed"
              />
              <p className="text-right text-[11px] tabular-nums text-muted-foreground">
                {description.length}/300
              </p>
            </CardContent>
          </Card>

          {error && (
            <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-error-foreground">
              <FileText size={15} />
              {error}
            </p>
          )}

          <div className="sticky bottom-0 border-t bg-background/95 py-4 backdrop-blur-sm md:static md:border-0">
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft size={15} />
                  Back
                </Link>
              </Button>
              <Button size="sm" onClick={submit} disabled={phase === "analyzing"}>
                {phase === "analyzing" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Analyzing &amp; submitting…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Submit report
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <UploadCloud size={11} />
              Our AI verifies, prioritizes, and routes your report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
