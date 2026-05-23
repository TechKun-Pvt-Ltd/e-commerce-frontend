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
  Sparkles, X, ListPlus, Plus,
} from "lucide-react";
import type { AgentEvent } from "@/app/api/agent/chat/route";

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
  | "analyzed"
  | "creating"
  | "created"
  | "failed";

type ProductAnalysis = {
  title: string;
  description: string;
  suggestedCategory: string;
  colors: string[];
  material: string | null;
  style: string | null;
  additionalDetails: string | null;
};

type QueuedVariant = {
  localId: string;
  optionIds: Record<number, number>; // variationId -> variationOptionId
  price: string;
  stock: string;
};

type QueuedAttribute = {
  localId: string;
  attributeId: number | null;
  value: string;
};

type QueuedProduct = {
  id: string;
  imageNames: string[];
  imagePreviews: string[];
  status: QueueStatus;
  title?: string;
  error?: string;
  // Set after analysis
  cloudinaryUrls?: string[];
  analysis?: ProductAnalysis;
  // Set by user during review
  categoryId?: number | null;
  shippingMethodId?: number | null;
  variants: QueuedVariant[];
  productAttributes: QueuedAttribute[];
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

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
  if (item.status === "analyzed") {
    const ready = !!item.categoryId && item.variants.length > 0;
    return (
      <Badge variant="outline" className={`text-xs gap-1 ${ready ? "text-green-700 border-green-200" : "text-yellow-600 border-yellow-300"}`}>
        {ready ? <CircleCheck className="size-3" /> : <CircleX className="size-3" />}
        {!item.categoryId ? "Needs Category" : !item.variants.length ? "Add Variants" : "Ready"}
      </Badge>
    );
  }
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
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
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
  const [creatingAll, setCreatingAll] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(true);
  const [selectedQueueIds, setSelectedQueueIds] = useState<Set<string>>(new Set());

  // ── Review state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"chat" | "images" | "review">("chat");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [shippingMethods, setShippingMethods] = useState<{ shippingMethodId: number; name: string }[]>([]);
  const [creatingConfigured, setCreatingConfigured] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [variations, setVariations] = useState<{ variationId: number; name: string; variationOptions: { variationOptionId: number; name: string; code: string }[] }[]>([]);
  const [attributes, setAttributes] = useState<{ attributeId: number; name: string; type: "ENUMERATED" | "CUSTOM"; allowedValues: string[] }[]>([]);
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  // Tracks which (variantLocalId-variationId) rows are expanded when unselected
  const [expandedVariationKeys, setExpandedVariationKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Auto-select first analyzed item and switch to review tab
  useEffect(() => {
    const analyzed = queue.filter(p => p.status === "analyzed");
    if (!analyzed.length) { setSelectedReviewId(null); return; }
    if (!selectedReviewId || !analyzed.find(p => p.id === selectedReviewId))
      setSelectedReviewId(analyzed[0].id);
    setActiveTab("review");
  }, [queue, selectedReviewId]);

  // Load categories, shipping methods, and variations when review panel becomes needed
  useEffect(() => {
    if (!queue.some(p => p.status === "analyzed")) return;
    if (categories.length > 0 && shippingMethods.length > 0) return;
    Promise.all([
      fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/categories", method: "GET" }) }),
      fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/shipping-methods", method: "GET" }) }),
      fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/variations", method: "GET" }) }),
      fetch("/api/forward", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/attributes", method: "GET" }) }),
    ]).then(([c, s, v, a]) => Promise.all([c.json(), s.json(), v.json(), a.json()]))
      .then(([tree, ships, vars, attrs]) => {
        setCategories(flattenCategoryTree(tree));
        setShippingMethods(ships);
        setVariations(Array.isArray(vars) ? vars : []);
        setAttributes(Array.isArray(attrs) ? attrs : []);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Toast helper ────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" = "error") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 8000);
  }
  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
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
    setActiveTab("images");
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

    const previews = selected.map((name) => folderImages.get(name)!.previewUrl);

    setQueue((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        imageNames: selected,
        imagePreviews: previews,
        status: "pending",
        variants: [],
        productAttributes: [],
      },
    ]);

    setFolderImages((prev) => {
      const next = new Map(prev);
      selected.forEach((name) => {
        const img = next.get(name);
        if (img) next.set(name, { ...img, status: "queued" });
      });
      return next;
    });

    setSelectedImages(new Set());
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

            // Auto-resolve category (may be null — user will fix in review)
            const resolvedCategoryId = resolveCategoryId(
              analysis.suggestedCategory ?? "",
              flatCategories
            );

            updateQueueItem(item.id, {
              status: "analyzed",
              title: analysis.title,
              cloudinaryUrls,
              analysis,
              categoryId: resolvedCategoryId,
              shippingMethodId: defaultShippingId,
              variants: [],
              productAttributes: [],
            });

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
          const resolvedCategoryId = resolveCategoryId(analysis.suggestedCategory ?? "", flatCategories);
          updateQueueItem(item.id, { status: "analyzed", title: analysis.title, cloudinaryUrls, analysis, categoryId: resolvedCategoryId, shippingMethodId: defaultShippingId, variants: [], productAttributes: [] });
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

  // ── Create configured products ───────────────────────────────────────────────

  function isItemReady(item: QueuedProduct): boolean {
    if (item.status !== "analyzed") return false;
    if (!item.categoryId) return false;
    if (!item.shippingMethodId) return false;
    if (!item.analysis?.description?.trim()) return false;
    if (!item.variants?.length) return false;
    const variantsOk = item.variants.every(v => {
      const price = parseFloat(v.price);
      const stock = parseInt(v.stock);
      return Object.keys(v.optionIds).length > 0 && !isNaN(price) && price > 0 && !isNaN(stock) && stock >= 0;
    });
    if (!variantsOk) return false;
    return item.productAttributes.every(a => a.attributeId !== null && a.value.trim() !== "");
  }

  async function handleCreateConfigured() {
    const ready = queue.filter(p => isItemReady(p));
    if (!ready.length) return;
    setCreatingConfigured(true);
    let createdCount = 0;
    const failedTitles: string[] = [];
    await Promise.all(ready.map(async (item) => {
      updateQueueItem(item.id, { status: "creating" });
      try {
        const description =
          item.analysis!.description?.trim() ||
          item.analysis!.additionalDetails?.trim() ||
          item.analysis!.title;
        const cr = await fetch("/api/forward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "/products", method: "POST",
            body: {
              title: item.analysis!.title,
              description,
              categoryId: item.categoryId,
              shippingMethodId: item.shippingMethodId,
              starred: false, status: true,
              images: item.cloudinaryUrls!.map((url, i) => ({ imageUrl: url, isDefault: i === 0 })),
              variants: item.variants.map(v => ({
                price: parseFloat(v.price),
                quantityInStock: parseInt(v.stock),
                disabled: false,
                variationOptionIds: Object.values(v.optionIds),
              })),
              attributes: item.productAttributes
                .filter(a => a.attributeId !== null && a.value.trim())
                .map(a => ({ attributeId: a.attributeId, value: a.value.trim() })),
            },
          }),
        });
        if (!cr.ok) { const err = await cr.json().catch(() => ({})); throw new Error(err.message ?? err.error ?? `Server error ${cr.status}`); }
        updateQueueItem(item.id, { status: "created" });
        createdCount++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        updateQueueItem(item.id, { status: "failed", error: msg });
        failedTitles.push(item.analysis?.title ?? item.imageNames[0] ?? "Unknown");
      }
    }));
    setCreatingConfigured(false);
    if (failedTitles.length === 0) {
      showToast(`${createdCount} product${createdCount !== 1 ? "s" : ""} created successfully.`, "success");
    } else if (createdCount === 0) {
      showToast(`Failed to create ${failedTitles.length} product${failedTitles.length !== 1 ? "s" : ""}. Check the review tab for details.`, "error");
    } else {
      showToast(`${createdCount} created, ${failedTitles.length} failed. Check the review tab for details.`, "error");
    }
  }

  // ── Create new category inline ───────────────────────────────────────────────

  async function handleCreateCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setCreatingCat(true);
    try {
      const code = slugify(name);
      const cr = await fetch("/api/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/categories", method: "POST", body: { name, code } }),
      });
      const data = await cr.json();
      if (!cr.ok) throw new Error(data.message ?? data.error ?? `Error ${cr.status}`);

      // Refresh category list
      const catRes = await fetch("/api/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/categories", method: "GET" }),
      });
      const tree = await catRes.json();
      const flat = flattenCategoryTree(tree);
      setCategories(flat);

      // Auto-select the new category for the currently selected product
      const newCat = flat.find(c => c.name === name);
      if (newCat && selectedReviewId) {
        updateQueueItem(selectedReviewId, { categoryId: newCat.categoryId });
      }

      setShowNewCatForm(false);
      setNewCatName("");
      showToast(`Category "${name}" created and selected.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create category.");
    } finally {
      setCreatingCat(false);
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

  function buildApiMessages(): { role: "user" | "assistant"; content: string }[] {
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
        const apiMessages: { role: "user" | "assistant"; content: string }[] = [
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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg bg-white ${
          toast.type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-600"
        }`}>
          {toast.msg}
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

      {/* ── Image folder panel (moved to Images tab) ── */}
      {false && (
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

      {/* ── Queue panel (moved to Images tab) ── */}
      {false && (() => {
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

      {/* ── Tab bar ── */}
      {(() => {
        const analyzedCount = queue.filter(p => p.status === "analyzed").length;
        const imageCount = folderImages.size;
        const queueCount = queue.filter(p => p.status === "pending").length;
        return (
          <div className="flex border-b bg-white shrink-0 px-6">
            <button onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Bot className="size-3.5" /> Chat
            </button>
            <button onClick={() => { setActiveTab("images"); if (!folderImages.size) folderInputRef.current?.click(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "images" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <FolderOpen className="size-3.5" /> Images
              {imageCount > 0 && <span className="rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 leading-none">{imageCount}</span>}
              {queueCount > 0 && <span className="rounded-full bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">{queueCount} queued</span>}
            </button>
            <button onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "review" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Sparkles className="size-3.5" /> Review & Configure
              {analyzedCount > 0 && <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">{analyzedCount}</span>}
            </button>
          </div>
        );
      })()}

      {/* ── Images tab ── */}
      {activeTab === "images" && (
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left: image grid */}
          <div className="flex-1 min-w-0 flex flex-col border-r bg-gray-50">
            <div className="flex items-center gap-3 px-5 py-3 border-b bg-white shrink-0">
              <FolderOpen className="size-4 text-indigo-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-700">
                {folderImages.size > 0 ? `${folderImages.size} images loaded` : "No folder loaded"}
              </span>
              {folderImages.size > 0 && (
                <span className="text-xs text-gray-400">
                  {Array.from(folderImages.values()).filter(i => i.status === "idle").length} available ·{" "}
                  {Array.from(folderImages.values()).filter(i => i.status === "queued").length} queued ·{" "}
                  {Array.from(folderImages.values()).filter(i => i.status === "used").length} done
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {hasSelection && (
                  <button onClick={() => setSelectedImages(new Set())} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear selection</button>
                )}
                <Button size="sm" variant="outline" onClick={() => folderInputRef.current?.click()} className="h-7 text-xs gap-1.5">
                  <FolderOpen className="size-3" /> {folderImages.size > 0 ? "Change Folder" : "Load Folder"}
                </Button>
                {folderImages.size > 0 && (
                  <button onClick={() => { setFolderImages(new Map()); setSelectedImages(new Set()); setQueue([]); }} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Clear folder">
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {folderImages.size === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="size-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <FolderOpen className="size-8 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Load a product image folder</p>
                  <p className="text-sm text-gray-400 mt-1">Select a folder containing product photos. Each product can have multiple images.</p>
                </div>
                <Button onClick={() => folderInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  <FolderOpen className="size-4" /> Choose Folder
                </Button>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {Array.from(folderImages.entries()).map(([name, img]) => {
                    const isSelected = selectedImages.has(name);
                    return (
                      <button key={name} title={name} onClick={() => toggleImage(name)} disabled={img.status !== "idle"}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.status !== "idle" ? "opacity-50 cursor-not-allowed border-transparent" : isSelected ? "border-indigo-500 shadow-md" : "border-transparent hover:border-indigo-300"}`}>
                        {/* Skeleton shown until image decodes */}
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.previewUrl} alt={name}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200"
                          onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; }} />
                        {isSelected && <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center"><CircleCheck className="size-5 text-white drop-shadow" /></div>}
                        {img.status === "queued" && <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center"><ListPlus className="size-4 text-yellow-700 drop-shadow" /></div>}
                        {img.status === "used" && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><CircleCheck className="size-5 text-green-600" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selection action bar */}
            {hasSelection && (
              <div className="border-t bg-white px-5 py-3 shrink-0 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{selectedImages.size} image{selectedImages.size !== 1 ? "s" : ""} selected</span>
                <Button size="sm" variant="outline" onClick={handleAddToQueue} className="gap-1.5 h-8">
                  <ListPlus className="size-3.5" /> Add to Queue
                </Button>
                <span className="text-gray-300 text-sm">or</span>
                <Button size="sm" onClick={handleConfirmAndAnalyze} disabled={processingImages || loading} className="gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {processingImages ? <><Loader2 className="size-3.5 animate-spin" />Analyzing…</> : <><Sparkles className="size-3.5" />Create via Agent</>}
                </Button>
                <p className="ml-auto text-xs text-gray-400">Price &amp; stock are set per-variant in the Review tab.</p>
              </div>
            )}
          </div>

          {/* Right: queue */}
          <div className="w-96 shrink-0 flex flex-col bg-white">
            <div className="flex items-center gap-2 px-5 py-3 border-b shrink-0">
              <ListPlus className="size-4 text-orange-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-700">Queue</span>
              {queue.length > 0 && <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">{queue.filter(p => p.status === "pending").length} pending</Badge>}
              {queue.filter(p => p.status === "pending").length > 0 && (
                <Button size="sm" onClick={handleCreateAll} disabled={creatingAll} className="ml-auto h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs">
                  {creatingAll ? <><Loader2 className="size-3 animate-spin" />Analyzing…</> : <>Analyze All ({queue.filter(p => p.status === "pending").length})</>}
                </Button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <ListPlus className="size-8 mb-2 opacity-30" />
                <p className="text-sm">No items in queue yet.</p>
                <p className="text-xs mt-1">Select images and click "Add to Queue".</p>
              </div>
            ) : (
              <>
                {/* Bulk actions */}
                {(() => {
                  const selectableIds = queue.filter(p => p.status === "pending" || p.status === "failed").map(p => p.id);
                  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedQueueIds.has(id));
                  const selectedPending = Array.from(selectedQueueIds).filter(id => queue.find(p => p.id === id)?.status === "pending");
                  const selectedFailed = Array.from(selectedQueueIds).filter(id => queue.find(p => p.id === id)?.status === "failed");
                  const hasQueueSelection = selectedQueueIds.size > 0;
                  return (
                    <div className="flex items-center gap-2 px-5 py-2 border-b bg-gray-50 shrink-0">
                      <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelectedQueueIds(new Set()) : setSelectedQueueIds(new Set(selectableIds))} className="rounded border-gray-300 text-indigo-600 cursor-pointer" />
                      <span className="text-xs text-gray-400">{hasQueueSelection ? `${selectedQueueIds.size} selected` : "Select all"}</span>
                      {hasQueueSelection && (
                        <div className="flex items-center gap-1.5">
                          {selectedPending.length > 0 && <Button size="sm" onClick={() => { const ids = selectedPending; setSelectedQueueIds(new Set()); retryItems(ids); }} disabled={creatingAll} className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white">Analyze ({selectedPending.length})</Button>}
                          {selectedFailed.length > 0 && <Button size="sm" onClick={() => { const ids = selectedFailed; setSelectedQueueIds(new Set()); retryItems(ids); }} disabled={creatingAll} className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white">Retry ({selectedFailed.length})</Button>}
                          <Button size="sm" variant="outline" onClick={() => removeFromQueueBulk(Array.from(selectedQueueIds))} className="h-6 px-2 text-xs text-red-500 border-red-200 hover:bg-red-50">Remove</Button>
                        </div>
                      )}
                      {!hasQueueSelection && <button onClick={() => removeFromQueueBulk(queue.filter(p => p.status === "pending" || p.status === "failed").map(p => p.id))} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>}
                    </div>
                  );
                })()}

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {queue.map((item) => {
                    const isSelectable = item.status === "pending" || item.status === "failed";
                    const isSelected = selectedQueueIds.has(item.id);
                    return (
                      <div key={item.id} onClick={() => { if (!isSelectable) return; setSelectedQueueIds(prev => { const next = new Set(prev); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; }); }}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${isSelectable ? "cursor-pointer" : ""} ${isSelected ? "border-indigo-200 bg-indigo-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                        <input type="checkbox" checked={isSelected} disabled={!isSelectable} onChange={() => {}} onClick={e => e.stopPropagation()} className="rounded border-gray-300 text-indigo-600 cursor-pointer disabled:opacity-30 shrink-0" />
                        <div className="flex gap-1 shrink-0">
                          {item.imagePreviews.slice(0, 2).map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt="" className="size-10 rounded-lg object-cover border border-gray-200" />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{item.title ?? item.imageNames.join(", ")}</p>
                          <p className="text-[10px] text-gray-400">{item.imageNames.length} image{item.imageNames.length !== 1 ? "s" : ""}</p>
                          {item.error && <p className="text-[10px] text-red-500 truncate" title={item.error}>{item.error}</p>}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <QueueStatusBadge item={item} />
                          {item.status === "analyzed" && (
                            <button onClick={e => { e.stopPropagation(); setActiveTab("review"); setSelectedReviewId(item.id); }} className="text-[10px] text-indigo-600 hover:underline font-medium">Review →</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Review & Configure tab ── */}
      {activeTab === "review" && (() => {
        const analyzedItems = queue.filter(p => ["analyzed", "creating", "created", "failed"].includes(p.status));
        const readyCount = analyzedItems.filter(p => isItemReady(p)).length;
        const selectedItem = analyzedItems.find(p => p.id === selectedReviewId);
        const filteredCats = catSearch
          ? categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
          : categories;
        const autoMatchId = selectedItem?.analysis?.suggestedCategory
          ? resolveCategoryId(selectedItem.analysis.suggestedCategory, categories)
          : null;
        const autoMatchName = autoMatchId ? categories.find(c => c.categoryId === autoMatchId)?.name : null;

        if (!analyzedItems.length) return (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No analyzed products yet. Use the queue to analyze images first.
          </div>
        );

        return (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Left sidebar — product list */}
            <div className="w-56 shrink-0 border-r bg-gray-50 flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</span>
                <Badge variant="outline" className={`text-xs ${readyCount === analyzedItems.length ? "text-green-700 border-green-200" : "text-yellow-600 border-yellow-300"}`}>
                  {readyCount}/{analyzedItems.length} ready
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {analyzedItems.map(item => (
                  <button key={item.id} onClick={() => setSelectedReviewId(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition-colors border ${selectedReviewId === item.id ? "bg-white border-indigo-200 shadow-sm" : "border-transparent hover:bg-white hover:border-gray-200"}`}>
                    {item.imagePreviews[0]
                      ? <img src={item.imagePreviews[0]} className="size-10 rounded-lg object-cover shrink-0" alt="" />
                      : <div className="size-10 rounded-lg bg-gray-200 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800 leading-tight">{item.title ?? item.imageNames[0]}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${
                        item.status === "created" ? "text-green-600" :
                        item.status === "failed" ? "text-red-500" :
                        item.status === "creating" ? "text-indigo-500" :
                        isItemReady(item) ? "text-green-600" : "text-amber-500"
                      }`}>
                        {item.status === "created" ? "✓ Created" :
                         item.status === "failed" ? `✗ ${item.error ?? "Failed"}` :
                         item.status === "creating" ? "Creating…" :
                         !item.categoryId ? "⚠ Pick a category" :
                         !item.shippingMethodId ? "⚠ Pick shipping" :
                         !item.analysis?.description?.trim() ? "⚠ Add description" :
                         !item.variants.length ? "⚠ Add variants" :
                         isItemReady(item) ? "✓ Ready to create" : "⚠ Fix variant details"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {readyCount > 0 && (
                <div className="p-3 border-t">
                  <Button onClick={handleCreateConfigured} disabled={creatingConfigured} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white text-xs h-9">
                    {creatingConfigured ? <><Loader2 className="size-3.5 animate-spin" />Creating…</> : <>Create {readyCount} Product{readyCount !== 1 ? "s" : ""}</>}
                  </Button>
                </div>
              )}
            </div>

            {/* Right — configuration form */}
            {selectedItem ? (
              <div className="flex-1 min-w-0 overflow-y-auto p-6 pb-16 space-y-5">
                {/* Header with thumbnails */}
                <div className="flex items-start gap-4">
                  <div className="flex gap-2 shrink-0">
                    {selectedItem.imagePreviews.slice(0, 4).map((url, i) => (
                      <img key={i} src={url} className="size-16 rounded-xl object-cover border border-gray-200" alt="" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1 font-medium">{selectedItem.imageNames.length} image{selectedItem.imageNames.length !== 1 ? "s" : ""} · {selectedItem.variants.length} variant{selectedItem.variants.length !== 1 ? "s" : ""} configured</p>
                    {selectedItem.analysis?.colors?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedItem.analysis.colors.map(c => (
                          <span key={c} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{c}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      {selectedItem.analysis?.material && <span>Material: <span className="text-gray-700 font-medium">{selectedItem.analysis.material}</span></span>}
                      {selectedItem.analysis?.style && <span>Style: <span className="text-gray-700 font-medium">{selectedItem.analysis.style}</span></span>}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Title</label>
                  <Input value={selectedItem.analysis?.title ?? ""}
                    onChange={e => updateQueueItem(selectedItem.id, { analysis: { ...selectedItem.analysis!, title: e.target.value } })}
                    className="text-sm" />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Description
                    {!selectedItem.analysis?.description?.trim() && (
                      <span className="ml-2 text-[10px] font-medium text-red-500">Required</span>
                    )}
                  </label>
                  <textarea
                    value={selectedItem.analysis?.description ?? ""}
                    onChange={e => updateQueueItem(selectedItem.id, { analysis: { ...selectedItem.analysis!, description: e.target.value } })}
                    rows={4}
                    className={`w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      !selectedItem.analysis?.description?.trim() ? "border-red-300" : "border-input"
                    }`}
                  />
                </div>

                {/* Additional Details */}
                {selectedItem.analysis?.additionalDetails && (
                  <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Additional Details (from AI)</p>
                    <p className="text-sm text-gray-700">{selectedItem.analysis.additionalDetails}</p>
                  </div>
                )}

                <Separator />

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
                  {selectedItem.categoryId ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 flex items-center gap-1.5">
                        ✓ {categories.find(c => c.categoryId === selectedItem.categoryId)?.name}
                        {selectedItem.categoryId === autoMatchId && <Sparkles className="size-3 text-indigo-400" title="AI suggested" />}
                      </span>
                      <button onClick={() => updateQueueItem(selectedItem.id, { categoryId: null })} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Change</button>
                    </div>
                  ) : (
                    <>
                      {selectedItem.analysis?.suggestedCategory && !autoMatchId && (
                        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 w-full">
                          <Sparkles className="size-3.5 shrink-0 text-yellow-500" />
                          <span>AI suggested: <span className="font-semibold">{selectedItem.analysis.suggestedCategory}</span> — not in your catalog yet</span>
                        </div>
                      )}
                      {autoMatchId && autoMatchName && (
                        <button onClick={() => updateQueueItem(selectedItem.id, { categoryId: autoMatchId })}
                          className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-100 transition-colors w-full text-left">
                          <Sparkles className="size-3.5 shrink-0" />
                          <span>Use AI suggestion: <span className="font-semibold">{autoMatchName}</span></span>
                          <span className="ml-auto text-xs text-indigo-400">Click to select →</span>
                        </button>
                      )}
                      <Input placeholder="Search categories…" value={catSearch} onChange={e => setCatSearch(e.target.value)} className="text-sm" />
                      <div className="border rounded-xl overflow-hidden divide-y max-h-44 overflow-y-auto">
                        {filteredCats.length === 0
                          ? <p className="px-4 py-3 text-sm text-gray-400">No categories found</p>
                          : filteredCats.map(cat => (
                            <button key={cat.categoryId}
                              onClick={() => { updateQueueItem(selectedItem.id, { categoryId: cat.categoryId }); setCatSearch(""); }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 text-gray-700 transition-colors">
                              {cat.name}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Shipping */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Shipping Method</label>
                  <div className="flex flex-wrap gap-2">
                    {shippingMethods.map(sm => (
                      <button key={sm.shippingMethodId} onClick={() => updateQueueItem(selectedItem.id, { shippingMethodId: sm.shippingMethodId })}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${selectedItem.shippingMethodId === sm.shippingMethodId ? "bg-indigo-600 text-white border-indigo-600" : "text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"}`}>
                        {sm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Variants <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-400 mt-0.5">Each variant is a combination of options (e.g. 30×60 + Black Frame) with its own price &amp; stock.</p>
                  </div>

                  {selectedItem.variants.map((variant, vi) => {
                    const unselectedVariations = variations.filter(v => variant.optionIds[v.variationId] === undefined);
                    const allHaveOptions = variations.length === 0 || unselectedVariations.length === 0;
                    const validPrice = !!variant.price && !isNaN(parseFloat(variant.price)) && parseFloat(variant.price) > 0;
                    const validStock = variant.stock !== "" && !isNaN(parseInt(variant.stock)) && parseInt(variant.stock) >= 0;
                    const rowOk = allHaveOptions && validPrice && validStock;
                    return (
                      <div key={variant.localId} className={`rounded-xl border p-3 space-y-2.5 ${rowOk ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-gray-50"}`}>
                        {/* One row per variation type — collapsed when unselected, expanded when selected */}
                        {variations.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">No variations configured in the system yet.</span>
                        ) : (
                          <div className="space-y-1.5">
                            {variations.map(variation => {
                              const selectedOptId = variant.optionIds[variation.variationId];
                              const isSelected = selectedOptId !== undefined;
                              const expKey = `${variant.localId}-${variation.variationId}`;
                              // Selected variations are always expanded; unselected can be toggled
                              const isExpanded = isSelected || expandedVariationKeys.has(expKey);
                              const selectedOptName = isSelected
                                ? variation.variationOptions.find(o => o.variationOptionId === selectedOptId)?.name
                                : undefined;

                              return (
                                <div key={variation.variationId}>
                                  {/* Title row — click to expand when unselected */}
                                  <button
                                    type="button"
                                    disabled={isSelected}
                                    onClick={() => {
                                      setExpandedVariationKeys(prev => {
                                        const next = new Set(prev);
                                        if (next.has(expKey)) next.delete(expKey);
                                        else next.add(expKey);
                                        return next;
                                      });
                                    }}
                                    className={`flex items-center gap-1.5 w-full text-left ${isSelected ? "cursor-default" : "hover:opacity-80"}`}
                                  >
                                    <span className={`text-xs font-semibold truncate flex-1 ${isSelected ? "text-gray-700" : "text-amber-600"}`}>
                                      {variation.name}
                                      {isSelected && selectedOptName && (
                                        <span className="ml-1.5 font-normal text-indigo-600">— {selectedOptName}</span>
                                      )}
                                    </span>
                                    {!isSelected && (
                                      <ChevronDown className={`size-3 text-amber-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    )}
                                  </button>

                                  {/* Option pills — visible only when expanded */}
                                  {isExpanded && (
                                    <div className="flex flex-wrap gap-1.5 mt-1.5 pl-0">
                                      {variation.variationOptions.map(opt => {
                                        const isOptSelected = selectedOptId === opt.variationOptionId;
                                        return (
                                          <button
                                            key={opt.variationOptionId}
                                            type="button"
                                            onClick={() => {
                                              const newOptIds = { ...variant.optionIds };
                                              if (isOptSelected) {
                                                delete newOptIds[variation.variationId];
                                                // Keep row expanded after deselect so user can re-pick
                                                setExpandedVariationKeys(prev => new Set([...prev, expKey]));
                                              } else {
                                                newOptIds[variation.variationId] = opt.variationOptionId;
                                                // Remove from explicit expansion — selected state keeps it expanded
                                                setExpandedVariationKeys(prev => { const next = new Set(prev); next.delete(expKey); return next; });
                                              }
                                              const updated = selectedItem.variants.map((v, i) => i === vi ? { ...v, optionIds: newOptIds } : v);
                                              updateQueueItem(selectedItem.id, { variants: updated });
                                            }}
                                            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
                                              isOptSelected
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
                                            }`}
                                          >
                                            {opt.name}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Price + Stock + delete */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">$</span>
                            <Input
                              type="text" inputMode="decimal" placeholder="Price"
                              value={variant.price}
                              onChange={e => {
                                const updated = selectedItem.variants.map((v, i) => i === vi ? { ...v, price: e.target.value } : v);
                                updateQueueItem(selectedItem.id, { variants: updated });
                              }}
                              className={`h-8 w-28 text-sm pl-6 ${variant.price && !validPrice ? "border-red-300 bg-red-50" : ""}`}
                            />
                          </div>
                          <Input
                            type="text" inputMode="numeric" placeholder="Stock qty"
                            value={variant.stock}
                            onChange={e => {
                              const updated = selectedItem.variants.map((v, i) => i === vi ? { ...v, stock: e.target.value } : v);
                              updateQueueItem(selectedItem.id, { variants: updated });
                            }}
                            className={`h-8 w-24 text-sm ${variant.stock && !validStock ? "border-red-300 bg-red-50" : ""}`}
                          />
                          {rowOk && <span className="text-xs text-green-600 font-medium">✓</span>}
                          <button
                            onClick={() => updateQueueItem(selectedItem.id, { variants: selectedItem.variants.filter((_, i) => i !== vi) })}
                            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Variant always at the bottom */}
                  <button
                    type="button"
                    onClick={() => {
                      const nv: QueuedVariant = { localId: crypto.randomUUID(), optionIds: {}, price: "", stock: "" };
                      updateQueueItem(selectedItem.id, { variants: [...selectedItem.variants, nv] });
                    }}
                    className="w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="size-3.5" /> Add Variant
                  </button>
                </div>

                {/* Attributes */}
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Attributes</label>
                    <p className="text-xs text-gray-400 mt-0.5">Static product properties like material, style, artist, dimensions, etc.</p>
                  </div>

                  {selectedItem.productAttributes.map((attr, ai) => {
                    const attrDef = attributes.find(a => a.attributeId === attr.attributeId);
                    const missingAttr = attr.attributeId === null;
                    const missingVal = attr.attributeId !== null && attr.value.trim() === "";
                    return (
                      <div key={attr.localId} className={`flex items-center gap-2 rounded-xl border p-2 ${missingAttr || missingVal ? "border-red-200 bg-red-50/40" : "border-gray-100 bg-gray-50"}`}>
                        <select
                          value={attr.attributeId ?? ""}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            const updated = selectedItem.productAttributes.map((a, i) =>
                              i === ai ? { ...a, attributeId: isNaN(val) ? null : val, value: "" } : a
                            );
                            updateQueueItem(selectedItem.id, { productAttributes: updated });
                          }}
                          className={`h-9 rounded-lg border px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40 shrink-0 ${missingAttr ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
                        >
                          <option value="">Select attribute…</option>
                          {attributes.map(a => (
                            <option key={a.attributeId} value={a.attributeId}>{a.name}</option>
                          ))}
                        </select>

                        {attrDef?.type === "ENUMERATED" && attrDef.allowedValues?.length ? (
                          <select
                            value={attr.value}
                            onChange={e => {
                              const updated = selectedItem.productAttributes.map((a, i) => i === ai ? { ...a, value: e.target.value } : a);
                              updateQueueItem(selectedItem.id, { productAttributes: updated });
                            }}
                            className={`h-9 rounded-lg border px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 ${missingVal ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
                          >
                            <option value="">Select value…</option>
                            {attrDef.allowedValues.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            placeholder={attr.attributeId === null ? "Select attribute first" : "Enter value"}
                            value={attr.value}
                            disabled={attr.attributeId === null}
                            onChange={e => {
                              const updated = selectedItem.productAttributes.map((a, i) => i === ai ? { ...a, value: e.target.value } : a);
                              updateQueueItem(selectedItem.id, { productAttributes: updated });
                            }}
                            className={`h-9 text-sm flex-1 ${missingVal ? "border-red-300 bg-red-50" : ""}`}
                          />
                        )}

                        {(missingAttr || missingVal) && (
                          <span className="text-[10px] text-red-500 font-medium shrink-0">Required</span>
                        )}

                        <button
                          onClick={() => {
                            updateQueueItem(selectedItem.id, { productAttributes: selectedItem.productAttributes.filter((_, i) => i !== ai) });
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors shrink-0"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Attribute always at the bottom */}
                  {attributes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const na: QueuedAttribute = { localId: crypto.randomUUID(), attributeId: null, value: "" };
                        updateQueueItem(selectedItem.id, { productAttributes: [...selectedItem.productAttributes, na] });
                      }}
                      className="w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="size-3.5" /> Add Attribute
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a product from the list to configure it
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Chat tab ── */}
      {activeTab === "chat" && <>

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Bot className="size-8" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-1">
                AI Admin Assistant · Powered by Gemini
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
      </>}
    </div>
  );
}
