"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Send, Bot, User, Loader2, ChevronDown, ChevronRight, ChevronUp,
  RotateCcw, Wrench, CircleCheck, CircleX, FolderOpen,
  Sparkles, X, ListPlus,
} from "lucide-react";
import type { AgentEvent } from "@/app/api/agent/chat/route";
import type Anthropic from "@anthropic-ai/sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

type FolderImageStatus = "idle" | "queued" | "used";

type FolderImage = {
  file: File;
  previewUrl: string;
  status: FolderImageStatus;
};

type QueueStatus =
  | "pending"
  | "uploading"
  | "analyzing"
  | "creating"
  | "created"
  | "failed";

type QueuedProduct = {
  id: string;
  imageNames: string[];
  imagePreviews: string[];
  price: string;
  stock: string;
  status: QueueStatus;
  title?: string;
  error?: string;
};

type ToolCallItem = {
  kind: "tool_call";
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
  done: boolean;
};

type TextItem = { kind: "text"; text: string };
type MessageItem = TextItem | ToolCallItem;
type Message = {
  role: "user" | "assistant";
  items: MessageItem[];
  streaming?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toolLabel(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncateJson(value: unknown, maxLen = 200) {
  const str =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

async function resizeImageToBase64(
  file: File,
  maxSize = 1024
): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const mimeType =
        file.type === "image/png" ? "image/png" : "image/jpeg";
      resolve({ data: canvas.toDataURL(mimeType, 0.85).split(",")[1], mimeType });
    };
    img.onerror = reject;
    img.src = url;
  });
}

type FlatCategory = { categoryId: number; name: string };

function flattenCategoryTree(
  tree: { categoryId: number; name: string; subcategories?: unknown[] }[]
): FlatCategory[] {
  const result: FlatCategory[] = [];
  function walk(
    nodes: { categoryId: number; name: string; subcategories?: unknown[] }[]
  ) {
    nodes.forEach((n) => {
      result.push({ categoryId: n.categoryId, name: n.name });
      if (n.subcategories?.length)
        walk(
          n.subcategories as {
            categoryId: number;
            name: string;
            subcategories?: unknown[];
          }[]
        );
    });
  }
  walk(tree);
  return result;
}

function resolveCategoryId(
  suggested: string,
  flat: FlatCategory[]
): number | null {
  if (!suggested) return null;
  const norm = suggested.toLowerCase().trim();
  return (
    flat.find((c) => c.name.toLowerCase() === norm)?.categoryId ??
    flat.find(
      (c) =>
        c.name.toLowerCase().includes(norm) ||
        norm.includes(c.name.toLowerCase())
    )?.categoryId ??
    null
  );
}

// ─── Queue status badge ───────────────────────────────────────────────────────

function QueueStatusBadge({ item }: { item: QueuedProduct }) {
  if (item.status === "pending")
    return (
      <Badge variant="outline" className="text-xs text-gray-500">
        Pending
      </Badge>
    );
  if (item.status === "uploading")
    return (
      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 gap-1">
        <Loader2 className="size-3 animate-spin" /> Uploading
      </Badge>
    );
  if (item.status === "analyzing")
    return (
      <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 gap-1">
        <Loader2 className="size-3 animate-spin" /> Analyzing
      </Badge>
    );
  if (item.status === "creating")
    return (
      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 gap-1">
        <Loader2 className="size-3 animate-spin" /> Creating
      </Badge>
    );
  if (item.status === "created")
    return (
      <Badge className="text-xs bg-green-600 gap-1">
        <CircleCheck className="size-3" /> Created
      </Badge>
    );
  return (
    <Badge variant="destructive" className="text-xs gap-1" title={item.error}>
      <CircleX className="size-3" /> Failed
    </Badge>
  );
}

// ─── Chat sub-components ──────────────────────────────────────────────────────

