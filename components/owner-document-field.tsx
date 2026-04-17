"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, FileUp, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing-client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

type Props = {
  step: number;
  title: string;
  hint?: string;
  url: string | null;
  fileName: string | null;
  onUploaded: (url: string, name: string) => void;
  /** Call when user replaces an already-uploaded file so parent clears stored URL. */
  onClear: () => void;
  onError: (message: string) => void;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
};

export function OwnerDocumentField({
  step,
  title,
  hint,
  url,
  fileName,
  onUploaded,
  onClear,
  onError,
  onBusy,
  disabled,
}: Props) {
  const done = Boolean(url && fileName);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const { startUpload, isUploading } = useUploadThing("document", {
    onUploadBegin: () => {
      onError("");
      onBusy(true);
    },
    onClientUploadComplete: (res) => {
      onBusy(false);
      const f = res[0];
      if (f?.url && f.name) {
        setLocalFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onUploaded(f.url, f.name);
      }
    },
    onUploadError: (err) => {
      onBusy(false);
      onError(err.message || "Upload failed");
    },
  });

  const handlePickLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setLocalFile(f ?? null);
    onError("");
  };

  const clearLocalOnly = () => {
    setLocalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadToUploadThing = async () => {
    if (!localFile || disabled) return;
    await startUpload([localFile]);
  };

  const startReplace = () => {
    onClear();
    setLocalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onError("");
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums ${
            done ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
          }`}
          aria-hidden
        >
          {done ? <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} /> : step}
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="font-bold leading-snug text-foreground">{title}</p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
        </div>
      </div>

      {!done ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step 1 · File on your device
          </p>
          <label
            htmlFor={inputId}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/90 bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/35 ${
              disabled ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <HardDrive className="h-8 w-8 text-muted-foreground" aria-hidden />
            <span className="font-semibold text-foreground">Choose a file</span>
            <span className="text-xs text-muted-foreground">Stored locally until you send it — JPEG, PNG, or PDF</span>
            <input
              id={inputId}
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={disabled}
              onChange={handlePickLocal}
            />
          </label>

          {localFile ? (
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step 2 · Send to UploadThing
              </p>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <FileUp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate font-medium" title={localFile.name}>
                  {localFile.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={disabled || isUploading}
                  onClick={clearLocalOnly}
                >
                  Pick a different file
                </Button>
                <Button
                  type="button"
                  className="rounded-lg font-bold"
                  disabled={disabled || isUploading}
                  onClick={handleUploadToUploadThing}
                >
                  {isUploading ? "Uploading…" : "Upload document"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Uploaded</p>
              <p className="truncate text-sm font-medium text-green-950" title={fileName ?? undefined}>
                {fileName}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-green-300 bg-white font-bold text-green-900 hover:bg-green-100"
            disabled={disabled}
            onClick={startReplace}
          >
            Change file
          </Button>
        </div>
      )}
    </div>
  );
}
