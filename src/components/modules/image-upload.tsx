"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  file?: File;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
  maxSizeMb?: number;
  isAr?: boolean;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  folder = "products",
  maxFiles = 5,
  maxSizeMb = 5,
  isAr = false,
  className,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map((url) => ({ url })),
  );
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushChange = useCallback(
    (imgs: UploadedImage[]) => {
      onChange?.(imgs.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url));
    },
    [onChange],
  );

  const uploadFile = async (file: File): Promise<string> => {
    const { uploadApi } = await import("@/lib/api/upload");
    const { url } = await uploadApi.uploadImage(file, folder);
    return url;
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxFiles - images.filter((i) => !i.error).length;
      const toProcess = files.slice(0, Math.max(0, remaining));

      const oversized = toProcess.filter((f) => f.size > maxSizeMb * 1024 * 1024);
      const valid = toProcess.filter((f) => f.size <= maxSizeMb * 1024 * 1024);

      if (oversized.length > 0) {
        const errImgs: UploadedImage[] = oversized.map((f) => ({
          url: "",
          file: f,
          preview: URL.createObjectURL(f),
          error: `${isAr ? "الحجم يتجاوز" : "Taille max"} ${maxSizeMb}MB`,
        }));
        setImages((prev) => [...prev, ...errImgs]);
      }

      if (valid.length === 0) return;

      const placeholders: UploadedImage[] = valid.map((f) => ({
        url: "",
        file: f,
        preview: URL.createObjectURL(f),
        uploading: true,
      }));

      setImages((prev) => {
        const next = [...prev, ...placeholders];
        pushChange(next);
        return next;
      });

      const results = await Promise.allSettled(valid.map((f) => uploadFile(f)));

      setImages((prev) => {
        const next = [...prev];
        let pIdx = next.length - valid.length;
        results.forEach((result, i) => {
          const idx = pIdx + i;
          if (result.status === "fulfilled") {
            next[idx] = { url: result.value, preview: next[idx]?.preview };
          } else {
            next[idx] = {
              ...next[idx],
              url: "",
              uploading: false,
              error: isAr ? "فشل التحميل" : "Échec du téléchargement",
            };
          }
        });
        pushChange(next);
        return next;
      });
    },
    [images, maxFiles, maxSizeMb, isAr, folder, pushChange],
  );

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      pushChange(next);
      return next;
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) handleFiles(files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    e.target.value = "";
  };

  const canAdd = images.filter((i) => !i.error).length < maxFiles;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "relative h-20 w-20 rounded-xl overflow-hidden border-2 bg-gray-50 shrink-0",
                img.error ? "border-red-300" : img.uploading ? "border-souk-gold-300" : "border-gray-200",
              )}
            >
              {(img.preview || img.url) && (
                <Image
                  src={img.preview ?? img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={!!img.preview}
                />
              )}

              {/* Uploading overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-souk-green-700" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-1">
                  <AlertCircle size={16} className="text-red-500 mb-0.5" />
                  <p className="text-[9px] text-red-600 text-center leading-tight">{img.error}</p>
                </div>
              )}

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 end-1 h-5 w-5 rounded-full bg-gray-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-souk-green-400 hover:text-souk-green-600 transition-colors shrink-0"
            >
              <ImagePlus size={20} />
            </button>
          )}
        </div>
      )}

      {/* Drop zone — shown when no images or room for more */}
      {images.length === 0 && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-colors",
            dragging
              ? "border-souk-green-500 bg-souk-green-50"
              : "border-gray-300 hover:border-souk-green-400 hover:bg-gray-50",
          )}
        >
          <Upload size={24} className={dragging ? "text-souk-green-600" : "text-gray-400"} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              {isAr ? "اسحب الصور هنا أو انقر للاختيار" : "Glissez vos images ici ou cliquez"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAr
                ? `JPG، PNG، WEBP — حتى ${maxSizeMb}MB للصورة`
                : `JPG, PNG, WEBP — max ${maxSizeMb}MB par image`}
            </p>
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        onChange={onInputChange}
        className="hidden"
      />

      {/* Counter */}
      <p className="text-xs text-gray-400">
        {images.filter((i) => !i.error).length} / {maxFiles}{" "}
        {isAr ? "صورة" : "image(s)"}
      </p>
    </div>
  );
}
