import { useRef, useState } from "react";
import { UploadCloud, ImageOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_MEDIA_BYTES } from "@/services/report/reportService";
import { cn } from "@/lib/utils";

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateFile(file) {
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Only image files are supported for resolution evidence." };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, message: "This image is too large. Please choose a smaller file." };
  }
  return { ok: true };
}

/**
 * Resolution evidence uploader — reuses the same file-validation and
 * data-URL preview pattern as report/EvidenceStep.jsx, scoped down to a
 * single image since this is admin-only resolution proof, not citizen
 * evidence capture.
 */
export function ResolutionUpload({ existing, onUploaded, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(existing?.imageDataUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const verdict = validateFile(file);
    if (!verdict.ok) {
      toast.error(verdict.message);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFile(file);
      setPreview(dataUrl);
      await onUploaded(dataUrl);
      toast.success("Resolution evidence uploaded");
    } catch {
      toast.error("Couldn't upload the image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="group relative overflow-hidden rounded-lg border">
          <img src={preview} alt="Resolution evidence" className="max-h-56 w-full object-cover" />
          {!disabled && (
            <button
              type="button"
              aria-label="Replace resolution image"
              onClick={pick}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resolution image"
          onClick={disabled ? undefined : pick}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              pick();
            }
          }}
          onDragOver={(e) => {
            if (disabled) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (disabled) return;
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            disabled && "cursor-not-allowed opacity-60",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
          )}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageOff size={18} />
            </span>
          )}
          <p className="text-sm font-medium text-foreground">
            Drag &amp; drop, or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">Image only · up to 15 MB</p>
        </div>
      )}

      {preview && !disabled && (
        <Button variant="outline" size="sm" onClick={pick} disabled={uploading}>
          <UploadCloud size={14} />
          {uploading ? "Uploading…" : "Replace image"}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
