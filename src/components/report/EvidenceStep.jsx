import { useEffect, useRef, useState } from "react";
import { Camera, UploadCloud, ImagePlus, X, Loader2, CheckCircle2, Video, CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VoiceRecorder } from "./VoiceRecorder";
import { MAX_MEDIA, MAX_MEDIA_BYTES } from "@/services/report/reportService";
import { cn } from "@/lib/utils";

let mediaSeq = 0;

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateFile(file) {
  const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!okType) return { ok: false, message: "This file type isn't supported." };
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, message: "This file is too large. Please choose a smaller file." };
  }
  return { ok: true };
}

function MediaItem({ item, onRemove }) {
  const phase = "ready";
  const Icon = item.kind === "video" ? Video : ImagePlus;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {item.kind === "image" ? (
        <img src={item.preview} alt={item.name} className="h-full w-full object-cover" />
      ) : (
        <video src={item.preview} className="h-full w-full object-cover" muted />
      )}

      {phase === "processing" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/85 text-center">
          <Loader2 size={16} className="animate-spin text-ai" />
          <span className="px-2 text-[11px] font-medium text-muted-foreground">Analyzing image…</span>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-medium text-white">
          <Icon size={10} />
          <span className="truncate">{phase === "ready" ? "Image received" : item.name}</span>
          <span className="ml-auto inline-flex items-center gap-0.5 text-emerald-300">
            <CheckCircle2 size={10} />
            Visual evidence
          </span>
        </div>
      )}

      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-100 shadow-sm transition-opacity hover:text-foreground group-hover:opacity-100"
        onClick={() => onRemove(item.id)}
      >
        <X size={13} />
      </button>
    </div>
  );
}

function CameraCapture({ open, onOpenChange, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    setError(false);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (!alive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Camera isn't ready yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setBusy(true);
    canvas.toBlob((blob) => {
      setBusy(false);
      if (!blob) {
        toast.error("Couldn't capture the photo.");
        return;
      }
      const url = URL.createObjectURL(blob);
      onCapture({
        id: `media-${++mediaSeq}`,
        kind: "image",
        name: "Camera photo.jpg",
        size: blob.size,
        preview: url,
        file: new File([blob], "camera-photo.jpg", { type: "image/jpeg" }),
      });
      onOpenChange(false);
    }, "image/jpeg", 0.9);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription>Hold your camera steady and capture the issue.</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border bg-black">
          {error ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 p-6 text-center">
              <Camera size={28} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Camera unavailable</p>
              <p className="text-xs text-muted-foreground">
                We couldn't access your camera. Upload a photo instead.
              </p>
            </div>
          ) : (
            <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover" />
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={capture} disabled={error || busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            Capture photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EvidenceStep({ value, onChange, error, disabled }) {
  const { media = [], transcript = "" } = value;
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const remaining = MAX_MEDIA - media.length;
    const accepted = [];
    for (const file of files) {
      const verdict = validateFile(file);
      if (!verdict.ok) {
        toast.error(verdict.message);
        continue;
      }
      if (accepted.length >= remaining) {
        toast.error(`You can attach up to ${MAX_MEDIA} files.`);
        break;
      }
      const kind = "image";
      const preview = await readFile(file);
      accepted.push({
        id: `media-${++mediaSeq}`,
        kind,
        name: file.name,
        size: file.size,
        preview,
        file,
      });
    }
    if (accepted.length) onChange({ media: [...media, ...accepted] });
  };

  const removeMedia = (id) => {
    onChange({ media: media.filter((m) => m.id !== id) });
  };

  const pickFiles = () => inputRef.current?.click();

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Add evidence</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Photos and videos help the AI understand the problem — the more, the clearer.
            </p>
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" data-testid="media-grid">
              {media.map((item) => (
                <MediaItem key={item.id} item={item} onRemove={removeMedia} />
              ))}
              {media.length < MAX_MEDIA && (
                <button
                  type="button"
                  onClick={pickFiles}
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Add more photos"
                >
                  <ImagePlus size={18} />
                </button>
              )}
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload photos or videos"
            onClick={pickFiles}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pickFiles();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40"
            )}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud size={20} />
            </span>
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP · up to {MAX_MEDIA} files · 8 MB each
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCameraOpen(true)} disabled={disabled}>
              <Camera size={15} />
              Take a photo
            </Button>
            <Button variant="outline" onClick={pickFiles} disabled={disabled}>
              <UploadCloud size={15} />
              Upload files
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Add a voice note</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Speak for up to a minute — the AI turns your words into a description.
            </p>
          </div>
          <VoiceRecorder value={transcript} onChange={(t) => onChange({ transcript: t })} disabled={disabled} />
        </CardContent>
      </Card>

      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(item) => onChange({ media: [...media, item] })}
      />

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-error-foreground">
          <CircleAlert size={15} />
          {error}
        </p>
      )}
    </div>
  );
}
