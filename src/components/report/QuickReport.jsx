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
  submitReport,
  submitGuestReport,
  analyzeDraft,
  MAX_MEDIA,
  MAX_MEDIA_BYTES,
  REPORT_PLACES,
} from "@/services/report/reportService";
import { getCurrentLocation } from "@/services/map/geolocation";

let quickSeq = 0;

export function QuickReport({ guest = false }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [media, setMedia] = useState([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [phase, setPhase] = useState("form"); // form | submitting | error | success
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
      if (file.size > MAX_MEDIA_BYTES) {
        toast.error("This file is too large. Please choose a smaller file.");
        continue;
      }
      if (media.length + files.indexOf(file) >= MAX_MEDIA) {
        toast.error(`You can attach up to ${MAX_MEDIA} files.`);
        break;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setMedia((m) => [...m, { id: `q-${++quickSeq}`, name: file.name, preview: reader.result, file }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const coords = await getCurrentLocation();
      setLocation({ ...coords, name: `Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`, confirmed: true });
      toast.success("Your current location was added to the report.");
    } catch (locationError) {
      toast.error(locationError.message);
    } finally {
      setLocating(false);
    }
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
    setPhase("submitting");
    try {
      let category = "other";
      try {
        const analysis = await analyzeDraft({ description, category, location, guest });
        if (analysis?.category) category = analysis.category;
      } catch {
        // AI is advisory; the report remains submit-able with the valid
        // manual fallback category and is retried asynchronously by the API.
      }
      const submitResult = await (guest ? submitGuestReport : submitReport)({
        title: "Quick civic report",
        category,
        description,
        location,
        media: media.map((item) => ({ ...item, kind: "image" })),
      });
      setSubmission({ ...submitResult, categoryKey: category, guest });
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setPhase("error");
      toast.error(submitError?.message || "We couldn't submit your report. Please try again.");
    }
  };

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar active="Home" />
        <main className="px-4 py-10 sm:px-6">
          <ReportSuccess
            submission={submission}
            onTrack={() => navigate(guest ? `/track?trackingId=${encodeURIComponent(submission.trackingId)}&accessToken=${encodeURIComponent(submission.accessToken)}` : "/dashboard")}
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
              <Link to={guest ? "/guest/report" : "/report"}>
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
                <span className="text-xs text-muted-foreground">Up to 8 MB each</span>
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
                <Link to={guest ? "/guest" : "/dashboard"}>
                  <ArrowLeft size={15} />
                  Back
                </Link>
              </Button>
              <Button size="sm" onClick={submit} disabled={phase === "submitting"}>
                {phase === "submitting" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Submitting securely…
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
              Your report is stored first; advisory AI analysis then runs securely on the backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
