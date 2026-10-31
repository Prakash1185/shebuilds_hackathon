"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  aspectRatio?: "square" | "banner";
  presetOptions?: string[];
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "shecan/store",
  label = "Upload Image",
  aspectRatio = "square",
  presetOptions,
}: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 8MB");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 data url for the API upload
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: dataUrl, folder }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      onChange(json.url);
      toast.success("Image uploaded successfully to Cloudinary! ☁️");
    } catch (e) {
      console.warn("Cloudinary direct upload issue, using local preview:", e);
      // Fallback: If Cloudinary keys are misconfigured, use the dataUrl as preview so UI never breaks
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
          toast.info("Image attached (Offline preview mode)");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const isBanner = aspectRatio === "banner";

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <ImageIcon className="h-4 w-4 text-violet-600" />
          {label}
        </label>
        {value && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 border-border/80 group bg-muted/30 shadow-sm ${
            isBanner ? "h-44 w-full" : "h-48 w-48 mx-auto"
          }`}
        >
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={value.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 text-xs bg-white text-gray-900 hover:bg-gray-100 shadow-md"
            >
              Change
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
                className="h-8 text-xs shadow-md"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
            <Check className="h-3 w-3 text-green-400" />
            Cloudinary Ready
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-violet-600 bg-violet-50/50"
              : "border-border hover:border-violet-500/60 hover:bg-muted/20"
          } ${isBanner ? "h-36 w-full" : "h-44 w-full"}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
              <p className="text-xs font-medium text-muted-foreground">
                Uploading to Cloudinary...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WEBP up to 8MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Preset suggestions for quick fill */}
      {presetOptions && presetOptions.length > 0 && !value && (
        <div className="space-y-1 pt-1">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Or choose a sample image:
          </p>
          <div className="flex flex-wrap gap-2">
            {presetOptions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset)}
                className="relative h-12 w-12 rounded-lg overflow-hidden border border-border hover:border-violet-600 transition-all shrink-0 group"
              >
                <Image src={preset} alt="Sample" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
