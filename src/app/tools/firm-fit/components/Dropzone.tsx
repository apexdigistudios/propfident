"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

interface DropzoneProps {
  onFile: (file: File) => Promise<void>;
}

export function Dropzone({ onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    const accepted = /\.(csv|htm|html|txt)$/i.test(file.name);
    if (!accepted) {
      setError("Choose a CSV, HTM, or TXT trade export.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onFile(file);
    } catch {
      setError("We could not read that file. Check the export format and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); void handleFile(event.dataTransfer.files[0]); }}
      className={`flex max-w-full flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed bg-slate-900/70 p-6 text-center backdrop-blur-xl transition-all duration-300 sm:p-12 ${dragging ? "border-purple-400 bg-purple-500/10" : "border-purple-900/30 hover:border-purple-500/40"}`}
    >
      <input ref={inputRef} type="file" accept=".csv,.htm,.html,.txt" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
      {loading ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-300" /> : <FileUp className="mx-auto h-10 w-10 text-purple-300" />}
      <p className="mt-4 text-lg font-bold text-white">{loading ? "Reading your trades..." : "Drop your trade export here"}</p>
      <p className="mt-2 text-sm text-slate-400">MT4, MT5, cTrader, and DXTrade CSV, HTM, or TXT files</p>
      {error && <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p>}
    </div>
  );
}