function ToolCallCard({ item }: { item: ToolCallItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-1 rounded-lg border border-gray-200 bg-white text-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        {item.done ? (
          item.isError ? (
            <CircleX className="size-4 shrink-0 text-red-500" />
          ) : (
            <CircleCheck className="size-4 shrink-0 text-green-600" />
          )
        ) : (
          <Loader2 className="size-4 shrink-0 animate-spin text-blue-500" />
        )}
        <Wrench className="size-3.5 shrink-0 text-gray-400" />
        <span className="font-medium text-gray-700">{toolLabel(item.name)}</span>
        {item.done && (
          <Badge
            variant="outline"
            className={`ml-auto text-xs ${
              item.isError
                ? "border-red-200 text-red-600"
                : "border-green-200 text-green-700"
            }`}
          >
            {item.isError ? "Error" : "Done"}
          </Badge>
        )}
        <span className="ml-auto shrink-0 text-gray-400">
          {open ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Input</p>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
              {truncateJson(item.input)}
            </pre>
          </div>
          {item.done && item.result !== undefined && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                {item.isError ? "Error" : "Result"}
              </p>
              <pre
                className={`text-xs whitespace-pre-wrap break-all ${
                  item.isError ? "text-red-600" : "text-gray-700"
                }`}
              >
                {truncateJson(item.result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <Bot className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5 pt-1">
        {message.items.map((item, i) =>
          item.kind === "text" ? (
            <div
              key={i}
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
            >
              {item.text}
              {message.streaming && i === message.items.length - 1 && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-500" />
              )}
            </div>
          ) : (
            <ToolCallCard key={item.id} item={item} />
          )
        )}
        {message.streaming && message.items.length === 0 && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Loader2 className="size-3.5 animate-spin" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  const text = message.items.find((i) => i.kind === "text") as
    | TextItem
    | undefined;
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-white text-sm leading-relaxed whitespace-pre-wrap">
        {text?.text}
      </div>
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <User className="size-4 text-gray-600" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentPage() {
  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Folder state ────────────────────────────────────────────────────────────
  const [folderImages, setFolderImages] = useState<Map<string, FolderImage>>(new Map());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [folderPanelOpen, setFolderPanelOpen] = useState(true);
  const [processingImages, setProcessingImages] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  // ── Queue state ─────────────────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueuedProduct[]>([]);
  const [priceInput, setPriceInput] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [priceError, setPriceError] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [creatingAll, setCreatingAll] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(true);
  const [selectedQueueIds, setSelectedQueueIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Toast helper ────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), 8000);
  }
  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast("");
  }

  // ── Folder handlers ─────────────────────────────────────────────────────────

  function handleFolderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const newMap = new Map<string, FolderImage>();
    const newUrls: string[] = [];
    files.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      newUrls.push(previewUrl);
      newMap.set(file.name, { file, previewUrl, status: "idle" });
    });
    previewUrlsRef.current = newUrls;
    setFolderImages(newMap);
    setSelectedImages(new Set());
    setQueue([]);
    setFolderPanelOpen(true);
    e.target.value = "";
  }

  function toggleImage(name: string) {
    const img = folderImages.get(name);
    if (!img || img.status !== "idle") return;
    setSelectedImages((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  // ── Queue handlers ──────────────────────────────────────────────────────────

  function handleAddToQueue() {
    const selected = Array.from(selectedImages).filter(
      (name) => folderImages.get(name)?.status === "idle"
    );
    if (!selected.length) return;

    const price = parseFloat(priceInput);
    const stock = parseInt(stockInput);
    const pErr = !priceInput || isNaN(price) || price <= 0;
    const sErr = !stockInput || isNaN(stock) || stock < 0;
    setPriceError(pErr);
    setStockError(sErr);
    if (pErr) { showToast("Enter a valid price before adding to queue."); return; }
    if (sErr) { showToast("Enter a valid stock quantity before adding to queue."); return; }

    const previews = selected.map((name) => folderImages.get(name)!.previewUrl);

    setQueue((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        imageNames: selected,
        imagePreviews: previews,
        price: priceInput,
        stock: stockInput,
        status: "pending",
      },
    ]);

    // Reserve images as queued
    setFolderImages((prev) => {
      const next = new Map(prev);
      selected.forEach((name) => {
        const img = next.get(name);
        if (img) next.set(name, { ...img, status: "queued" });
      });
      return next;
    });

    setSelectedImages(new Set());
    setPriceInput("");
    setStockInput("");
    setPriceError(false);
    setStockError(false);
  }

  function removeFromQueue(id: string) {
    const item = queue.find((p) => p.id === id);
    if (!item || item.status !== "pending") return;
    // Restore images to idle
    setFolderImages((prev) => {
      const next = new Map(prev);
      item.imageNames.forEach((name) => {
        const img = next.get(name);
        if (img && img.status === "queued")
          next.set(name, { ...img, status: "idle" });
      });
      return next;
    });
    setQueue((prev) => prev.filter((p) => p.id !== id));
  }

  function removeFromQueueBulk(ids: string[]) {
    const idSet = new Set(ids);
    setFolderImages((prev) => {
      const next = new Map(prev);
      queue.forEach((item) => {
        if (idSet.has(item.id) && (item.status === "pending" || item.status === "failed")) {
          item.imageNames.forEach((name) => {
            const img = next.get(name);
            if (img && img.status !== "used") next.set(name, { ...img, status: "idle" });
          });
        }
      });
      return next;
    });
    setQueue((prev) => prev.filter((p) => !idSet.has(p.id)));
    setSelectedQueueIds((prev) => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
  }

  function updateQueueItem(id: string, updates: Partial<QueuedProduct>) {
    setQueue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  async function handleCreateAll() {
    const pending = queue.filter((p) => p.status === "pending");
    if (!pending.length) return;
    setCreatingAll(true);

    try {
      // Fetch categories and shipping methods once for all products
      const [catRes, shipRes] = await Promise.all([
        fetch("/api/forward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/categories", method: "GET" }),
        }),
        fetch("/api/forward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/shipping-methods", method: "GET" }),
        }),
      ]);

      if (!catRes.ok || !shipRes.ok) {
        showToast("Failed to load reference data from the backend.");
        return;
      }

      const categoryTree = await catRes.json();
      const shippingMethods = await shipRes.json();
      const flatCategories = flattenCategoryTree(categoryTree);
      // Use the first available shipping method as default
      const defaultShippingId =
        shippingMethods[0]?.shippingMethodId ?? null;

      // Process all pending products in parallel
      await Promise.all(
        pending.map(async (item) => {
          updateQueueItem(item.id, { status: "uploading" });

          try {
            // Upload all images to Cloudinary + resize for Haiku in parallel
            const [cloudinaryUrls, resized] = await Promise.all([
              Promise.all(
                item.imageNames.map(async (name) => {
                  const img = folderImages.get(name)!;
                  const form = new FormData();
                  form.append("file", img.file);
                  const r = await fetch("/api/upload", {
                    method: "POST",
                    body: form,
                  });
                  const j = await r.json();
                  if (j.error) throw new Error(j.error);
                  return j.url as string;
                })
              ),
              Promise.all(
                item.imageNames
                  .slice(0, 5)
                  .map((name) =>
                    resizeImageToBase64(folderImages.get(name)!.file)
                  )
              ),
            ]);

            updateQueueItem(item.id, { status: "analyzing" });

            // Analyze with Claude Haiku
            const ar = await fetch("/api/agent/analyze-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ images: resized }),
            });
            const analysis = await ar.json();
            if (analysis.error) throw new Error(analysis.error);

            // Resolve category from suggested name
            const categoryId = resolveCategoryId(
              analysis.suggestedCategory ?? "",
              flatCategories
            );
            if (!categoryId)
              throw new Error(
                `Could not match category "${analysis.suggestedCategory}" — edit the product after creation.`
              );

            updateQueueItem(item.id, {
              status: "creating",
              title: analysis.title,
            });

            // Create the product via backend
            const cr = await fetch("/api/forward", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: "/products",
                method: "POST",
                body: {
                  title: analysis.title,
                  description: analysis.description ?? "",
                  categoryId,
                  shippingMethodId: defaultShippingId,
                  starred: false,
                  status: true,
                  images: cloudinaryUrls.map((url, i) => ({
                    imageUrl: url,
                    isDefault: i === 0,
                  })),
                  variants: [
                    {
                      price: parseFloat(item.price),
                      quantityInStock: parseInt(item.stock),
                      disabled: false,
                      variationOptionIds: [],
                    },
                  ],
                },
              }),
            });

            if (!cr.ok) {
              const err = await cr.json().catch(() => ({}));
              throw new Error(
                err.message ?? err.error ?? `Server error ${cr.status}`
              );
            }

            updateQueueItem(item.id, { status: "created" });

            // Mark folder images as used
            setFolderImages((prev) => {
              const next = new Map(prev);
              item.imageNames.forEach((name) => {
                const img = next.get(name);
                if (img) next.set(name, { ...img, status: "used" });
              });
              return next;
            });
          } catch (e) {
            updateQueueItem(item.id, {
              status: "failed",
              error: e instanceof Error ? e.message : "Unknown error",
            });
          }
        })
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to fetch reference data.");
    } finally {
      setCreatingAll(false);
    }
  }

  async function retryItems(ids: string[]) {
    const idSet = new Set(ids);
    const toRetry = queue.filter((p) => idSet.has(p.id) && p.status === "failed");
    if (!toRetry.length) return;
    // Reset to pending first
    setQueue((prev) => prev.map((p) => idSet.has(p.id) && p.status === "failed" ? { ...p, status: "pending", error: undefined } : p));
    setCreatingAll(true);
    try {
      const [catRes, shipRes] = await Promise.all([
        fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/categories", method: "GET" }) }),
        fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/shipping-methods", method: "GET" }) }),
      ]);
      if (!catRes.ok || !shipRes.ok) { showToast("Failed to load reference data."); return; }
      const categoryTree = await catRes.json();
      const shippingMethods = await shipRes.json();
      const flatCategories = flattenCategoryTree(categoryTree);
      const defaultShippingId = shippingMethods[0]?.shippingMethodId ?? null;
      await Promise.all(toRetry.map(async (item) => {
        updateQueueItem(item.id, { status: "uploading" });
        try {
          const [cloudinaryUrls, resized] = await Promise.all([
            Promise.all(item.imageNames.map(async (name) => {
              const img = folderImages.get(name)!;
              const form = new FormData(); form.append("file", img.file);
              const r = await fetch("/api/upload", { method: "POST", body: form });
              const j = await r.json(); if (j.error) throw new Error(j.error); return j.url as string;
            })),
            Promise.all(item.imageNames.slice(0, 5).map((name) => resizeImageToBase64(folderImages.get(name)!.file))),
          ]);
          updateQueueItem(item.id, { status: "analyzing" });
          const ar = await fetch("/api/agent/analyze-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: resized }) });
          const analysis = await ar.json(); if (analysis.error) throw new Error(analysis.error);
          const categoryId = resolveCategoryId(analysis.suggestedCategory ?? "", flatCategories);
          if (!categoryId) throw new Error(`Could not match category "${analysis.suggestedCategory}"`);
          updateQueueItem(item.id, { status: "creating", title: analysis.title });
          const cr = await fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/products", method: "POST", body: { title: analysis.title, description: analysis.description ?? "", categoryId, shippingMethodId: defaultShippingId, starred: false, status: true, images: cloudinaryUrls.map((url, i) => ({ imageUrl: url, isDefault: i === 0 })), variants: [{ price: parseFloat(item.price), quantityInStock: parseInt(item.stock), disabled: false, variationOptionIds: [] }] } }) });
          if (!cr.ok) { const err = await cr.json().catch(() => ({})); throw new Error(err.message ?? err.error ?? `Server error ${cr.status}`); }
          updateQueueItem(item.id, { status: "created" });
          setFolderImages((prev) => { const next = new Map(prev); item.imageNames.forEach((name) => { const img = next.get(name); if (img) next.set(name, { ...img, status: "used" }); }); return next; });
        } catch (e) {
          updateQueueItem(item.id, { status: "failed", error: e instanceof Error ? e.message : "Unknown error" });
        }
      }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to fetch reference data.");
    } finally {
      setCreatingAll(false);
    }
  }

  // ── Single product via agent ─────────────────────────────────────────────────

  async function handleConfirmAndAnalyze() {
    const selected = Array.from(selectedImages).filter(
      (name) => folderImages.get(name)?.status === "idle"
    );
    if (!selected.length) return;
    setProcessingImages(true);

    try {
      const [cloudinaryUrls, resized] = await Promise.all([
        Promise.all(
          selected.map(async (name) => {
            const img = folderImages.get(name)!;
            const form = new FormData();
            form.append("file", img.file);
            const r = await fetch("/api/upload", { method: "POST", body: form });
            const j = await r.json();
            if (j.error) throw new Error(j.error);
            return j.url as string;
          })
        ),
        Promise.all(
          selected
            .slice(0, 5)
            .map((name) => resizeImageToBase64(folderImages.get(name)!.file))
        ),
      ]);

      const ar = await fetch("/api/agent/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: resized }),
      });
      const analysis = await ar.json();
      if (analysis.error) throw new Error(analysis.error);

      setFolderImages((prev) => {
        const next = new Map(prev);
        selected.forEach((name) => {
          const img = next.get(name);
          if (img) next.set(name, { ...img, status: "used" });
        });
        return next;
      });
      setSelectedImages(new Set());

      const urlLines = cloudinaryUrls
        .map((url, i) => `  ${i + 1}. ${url}${i === 0 ? " (primary)" : ""}`)
        .join("\n");
      const analysisLines = [
        analysis.title && `  Title:              ${analysis.title}`,
        analysis.description && `  Description:        ${analysis.description}`,
        analysis.suggestedCategory && `  Suggested Category: ${analysis.suggestedCategory}`,
        Array.isArray(analysis.colors) && analysis.colors.length && `  Colors:             ${analysis.colors.join(", ")}`,
        analysis.material && `  Material:           ${analysis.material}`,
        analysis.style && `  Style:              ${analysis.style}`,
        analysis.additionalDetails && `  Additional Details: ${analysis.additionalDetails}`,
      ].filter(Boolean).join("\n");

      const autoPrompt =
        `I've selected ${selected.length} image${selected.length !== 1 ? "s" : ""} for a new product. ` +
        `Uploaded to Cloudinary:\n${urlLines}\n\n` +
        `AI extracted:\n${analysisLines}\n\n` +
        `Please resolve the category, shipping method, and variations, present a summary, ` +
        `then ask me for price and variant details before creating the product.`;

      await triggerSend(autoPrompt);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to process images.");
    } finally {
      setProcessingImages(false);
    }
  }

  // ── Chat ────────────────────────────────────────────────────────────────────

  function buildApiMessages(): Anthropic.MessageParam[] {
    return messages.map((m) => {
      const textItem = m.items.find((i) => i.kind === "text") as
        | TextItem
        | undefined;
      return {
        role: m.role as "user" | "assistant",
        content: textItem?.text ?? "",
      };
    });
  }

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const userText = (overrideText ?? input).trim();
      if (!userText || loading) return;
      if (!overrideText) setInput("");
      setLoading(true);

      setMessages((prev) => [
        ...prev,
        { role: "user", items: [{ kind: "text", text: userText }] },
        { role: "assistant", items: [], streaming: true },
      ]);

      try {
        const apiMessages: Anthropic.MessageParam[] = [
          ...buildApiMessages(),
          { role: "user", content: userText },
        ];

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });
        if (!res.ok || !res.body)
          throw new Error(`Request failed: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            let event: AgentEvent;
            try { event = JSON.parse(raw); } catch { continue; }

            setMessages((prev) => {
              const copy = [...prev];
              const last = { ...copy[copy.length - 1], items: [...copy[copy.length - 1].items] };

              if (event.type === "text_delta") {
                const lastItem = last.items[last.items.length - 1];
                if (lastItem?.kind === "text") {
                  last.items[last.items.length - 1] = { ...lastItem, text: lastItem.text + event.delta };
                } else {
                  last.items.push({ kind: "text", text: event.delta });
                }
              } else if (event.type === "tool_start") {
                last.items.push({ kind: "tool_call", id: event.id, name: event.name, input: event.input, done: false });
              } else if (event.type === "tool_done") {
                const idx = last.items.findIndex((i) => i.kind === "tool_call" && i.id === event.id);
                if (idx !== -1)
                  last.items[idx] = { ...(last.items[idx] as ToolCallItem), result: event.result, isError: event.isError, done: true };
              } else if (event.type === "done") {
                last.streaming = false;
              } else if (event.type === "error") {
                last.items.push({ kind: "text", text: `\n⚠️ Error: ${event.message}` });
                last.streaming = false;
              }

              copy[copy.length - 1] = last;
              return copy;
            });
          }
        }
      } catch (e) {
        setMessages((prev) => {
          const copy = [...prev];
          const last = { ...copy[copy.length - 1] };
          last.items = [{ kind: "text", text: `⚠️ ${e instanceof Error ? e.message : "Something went wrong"}` }];
          last.streaming = false;
          copy[copy.length - 1] = last;
          return copy;
        });
      } finally {
        setLoading(false);
        textareaRef.current?.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, loading, messages]
  );

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);
  async function triggerSend(text: string) { await sendMessageRef.current(text); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isEmpty = messages.length === 0;
  const idleCount = Array.from(folderImages.values()).filter((i) => i.status === "idle").length;
  const pendingQueueCount = queue.filter((p) => p.status === "pending").length;
  const hasSelection = selectedImages.size > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col overflow-hidden absolute inset-0">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-lg">
          {toast}
          <button onClick={dismissToast} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFolderChange}
      />

      {/* ── Image folder panel ── */}
      {folderImages.size > 0 && (
        <div
          className={`border-b bg-gray-50 shrink-0 flex items-center px-6 py-2 gap-2 ${!folderPanelOpen ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
          onClick={!folderPanelOpen ? () => setFolderPanelOpen(true) : undefined}
        >
          <FolderOpen className="size-3.5 text-indigo-500 shrink-0" />
          <span className="text-sm font-medium text-gray-600">
            Images —{" "}
            <span className="text-indigo-600">{idleCount} available</span>
            {folderImages.size - idleCount > 0 && (
              <span className="text-gray-400">
                {" "}· {Array.from(folderImages.values()).filter(i => i.status === "queued").length} queued
                {" "}· {Array.from(folderImages.values()).filter(i => i.status === "used").length} done
              </span>
            )}
          </span>
          {hasSelection && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {selectedImages.size} selected
            </span>
          )}
          {/* Right-side controls — always in the same spot */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setFolderPanelOpen((p) => !p); }}
              title={folderPanelOpen ? "Collapse" : "Expand"}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {folderPanelOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFolderImages(new Map());
                setSelectedImages(new Set());
                setFolderPanelOpen(false);
              }}
              title="Close folder"
              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {folderPanelOpen && (
            <div className="px-6 pb-3 space-y-3">
              {/* Thumbnails */}
              <div className="max-h-36 overflow-y-auto">
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 py-1">
                  {Array.from(folderImages.entries()).map(([name, img]) => {
                    const isSelected = selectedImages.has(name);
                    return (
                      <button
                        key={name}
                        title={name}
                        onClick={() => toggleImage(name)}
                        disabled={img.status !== "idle"}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all
                          ${img.status !== "idle"
                            ? "opacity-50 cursor-not-allowed border-transparent"
                            : isSelected
                            ? "border-indigo-500"
                            : "border-transparent hover:border-indigo-300"
                          }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.previewUrl} alt={name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                            <CircleCheck className="size-4 text-white drop-shadow" />
                          </div>
                        )}
                        {img.status === "queued" && (
                          <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center">
                            <ListPlus className="size-3.5 text-yellow-700 drop-shadow" />
                          </div>
                        )}
                        {img.status === "used" && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <CircleCheck className="size-4 text-green-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions row — shown when images are selected */}
              {hasSelection && (
                <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {selectedImages.size} image{selectedImages.size !== 1 ? "s" : ""} selected
                    </p>
                    <button
                      onClick={() => setSelectedImages(new Set())}
                      title="Clear selection"
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  {/* Bulk queue row */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Price ($)"
                      value={priceInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPriceInput(v);
                        setPriceError(v.length > 0 && (isNaN(parseFloat(v)) || parseFloat(v) <= 0));
                      }}
                      className={`h-8 w-28 text-sm ${priceError ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Stock"
                      value={stockInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setStockInput(v);
                        setStockError(v.length > 0 && (isNaN(parseInt(v)) || parseInt(v) < 0));
                      }}
                      className={`h-8 w-24 text-sm ${stockError ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddToQueue}
                      className="gap-1.5 h-8"
                    >
                      <ListPlus className="size-3.5" />
                      Add to Queue
                    </Button>
                    <span className="text-gray-300 text-sm">or</span>
                    <Button
                      size="sm"
                      onClick={handleConfirmAndAnalyze}
                      disabled={processingImages || loading}
                      className="gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {processingImages ? (
                        <><Loader2 className="size-3.5 animate-spin" /> Analyzing…</>
                      ) : (
                        <><Sparkles className="size-3.5" /> Create via Agent</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    <strong>Add to Queue</strong> — enter price &amp; stock now, bulk-create later ·{" "}
                    <strong>Create via Agent</strong> — agent asks for details interactively
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Queue panel ── */}
      {queue.length > 0 && (() => {
        const selectableIds = queue.filter(p => p.status === "pending" || p.status === "failed").map(p => p.id);
        const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedQueueIds.has(id));
        const selectedPending = Array.from(selectedQueueIds).filter(id => queue.find(p => p.id === id)?.status === "pending");
        const selectedFailed = Array.from(selectedQueueIds).filter(id => queue.find(p => p.id === id)?.status === "failed");
        const hasQueueSelection = selectedQueueIds.size > 0;
        return (
          <div className="border-b bg-white shrink-0">
            {/* Header row */}
            <div className="flex items-center gap-2 px-6 py-2 text-sm text-gray-600">
              <ListPlus className="size-3.5 text-orange-500 shrink-0" />
              <span className="font-medium">Queue — {queue.length} product{queue.length !== 1 ? "s" : ""}</span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">{pendingQueueCount} pending</span>
              <div className="ml-auto flex items-center gap-2">
                {pendingQueueCount > 0 && !hasQueueSelection && (
                  <Button size="sm" onClick={handleCreateAll} disabled={creatingAll || loading} className="h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs">
                    {creatingAll ? <><Loader2 className="size-3 animate-spin" /> Creating…</> : <>Create All ({pendingQueueCount})</>}
                  </Button>
                )}
                <button onClick={() => setQueuePanelOpen((p) => !p)} title={queuePanelOpen ? "Collapse" : "Expand"} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  {queuePanelOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              </div>
            </div>

            {queuePanelOpen && (
              <div className="px-6 pb-3 space-y-2">
                {/* Bulk actions toolbar */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {
                      if (allSelected) setSelectedQueueIds(new Set());
                      else setSelectedQueueIds(new Set(selectableIds));
                    }}
                    className="rounded border-gray-300 text-indigo-600 cursor-pointer"
                    title="Select all"
                  />
                  <span className="text-xs text-gray-400">{hasQueueSelection ? `${selectedQueueIds.size} selected` : "Select all"}</span>
                  {hasQueueSelection && (
                    <div className="flex items-center gap-1.5 ml-1">
                      {selectedPending.length > 0 && (
                        <Button size="sm" onClick={() => { const ids = selectedPending; setSelectedQueueIds(new Set()); retryItems(ids); }} disabled={creatingAll} className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white gap-1">
                          Create ({selectedPending.length})
                        </Button>
                      )}
                      {selectedFailed.length > 0 && (
                        <Button size="sm" onClick={() => { const ids = selectedFailed; setSelectedQueueIds(new Set()); retryItems(ids); }} disabled={creatingAll} className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white gap-1">
                          Retry ({selectedFailed.length})
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => removeFromQueueBulk(Array.from(selectedQueueIds))} className="h-6 px-2 text-xs text-red-500 border-red-200 hover:bg-red-50">
                        Remove ({selectedQueueIds.size})
                      </Button>
                    </div>
                  )}
                  {!hasQueueSelection && queue.length > 0 && (
                    <button onClick={() => removeFromQueueBulk(queue.filter(p => p.status === "pending" || p.status === "failed").map(p => p.id))} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Queue items */}
                <div className="max-h-52 overflow-y-auto space-y-1.5">
                  {queue.map((item, idx) => {
                    const isSelectable = item.status === "pending" || item.status === "failed";
                    const isSelected = selectedQueueIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!isSelectable) return;
                          setSelectedQueueIds((prev) => {
                            const next = new Set(prev);
                            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                            return next;
                          });
                        }}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${isSelectable ? "cursor-pointer" : ""} ${isSelected ? "border-indigo-200 bg-indigo-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}
                      >
                        {/* Checkbox — click handled by row, stopPropagation to avoid double-fire */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isSelectable}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-indigo-600 cursor-pointer disabled:opacity-30 shrink-0"
                        />

                        {/* Thumbnails */}
                        <div className="flex gap-1 shrink-0">
                          {item.imagePreviews.slice(0, 3).map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt="" className="h-9 w-9 rounded object-cover border border-gray-200" />
                          ))}
                          {item.imagePreviews.length > 3 && (
                            <div className="h-9 w-9 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">+{item.imagePreviews.length - 3}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.title ?? `Product ${idx + 1}`}</p>
                          <p className="text-xs text-gray-400">${item.price} · Stock {item.stock} · {item.imageNames.length} image{item.imageNames.length !== 1 ? "s" : ""}</p>
                          {item.error && <p className="text-xs text-red-500 truncate" title={item.error}>{item.error}</p>}
                        </div>

                        <QueueStatusBadge item={item} />

                        {/* Per-item actions */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {item.status === "failed" && (
                            <button onClick={() => retryItems([item.id])} disabled={creatingAll} title="Retry" className="p-1 rounded text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-40">
                              <RotateCcw className="size-3.5" />
                            </button>
                          )}
                          {(item.status === "pending" || item.status === "failed") && (
                            <button onClick={() => removeFromQueue(item.id)} title="Remove" className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Bot className="size-8" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-1">
                AI Admin Assistant · Powered by Claude
              </p>
              <h2 className="text-xl font-semibold text-gray-900">How can I help you?</h2>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                Manage products, categories, orders and more — or load a folder
                of product images to create listings with AI.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {[
                "Show me products with low stock",
                "Create a new category called Summer Collection",
                "List all pending orders",
                "Add a new Color variation with Red, Blue, and Green options",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <React.Fragment key={i}>
              {msg.role === "user" ? (
                <UserMessage message={msg} />
              ) : (
                <AssistantMessage message={msg} />
              )}
              {i < messages.length - 1 && <Separator className="opacity-40" />}
            </React.Fragment>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t bg-white px-6 pt-3 pb-1 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 focus-within:border-indigo-400 focus-within:bg-white transition-colors shadow-sm">

          {/* Folder picker button — inside the input bar */}
          <button
            onClick={() => folderInputRef.current?.click()}
            title={folderImages.size > 0 ? `${folderImages.size} images loaded — click to change folder` : "Load image folder"}
            className="relative shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <FolderOpen className="size-5" />
            {folderImages.size > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                {folderImages.size > 9 ? "9+" : folderImages.size}
              </span>
            )}
          </button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about the store… (Enter to send, Shift+Enter for new line)"
            className="min-h-[44px] max-h-40 flex-1 resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            rows={1}
            disabled={loading}
          />

          {/* New chat — only shown when there are messages */}
          {!isEmpty && (
            <button
              onClick={() => setMessages([])}
              title="New chat"
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="size-4" />
            </button>
          )}

          {/* Send */}
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="size-9 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-xs text-gray-400">
          The assistant can create, edit, and delete data. Always review before confirming destructive actions.
        </p>
      </div>
    </div>
  );
}
