import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Trash2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SIMULATED_TRANSCRIPT =
  "There's a large pothole near the school entrance and vehicles are swerving to avoid it every morning.";

const BAR_COUNT = 26;

function formatTime(ms) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function sampleLevels(analyser, count) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  return Array.from({ length: count }, (_, i) => {
    const idx = Math.floor((i / count) * data.length * 0.7);
    return data[idx] / 255;
  });
}

export function VoiceRecorder({ value = "", onChange, onRecording, disabled }) {
  const [state, setState] = useState("idle"); // idle | requesting | recording | recorded
  const [levels, setLevels] = useState(() => Array(BAR_COUNT).fill(0.08));
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [simulated, setSimulated] = useState(false);
  const [sttUnavailable, setSttUnavailable] = useState(false);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  const stopWave = () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    rafRef.current = null;
    timerRef.current = null;
    setLevels(Array(BAR_COUNT).fill(0.08));
  };

  const tickWave = () => {
    if (analyserRef.current) {
      setLevels(sampleLevels(analyserRef.current, BAR_COUNT));
      rafRef.current = requestAnimationFrame(tickWave);
    } else {
      timerRef.current = setInterval(() => {
        setLevels(Array.from({ length: BAR_COUNT }, () => 0.1 + Math.random() * 0.8));
      }, 120);
    }
  };

  const cleanup = () => {
    stopWave();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
  };

  useEffect(() => () => cleanup(), []);

  const startRecording = async () => {
    if (disabled) return;
    setState("requesting");
    setAudioUrl(null);
    setDuration(0);
    setSttUnavailable(false);
    chunksRef.current = [];

    try {
      // Some browsers (and headless runners) neither grant nor deny mic access,
      // so guard against a never-settling permission prompt.
      const stream = await Promise.race([
        navigator.mediaDevices?.getUserMedia?.({ audio: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("mic timeout")), 1500)),
      ]);
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      startedAtRef.current = Date.now();
      tickWave();
      setState("recording");
    } catch {
      // No microphone available (e.g. headless browser) — demo mode.
      setSimulated(true);
      startedAtRef.current = Date.now();
      tickWave();
      setState("recording");
    }
  };

  const stopRecording = () => {
    const elapsed = Date.now() - startedAtRef.current;
    setDuration(elapsed);

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      const recordedChunks = chunksRef.current.slice();
      recorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (blob.size > 0) onRecording?.(new File([blob], "voice-note.webm", { type: "audio/webm" }));
      };
      recorderRef.current.stop();
    }
    cleanup();

    if (!onChange) {
      setState("recorded");
      return;
    }
    if (simulated && !value?.trim()) {
      onChange(SIMULATED_TRANSCRIPT);
    } else if (!simulated && !value?.trim()) {
      setSttUnavailable(true);
    }
    setState("recorded");
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setState("idle");
    setDuration(0);
    setSttUnavailable(false);
    onChange?.("");
  };

  const live = state === "recording";
  const showBars = state === "recording" || state === "recorded";

  return (
    <div className="rounded-lg border border-border/80 bg-background p-4">
      <div className="flex items-center gap-3">
        {showBars ? (
          <div className="flex h-12 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden>
            {levels.map((level, i) => (
              <div key={i} className="flex h-full flex-1 items-center">
                <motion.div
                  className={cn("w-full rounded-full", live ? "bg-ai" : "bg-primary/50")}
                  animate={{ height: `${8 + level * 92}%` }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-12 flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ai/10 text-ai">
              <Mic size={16} />
            </span>
            Describe what happened in a few words — we'll transcribe it.
          </div>
        )}

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          {state === "recording" ? (
            <Button
              size="icon"
              aria-label="Stop recording"
              className="h-11 w-11 rounded-full bg-error hover:bg-error/90"
              onClick={stopRecording}
            >
              <Square size={16} fill="currentColor" />
            </Button>
          ) : state === "recorded" ? (
            <div className="flex items-center gap-1.5">
              {audioUrl ? (
                <audio className="hidden" src={audioUrl} data-testid="voice-preview" />
              ) : null}
              <Button
                size="icon"
                variant="outline"
                aria-label="Delete recording"
                className="h-9 w-9"
                onClick={reset}
              >
                <Trash2 size={15} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Record again"
                className="h-9 w-9"
                onClick={() => setState("idle")}
              >
                <RefreshCw size={15} />
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              aria-label="Start voice recording"
              className="h-11 w-11 rounded-full"
              onClick={startRecording}
              disabled={disabled || state === "requesting"}
            >
              <Mic size={17} />
            </Button>
          )}
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {live ? formatTime(duration || Date.now() - startedAtRef.current) : state === "recorded" ? formatTime(duration) : "Record"}
          </span>
        </div>
      </div>

      {state === "recorded" && (
        <div className="mt-4">
          {sttUnavailable ? (
            <div className="space-y-3">
              <p className="rounded-lg border border-ai/25 bg-ai-gradient px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                Your voice note was recorded, but speech-to-text isn't available right now. You can
                type the description below and we'll keep the audio with the report.
              </p>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                placeholder="Type what happened…"
                className="text-sm"
                aria-label="Issue description"
              />
            </div>
          ) : (
            <>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ai-foreground">
                  <Sparkles size={12} className="text-ai" />
                  Transcription
                </span>
                <span className="text-[11px] text-muted-foreground">Tap to edit</span>
              </div>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                placeholder="What's happening? We'll keep your words verbatim."
                className="text-sm"
                aria-label="Transcription, editable"
              />
              {simulated && (
                <Badge variant="secondary" className="mt-2 font-normal">
                  <Sparkles size={10} className="text-ai" />
                  Demo transcription — edit if needed
                </Badge>
              )}
            </>
          )}
          {audioUrl && (
            <div className="mt-2 flex items-center gap-2">
              <audio controls src={audioUrl} className="h-9 w-full max-w-xs" data-testid="voice-preview" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
