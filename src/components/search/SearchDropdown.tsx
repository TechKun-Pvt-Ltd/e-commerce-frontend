/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProductPreview } from "@/types/domains/product";
import * as productServices from "@/services/product";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchDropdownProps {
    query: string;
    isOpen: boolean;
    onSelect: (productId: number) => void;
    onSearchAll: (query: string) => void;
    onClose: () => void;
    debounceMs?: number;
    maxCacheSize?: number;
}

interface LRUCache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  delete(key: K): boolean;
  clear(): void;
  size: number;
}

function createLRUCache<K, V>(maxSize: number): LRUCache<K, V> {
  const map = new Map<K, V>();

  return {
    get(key: K) {
      const value = map.get(key);
      if (value !== undefined) {
        // Move to end (most recently used)
        map.delete(key);
        map.set(key, value);
      }
      return value;
    },
    set(key: K, value: V) {
      if (map.has(key)) {
        map.delete(key);
      } else if (map.size >= maxSize) {
        // Remove least recently used (first entry)
        const firstKey = map.keys().next().value;
        if (firstKey !== undefined) {
          map.delete(firstKey);
        }
      }
      map.set(key, value);
    },
    delete(key: K) {
      return map.delete(key);
    },
    clear() {
      map.clear();
    },
    get size() {
      return map.size;
    },
  };
}

export default function SearchDropdown({
    query,
    isOpen,
    onSelect,
    onSearchAll,
    onClose,
    debounceMs = 300,
    maxCacheSize = 50,
}: SearchDropdownProps) {
    const [products, setProducts] = useState<ProductPreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const cacheRef = useRef<LRUCache<string, ProductPreview[]>>(createLRUCache(maxCacheSize));
    const queryDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestRequestId = useRef(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const trimmedQuery = query.trim();
    const shouldShow = isOpen && trimmedQuery.length >= 2;

    // Fetch products with configurable debounce
    useEffect(() => {
        if (queryDebounceTimer.current) {
            clearTimeout(queryDebounceTimer.current);
        }

        if (trimmedQuery.length < 2) {
            setProducts([]);
            setIsLoading(false);
            setHighlightedIndex(-1);
            return;
        }

        // Check in-memory LRU cache first
        const cacheKey = trimmedQuery.toLowerCase();
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
            setProducts(cached);
            setIsLoading(false);
            setHighlightedIndex(-1);
            return;
        }

        setIsLoading(true);
        const currentReqId = ++latestRequestId.current;

        queryDebounceTimer.current = setTimeout(async () => {
            try {
                const response = await productServices.getAllProducts({
                    searchInput: trimmedQuery,
                    limit: 6,
                    status: true,
                });

                if (currentReqId === latestRequestId.current) {
                    if (response.success && response.data) {
                        const items = response.data;
                        cacheRef.current.set(cacheKey, items);
                        setProducts(items);
                    } else {
                        setProducts([]);
                    }
                    setIsLoading(false);
                    setHighlightedIndex(-1);
                }
            } catch (err) {
                if (currentReqId === latestRequestId.current) {
                    console.error("SearchDropdown query error:", err);
                    setProducts([]);
                    setIsLoading(false);
                    setHighlightedIndex(-1);
                }
            }
        }, debounceMs);

        return () => {
            if (queryDebounceTimer.current) {
                clearTimeout(queryDebounceTimer.current);
            }
        };
    }, [trimmedQuery, debounceMs]);

    // Handle Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!shouldShow) return;

            const totalOptions = products.length + 1; // products + "View all results" option

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1) % totalOptions);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < products.length) {
                    onSelect(products[highlightedIndex].productId);
                } else {
                    onSearchAll(trimmedQuery);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        },
        [shouldShow, products, highlightedIndex, onSelect, onSearchAll, onClose, trimmedQuery]
    );

    useEffect(() => {
        if (!shouldShow) return;
        window.addEventListener("keydown", handleKeyDown, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [shouldShow, handleKeyDown]);

    // Close dropdown on click outside
    useEffect(() => {
        if (!shouldShow) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                const target = event.target as HTMLElement;
                if (!target.closest('input[type="search"]')) {
                    onClose();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [shouldShow, onClose]);

    if (!shouldShow) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border shadow-2xl rounded-xl overflow-hidden max-h-[440px] flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
            onMouseDown={(e) => e.stopPropagation()}
        >
                {/* Result list */}
                <div className="overflow-y-auto flex-1 divide-y divide-border/40 py-1">
                    {isLoading && products.length === 0 ? (
                        // Skeleton state
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className="w-12 h-12 rounded-md bg-muted animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="h-3.5 bg-muted rounded w-3/4 animate-pulse" />
                                    <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : products.length === 0 ? (
                        // Empty state
                        <div className="px-4 py-8 text-center">
                            <Search className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                No results found for &ldquo;{trimmedQuery}&rdquo;
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Check spelling or try searching for something else
                            </p>
                        </div>
                    ) : (
                        // Products list
                        products.map((product, idx) => {
                            const isHighlighted = idx === highlightedIndex;
                            const img = product.images?.[0] || product.imageUrl;

                            return (
                                <div
                                    key={product.productId}
                                    onClick={() => onSelect(product.productId)}
                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                    className={cn(
                                        "flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors select-none",
                                        isHighlighted
                                            ? "bg-muted text-foreground"
                                            : "hover:bg-muted/50 text-foreground"
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 border border-border/40">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">
                                                No img
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {product.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {product.quantityInStock <= 0 ? (
                                                <span className="text-[11px] text-destructive font-medium">
                                                    Out of Stock
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground">
                                                    In Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            ${product.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer: View all results */}
                <button
                    type="button"
                    onClick={() => onSearchAll(trimmedQuery)}
                    onMouseEnter={() => setHighlightedIndex(products.length)}
                    className={cn(
                        "w-full py-3 px-4 text-center text-xs font-semibold tracking-wide border-t border-border transition-colors select-none flex items-center justify-center gap-1.5",
                        highlightedIndex === products.length
                            ? "bg-muted text-primary"
                            : "bg-background hover:bg-muted/40 text-primary"
                    )}
                >
                    <span>View all results for &ldquo;</span>
                    <span className="max-w-[200px] truncate">{trimmedQuery}</span>
                    <span>&rdquo;</span>
                </button>
            </div>
    );
}