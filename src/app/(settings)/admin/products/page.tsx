/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { ProductPreview } from "@/types/domains/product";
import { CategoryTree } from "@/types/domains/category";
import { Star, MoreVertical, Copy, Pencil, Trash2, ToggleLeft, ToggleRight, X, FolderInput, Search, Check, Folder, ChevronRight } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDataFetch from "@/hooks/use-data-fetch";
import * as productServices from "@/services/product";
import CategoriesDropdown, { CategoryDropdownNode } from "@/app/components/CategoriesDropdown";
import { useAppSelector } from "@/store/hooks";
import placeholderImage from '@/../public/placeholder-image.jpeg';
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";

interface FlatCategoryItem {
    categoryId: number;
    name: string;
    path: string;
    level: number;
}

function flattenCategoryTree(nodes: CategoryTree[], parentPath = "", level = 0): FlatCategoryItem[] {
    const result: FlatCategoryItem[] = [];
    for (const node of nodes) {
        const fullPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
        result.push({
            categoryId: node.categoryId,
            name: node.name,
            path: fullPath,
            level
        });
        if (node.subcategories && node.subcategories.length > 0) {
            result.push(...flattenCategoryTree(node.subcategories, fullPath, level + 1));
        }
    }
    return result;
}

export default function ProductsPage() {

    const router = useRouter();
    const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
    const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();
    const productsData = useDataFetch(productServices.getAllProducts);

    const [categorySearch, setCategorySearch] = useState("");
    const flatCategories = useMemo(() => flattenCategoryTree(categories || []), [categories]);
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return flatCategories;
        const q = categorySearch.toLowerCase().trim();
        return flatCategories.filter(c => c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q));
    }, [flatCategories, categorySearch]);

    // single-delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ProductPreview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // multi-select state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = useState(false);
    const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
    const [bulkTargetCategory, setBulkTargetCategory] = useState<CategoryDropdownNode>();

    const refreshProducts = () =>
        productsData.request(selectedCategory?.categoryId !== undefined ? { categoryId: selectedCategory.categoryId } : {});

    useEffect(() => { refreshProducts(); }, [selectedCategory]);

    // ── selection helpers ──────────────────────────────────────────────────────
    const toggleSelect = (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const selectAll = () =>
        setSelectedIds(new Set(productsData.data?.map(p => p.productId) ?? []));

    const clearSelection = () => setSelectedIds(new Set());

    const allSelected =
        (productsData.data?.length ?? 0) > 0 &&
        selectedIds.size === (productsData.data?.length ?? 0);

    // ── derived counts for smart activate/deactivate ──────────────────────────
    const selectedProducts = (productsData.data ?? []).filter(p => selectedIds.has(p.productId));
    const selectedActiveCount = selectedProducts.filter(p => p.status !== false).length;
    const selectedInactiveCount = selectedProducts.filter(p => p.status === false).length;

    // ── bulk actions ───────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            const res = await productServices.bulkDeleteProducts([...selectedIds]);
            if (!res.success) { toast.error(res.error || "Bulk delete failed."); return; }
            const { deleted, failed } = res.data!;
            if (deleted.length > 0) toast.success(`${deleted.length} product(s) deleted.`);
            if (failed.length > 0) toast.warning(`${failed.length} product(s) skipped — they have existing orders.`);
            clearSelection();
            setBulkDeleteOpen(false);
            refreshProducts();
        } catch { toast.error("Bulk delete failed."); }
        finally { setIsBulkDeleting(false); }
    };

    const handleBulkStatus = async (status: boolean) => {
        // Only send products that actually need changing
        const eligible = (productsData.data ?? [])
            .filter(p => selectedIds.has(p.productId) && (p.status !== false) !== status)
            .map(p => p.productId);

        if (eligible.length === 0) {
            toast.info(`All selected products are already ${status ? "active" : "inactive"}.`);
            return;
        }

        setIsBulkUpdatingStatus(true);
        try {
            const res = await productServices.bulkUpdateProductStatus(eligible, status);
            if (!res.success) { toast.error(res.error || "Failed to update status."); return; }
            const skipped = selectedIds.size - eligible.length;
            let msg = `${eligible.length} product(s) ${status ? "activated" : "deactivated"}.`;
            if (skipped > 0) msg += ` ${skipped} already ${status ? "active" : "inactive"} — skipped.`;
            toast.success(msg);
            clearSelection();
            refreshProducts();
        } catch { toast.error("Failed to update status."); }
        finally { setIsBulkUpdatingStatus(false); }
    };

    const handleBulkCategory = async () => {
        if (!bulkTargetCategory) {
            toast.error("Please select a target category.");
            return;
        }

        const targetCat = bulkTargetCategory;
        const targetCatId = targetCat.categoryId;
        const targetCatName = targetCat.name;
        const idsToUpdate = new Set(selectedIds);
        const count = idsToUpdate.size;
        const currentFilteredCatId = selectedCategory?.categoryId;

        // 1. Instant optimistic update: update client state immediately (0ms delay)
        productsData.setData(prev => {
            if (!prev) return prev;
            if (currentFilteredCatId !== undefined && currentFilteredCatId !== targetCatId) {
                return prev.filter(p => !idsToUpdate.has(p.productId));
            }
            return prev.map(p => idsToUpdate.has(p.productId) ? { ...p, categoryId: targetCatId } : p);
        });

        // 2. Instant UI feedback & dialog close
        clearSelection();
        setBulkCategoryOpen(false);
        setBulkTargetCategory(undefined);
        setCategorySearch("");
        toast.success(`${count} product(s) moved to "${targetCatName}".`);

        // 3. Background API persist
        try {
            const res = await productServices.bulkUpdateProductCategory(
                [...idsToUpdate],
                targetCatId
            );
            if (!res.success) {
                toast.error(res.error || "Failed to update category on server.");
                refreshProducts();
            }
        } catch {
            toast.error("Failed to update product category. Reverting...");
            refreshProducts();
        }
    };

    // ── single-product actions ─────────────────────────────────────────────────
    const stopNav = (e: Event) => {
        (e as unknown as { preventDefault?: () => void }).preventDefault?.();
        (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
    };

    const handleCopy = async (product: ProductPreview, e: Event) => {
        stopNav(e);
        try {
            const res = await productServices.getProductById(product.productId);
            if (!res.success) throw new Error(res.error);
            const fullProduct = res.data;
            const inferredCategoryId =
                (fullProduct as unknown as { categoryId?: number }).categoryId ??
                (fullProduct as unknown as { category?: { categoryId?: number } }).category?.categoryId ??
                product.categoryId;
            localStorage.setItem("copiedProduct", JSON.stringify({ ...fullProduct, categoryId: inferredCategoryId }));
            toast.success(`"${product.title}" copied! Open Add Product to paste.`);
        } catch { toast.error("Failed to copy product details."); }
    };

    const handleEdit = (product: ProductPreview, e: Event) => {
        stopNav(e);
        router.push(`/admin/products/product-form/${product.productId}`);
    };

    const handleDelete = (product: ProductPreview, e: Event) => {
        stopNav(e);
        setDeleteTarget(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await productServices.deleteProduct(deleteTarget.productId);
            if (!res.success) { toast.error(res.error || "Failed to delete product."); return; }
            toast.success("Product deleted successfully.");
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            refreshProducts();
        } catch { toast.error("Failed to delete product."); }
        finally { setIsDeleting(false); }
    };

    const handleToggleActive = async (product: ProductPreview, e: Event) => {
        stopNav(e);
        const currentlyActive = product.status !== false;
        try {
            await productServices.updateProductBasicDetails(product.productId, {
                title: product.title,
                starred: product.starred,
                categoryId: product.categoryId,
                status: !currentlyActive,
            });
            toast.success(currentlyActive ? "Product deactivated." : "Product activated.");
            refreshProducts();
        } catch { toast.error("Failed to update product status."); }
    };

    const busyBulk = isBulkDeleting || isBulkUpdatingStatus;

    return <div className="space-y-4">

        {/* ── single-delete dialog ── */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!isDeleting) { setDeleteTarget(null); setDeleteDialogOpen(open); } }}>
            <DialogContent closeIcon={!isDeleting}>
                <DialogHeader>
                    <DialogTitle>Delete product?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete <span className="font-medium">{deleteTarget?.title}</span>. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting || !deleteTarget}>
                        {isDeleting ? <><Spinner className="mr-2 size-4" />Deleting...</> : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── bulk-delete dialog ── */}
        <Dialog open={bulkDeleteOpen} onOpenChange={(open) => { if (!isBulkDeleting) setBulkDeleteOpen(open); }}>
            <DialogContent closeIcon={!isBulkDeleting}>
                <DialogHeader>
                    <DialogTitle>Delete {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the selected products. Products with existing orders will be skipped and reported.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                        {isBulkDeleting ? <><Spinner className="mr-2 size-4" />Deleting...</> : `Delete ${selectedIds.size}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── bulk-category dialog ── */}
        <Dialog open={bulkCategoryOpen} onOpenChange={(open) => { 
            setBulkCategoryOpen(open); 
            if (!open) {
                setBulkTargetCategory(undefined);
                setCategorySearch("");
            }
        }}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Change Category for {selectedIds.size} Product{selectedIds.size !== 1 ? "s" : ""}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Search and select a new target category. Changes will apply instantly.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-2 flex flex-col flex-1 overflow-hidden space-y-3">
                    {/* Instant Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search category name or path..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="pl-9 pr-8 h-9 text-sm"
                            autoFocus
                        />
                        {categorySearch && (
                            <button
                                type="button"
                                onClick={() => setCategorySearch("")}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Fast Clickable List */}
                    <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto bg-white">
                        {categoriesLoading ? (
                            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Spinner className="size-4" /> Loading categories...
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No categories found matching &quot;{categorySearch}&quot;
                            </div>
                        ) : (
                            filteredCategories.map((cat) => {
                                const isSelected = bulkTargetCategory?.categoryId === cat.categoryId;
                                return (
                                    <button
                                        key={cat.categoryId}
                                        type="button"
                                        onClick={() => setBulkTargetCategory({
                                            categoryId: cat.categoryId,
                                            name: cat.name,
                                            parentCategory: undefined
                                        })}
                                        className={[
                                            "w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between text-sm group cursor-pointer",
                                            isSelected
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "hover:bg-slate-50 text-gray-700"
                                        ].join(" ")}
                                        style={{ paddingLeft: `${Math.max(12, cat.level * 20 + 12)}px` }}
                                    >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                            {cat.level > 0 ? (
                                                <ChevronRight className="size-3 text-muted-foreground shrink-0 opacity-50" />
                                            ) : (
                                                <Folder className="size-3.5 text-muted-foreground shrink-0" />
                                            )}
                                            <div className="truncate">
                                                <div className="truncate text-sm font-medium">{cat.name}</div>
                                                {cat.level > 0 && (
                                                    <div className="text-[11px] text-muted-foreground truncate opacity-75">
                                                        {cat.path}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                                                <Check className="size-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Selected Badge */}
                    {bulkTargetCategory ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs flex items-center justify-between">
                            <div>
                                <span className="text-emerald-700 font-medium">Target Category: </span>
                                <span className="font-semibold text-emerald-900">{bulkTargetCategory.name}</span>
                            </div>
                            <span className="text-[11px] text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono">
                                ID: #{bulkTargetCategory.categoryId}
                            </span>
                        </div>
                    ) : (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-muted-foreground">
                            Click any category above to select it.
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 pt-2 bg-slate-50/50 border-t flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setBulkCategoryOpen(false);
                            setBulkTargetCategory(undefined);
                            setCategorySearch("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleBulkCategory}
                        disabled={!bulkTargetCategory}
                    >
                        Apply Instantly
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── page header ── */}
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <div className="flex items-center gap-4">
                <CategoriesDropdown
                    selectedCategoryNode={selectedCategory}
                    onSelect={setSelectedCategory}
                    disabled={categoriesLoading}
                    categories={categories}
                />
                <Link href="/admin/products/product-form">
                    <Button variant="default">Add Product</Button>
                </Link>
            </div>
        </div>

        {/* ── selection toolbar ── */}
        {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
                    className="mr-1"
                />
                <span className="text-sm font-medium">{selectedIds.size} selected</span>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <Button
                        size="sm" variant="outline"
                        onClick={() => setBulkCategoryOpen(true)}
                        disabled={busyBulk}
                    >
                        <FolderInput className="size-3.5 mr-1" />
                        Change Category
                    </Button>
                    <Button
                        size="sm" variant="outline"
                        onClick={() => handleBulkStatus(true)}
                        disabled={busyBulk || selectedInactiveCount === 0}
                        title={selectedInactiveCount === 0 ? "All selected products are already active" : undefined}
                    >
                        {isBulkUpdatingStatus ? <Spinner className="size-3 mr-1" /> : null}
                        Activate
                        {selectedInactiveCount > 0 && selectedInactiveCount < selectedIds.size && (
                            <span className="ml-1 opacity-60">({selectedInactiveCount})</span>
                        )}
                    </Button>
                    <Button
                        size="sm" variant="outline"
                        onClick={() => handleBulkStatus(false)}
                        disabled={busyBulk || selectedActiveCount === 0}
                        title={selectedActiveCount === 0 ? "All selected products are already inactive" : undefined}
                    >
                        {isBulkUpdatingStatus ? <Spinner className="size-3 mr-1" /> : null}
                        Deactivate
                        {selectedActiveCount > 0 && selectedActiveCount < selectedIds.size && (
                            <span className="ml-1 opacity-60">({selectedActiveCount})</span>
                        )}
                    </Button>
                    <Button
                        size="sm" variant="destructive"
                        onClick={() => setBulkDeleteOpen(true)}
                        disabled={busyBulk}
                    >
                        <Trash2 className="size-3 mr-1" />
                        Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearSelection} disabled={busyBulk}>
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        )}

        {/* ── product grid ── */}
        <div className="py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsData.isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="rounded-md border overflow-hidden shadow-sm">
                        <div className="relative">
                            <Skeleton className="absolute right-2 top-2 z-10 h-10 w-10 rounded-md bg-muted-foreground/20" />
                            <Skeleton className="w-full aspect-square rounded-none" />
                        </div>
                        <div className="p-2 flex gap-2">
                            <div className="flex-1 pt-2">
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-3/4 mb-3" />
                                <div className="flex items-center gap-2 mb-4">
                                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                    <Skeleton className="h-3 w-6" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-16 mb-2" />
                            </div>
                            <div className="pt-2">
                                <Skeleton className="h-10 w-10 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))
            ) : productsData.data?.map((product) => {
                const isSelected = selectedIds.has(product.productId);
                return (
                    <div key={product.productId} className="relative">
                        <Link className="block w-full" href={`/admin/products/product-form/${product.productId}`}>
                            <div className={[
                                "rounded-md border overflow-hidden shadow-sm transition relative w-full",
                                isSelected
                                    ? "ring-2 ring-primary border-primary"
                                    : product.status === false
                                    ? "opacity-80"
                                    : "hover:shadow-md",
                            ].join(" ")}>

                                {/* checkbox — top left */}
                                <div
                                    className="absolute left-2 top-2 z-10"
                                    onClick={(e) => toggleSelect(product.productId, e)}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        className="bg-white/90 border-2 shadow-sm"
                                    />
                                </div>

                                {/* star — top right */}
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-2 top-2 z-10"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Star className={"h-4 w-4 " + (product.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                                </Button>

                                {/* image */}
                                <div className={["relative", product.status === false ? "grayscale" : ""].join(" ")}>
                                    <Image
                                        src={product.imageUrl || placeholderImage}
                                        alt={product.title}
                                        width={210}
                                        height={200}
                                        className="w-full h-auto aspect-square object-cover"
                                    />
                                    {product.status === false && (
                                        <>
                                            <div className="absolute inset-0 bg-black/30" />
                                            <Badge className="absolute top-2 left-2 bg-black text-white border border-white/20">
                                                Deactivated
                                            </Badge>
                                        </>
                                    )}
                                </div>

                                <div className="p-2 flex">
                                    <div className="flex-1 pt-2">
                                        <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                                            {product.title}
                                        </h3>
                                        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                            <span>{product.rating}</span>
                                            <span className="text-muted-foreground">• {product.quantityInStock} in stock</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-base font-bold text-foreground">
                                                ${product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3-dot menu */}
                                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onSelect={(e) => handleCopy(product, e)}>
                                                    <Copy className="h-4 w-4" />Copy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => handleEdit(product, e)}>
                                                    <Pencil className="h-4 w-4" />Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => handleToggleActive(product, e)}>
                                                    {product.status !== false
                                                        ? <><ToggleLeft className="h-4 w-4" />Deactivate</>
                                                        : <><ToggleRight className="h-4 w-4" />Activate</>}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" onSelect={(e) => handleDelete(product, e)}>
                                                    <Trash2 className="h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    </div>;
}
