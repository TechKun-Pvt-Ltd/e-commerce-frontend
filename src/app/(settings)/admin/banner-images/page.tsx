"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, FolderOpen, Image as ImageIcon, RefreshCw, Star, Trash2, Upload } from "lucide-react";
import useDrivePicker from "react-google-drive-picker";

import { BannerImage } from "@/types/domains/bannerImage";
import * as bannerImagesService from "@/services/bannerImages";

export default function BannerImagesAdminPage() {
  const [makeDefault, setMakeDefault] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openPicker, authResponse] = useDrivePicker();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<BannerImage[]>([]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await bannerImagesService.getAllBannerImages();
      if (!res.success) { toast.error(res.error, { richColors: true }); return; }
      setRows(res.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const createFromUploadedUrl = useCallback(async (uploadedUrl: string) => {
    const res = await bannerImagesService.createBannerImage({ imageUrl: uploadedUrl, isDefault: makeDefault });
    if (!res.success) { toast.error(res.error, { richColors: true }); return; }
    toast.success("Banner added", { richColors: true });
    await refresh();
  }, [makeDefault]);

  const handleDeviceUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    setFile(f);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("folder", "banners");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(json?.error || "Upload failed", { richColors: true }); return; }
      const url = typeof json?.url === "string" ? json.url : null;
      if (!url?.startsWith("http")) { toast.error("Invalid URL returned", { richColors: true }); return; }
      setPreviewSrc(url);
      await createFromUploadedUrl(url);
    } finally {
      setIsUploading(false);
    }
  }, [createFromUploadedUrl]);

  const handleOpenPicker = useCallback(() => {
    try {
      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
        token: authResponse?.access_token,
        viewId: "DOCS_IMAGES",
        multiselect: false,
        supportDrives: true,
        viewMimeTypes: "image/png,image/jpeg,image/jpg,image/gif,image/webp",
        callbackFunction: async (data) => {
          if (!(data.action === "picked" && data.docs?.length)) return;
          const fileId = data.docs[0].id;
          if (!fileId) return;
          setIsUploading(true);
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: `https://drive.google.com/uc?id=${fileId}&export=view`, folder: "banners" }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) { toast.error(json?.error || "Upload failed", { richColors: true }); return; }
            const url = typeof json?.url === "string" ? json.url : null;
            if (!url?.startsWith("http")) { toast.error("Invalid URL returned", { richColors: true }); return; }
            setPreviewSrc(url);
            await createFromUploadedUrl(url);
          } finally {
            setIsUploading(false);
          }
        },
      });
    } catch {
      toast.error("Could not open Google Drive picker");
    }
  }, [openPicker, authResponse, createFromUploadedUrl]);

  const setAsDefault = async (bannerImageId: number) => {
    const res = await bannerImagesService.updateBannerImage(bannerImageId, { isDefault: true });
    if (!res.success) { toast.error(res.error, { richColors: true }); return; }
    toast.success("Set as default", { richColors: true });
    await refresh();
  };

  const remove = async (bannerImageId: number) => {
    const res = await bannerImagesService.deleteBannerImage(bannerImageId);
    if (!res.success) { toast.error(res.error, { richColors: true }); return; }
    toast.success("Deleted", { richColors: true });
    await refresh();
  };

  const displaySrc = previewSrc ?? previewUrl;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white border flex items-center justify-center shrink-0">
            <ImageIcon className="size-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Banner Images</h1>
            <p className="text-xs text-muted-foreground">Manage homepage hero banners</p>
          </div>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          {isLoading ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Upload panel */}
      <div className="rounded-xl border bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-800">Add new banner</p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Upload buttons */}
          <div className="flex flex-col gap-3 flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              className="hidden"
              onChange={handleDeviceUpload}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 rounded-lg border bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none px-4 py-3 text-sm font-medium text-gray-700 transition-colors"
            >
              <Upload className="size-4 text-gray-500 shrink-0" />
              Upload from device
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleOpenPicker}
              className="flex items-center gap-3 rounded-lg border bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none px-4 py-3 text-sm font-medium text-gray-700 transition-colors"
            >
              <FolderOpen className="size-4 text-gray-500 shrink-0" />
              Select from Google Drive
            </button>

            {/* Make default toggle */}
            <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
              <span className="text-sm text-gray-700">Set as default on upload</span>
              <Switch checked={makeDefault} onCheckedChange={setMakeDefault} />
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full aspect-video rounded-lg border overflow-hidden bg-gray-100 flex items-center justify-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner />
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                </div>
              ) : displaySrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={displaySrc}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpeg"; }}
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="size-8 opacity-30" />
                  <p className="text-xs">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner grid */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">
          All banners
          {rows.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({rows.length})</span>}
        </p>

        {isLoading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Spinner className="size-4" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2 rounded-xl border border-dashed bg-white">
            <ImageIcon className="size-8 opacity-25" />
            No banner images yet. Upload one above.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <div key={r.bannerImageId} className="group relative rounded-xl border bg-white overflow-hidden">
                {/* Image */}
                <div className="relative w-full aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.imageUrl}
                    alt={`Banner ${r.bannerImageId}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpeg"; }}
                  />
                  {/* Default badge */}
                  {r.isDefault && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      <Star className="size-2.5 fill-white" />
                      Default
                    </div>
                  )}
                  {/* ID chip */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    #{r.bannerImageId}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {!r.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs gap-1.5"
                      onClick={() => void setAsDefault(r.bannerImageId)}
                    >
                      <Check className="size-3" />
                      Set default
                    </Button>
                  )}
                  {r.isDefault && (
                    <div className="flex-1 flex items-center gap-1.5 text-xs text-amber-600 font-medium px-1">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      Current default
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={() => void remove(r.bannerImageId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
