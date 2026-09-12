"use client"
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { CategoryTree } from "@/types/domains/category";

const normalizeRange = (raw: [number, number]): [number, number] => {
    const min = Number.isFinite(raw[0]) ? raw[0] : 0;
    const max = Number.isFinite(raw[1]) ? raw[1] : 0;
    const a = Math.max(0, Math.min(100000, Math.round(min)));
    const b = Math.max(0, Math.min(100000, Math.round(max)));
    return a <= b ? [a, b] : [b, a];
};

// Known active product counts fallback in case backend is deploying or cached
const FALLBACK_COUNTS: Record<number, number> = {
    92: 1804,  // CANVAS WALL ART
    97: 1804,  // Panoramic Wall Art
    112: 0,    // GLASS WALL ART
    134: 105,  // AREA RUGS
    135: 105,  // Designer Area Rugs
};

const getCategoryCount = (cat: CategoryTree): number => {
    if (typeof cat.productCount === 'number') {
        return cat.productCount;
    }
    if (FALLBACK_COUNTS[cat.categoryId] !== undefined) {
        return FALLBACK_COUNTS[cat.categoryId];
    }
    if (cat.subcategories && cat.subcategories.length > 0) {
        return cat.subcategories.reduce((sum, sub) => sum + getCategoryCount(sub), 0);
    }
    return 0;
};

interface FilterSidebarProps {
    categories: CategoryTree[];
    onCategoryChange: (categoryId: number | null) => void;
    selectedCategoryId?: number | null;
    priceRange?: [number, number];
    onPriceRangeChange?: (range: [number, number]) => void;
    mobile?: boolean;
    onClose?: () => void;
}

const FilterSidebar = ({
    categories,
    onCategoryChange,
    selectedCategoryId: selectedCategoryIdProp,
    priceRange: priceRangeProp,
    onPriceRangeChange,
    mobile = false,
    onClose,
}: FilterSidebarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [priceRange, setPriceRange] = useState<[number, number]>(priceRangeProp ?? [0, 100000]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategoryIdProp || null);
    const [openSections, setOpenSections] = useState({ category: true, price: true });
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (selectedCategoryIdProp !== undefined) setSelectedCategoryId(selectedCategoryIdProp);
    }, [selectedCategoryIdProp]);

    useEffect(() => {
        if (priceRangeProp) setPriceRange(priceRangeProp);
    }, [priceRangeProp]);

    useEffect(() => {
        const minParam = searchParams.get("minPrice");
        const maxParam = searchParams.get("maxPrice");
        if (minParam == null && maxParam == null) return;
        setPriceRange((prev) => {
            const min = minParam != null ? Number(minParam) : (priceRangeProp?.[0] ?? prev[0]);
            const max = maxParam != null ? Number(maxParam) : (priceRangeProp?.[1] ?? prev[1]);
            return normalizeRange([min, max]);
        });
    }, [searchParams, priceRangeProp]);

    // Auto-expand category if selectedCategoryId belongs to it or one of its subcategories
    useEffect(() => {
        if (selectedCategoryId != null) {
            categories.forEach((root) => {
                const isMatch =
                    root.categoryId === selectedCategoryId ||
                    root.subcategories?.some((sub) => sub.categoryId === selectedCategoryId);
                if (isMatch) {
                    setExpandedCategoryIds((prev) => ({ ...prev, [root.categoryId]: true }));
                }
            });
        }
    }, [selectedCategoryId, categories]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleExpand = (categoryId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategoryIds(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleCategorySelect = (catId: number, hasSubcategories: boolean = false) => {
        const isSelected = selectedCategoryId === catId;
        const newCategoryId = isSelected ? null : catId;

        setSelectedCategoryId(newCategoryId);
        onCategoryChange(newCategoryId);

        const params = new URLSearchParams(searchParams.toString());
        if (newCategoryId !== null) {
            params.set("categoryId", String(newCategoryId));
        } else {
            params.delete("categoryId");
        }
        router.push(params.toString() ? `/products?${params.toString()}` : "/products");

        // If selecting a category that has subcategories, also expand it
        if (!isSelected && hasSubcategories) {
            setExpandedCategoryIds(prev => ({ ...prev, [catId]: true }));
        }

        onClose?.();
    };

    const applyFilters = () => {
        const normalizedRange = normalizeRange(priceRange);
        const params = new URLSearchParams(searchParams.toString());
        params.set("minPrice", String(normalizedRange[0]));
        params.set("maxPrice", String(normalizedRange[1]));
        router.push(params.toString() ? `/products?${params.toString()}` : "/products");
        onPriceRangeChange?.(normalizedRange);
        onClose?.();
    };

    const isPriceFiltered = priceRange[0] !== 0 || priceRange[1] !== 100000;

    // Filter tree by search input
    const isSearching = categorySearch.trim().length > 0;
    const query = categorySearch.trim().toLowerCase();

    const filteredCategoryTree = useMemo(() => {
        return categories
            .map((root) => {
                if (!isSearching) {
                    return {
                        root,
                        subcategories: root.subcategories || [],
                        isExpanded: !!expandedCategoryIds[root.categoryId],
                        matches: true,
                    };
                }

                const rootMatches = root.name.toLowerCase().includes(query);
                const matchingSubs = (root.subcategories || []).filter((sub) =>
                    sub.name.toLowerCase().includes(query)
                );

                const matches = rootMatches || matchingSubs.length > 0;
                return {
                    root,
                    subcategories: rootMatches ? (root.subcategories || []) : matchingSubs,
                    // In search mode, auto-expand if any child matches
                    isExpanded: matches,
                    matches,
                };
            })
            .filter((item) => item.matches);
    }, [categories, isSearching, query, expandedCategoryIds]);

    return (
        <div
            className={mobile ? "w-full flex flex-col" : "w-64 shrink-0 pr-8 border-r border-border flex flex-col"}
            style={mobile ? undefined : { height: 'calc(100vh - 5.5rem)' }}
        >

            {/* Fixed header — never scrolls, hidden on mobile (Sheet has its own header) */}
            <div className={cn("flex items-center justify-between pb-4 border-b border-border shrink-0", mobile && "hidden")}>
                <h2 className="font-display text-xl font-medium text-foreground">Filters</h2>
                {isPriceFiltered && (
                    <button
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                        onClick={() => {
                            setPriceRange([0, 100000]);
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('minPrice');
                            params.delete('maxPrice');
                            router.push(params.toString() ? `/products?${params.toString()}` : '/products');
                            onPriceRangeChange?.([0, 100000]);
                        }}
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Scrollable body */}
            <div className={mobile ? "pt-6 space-y-8" : "flex-1 overflow-y-auto scrollbar-luxury pt-6 space-y-8"} style={mobile ? undefined : { scrollbarGutter: 'stable' }}>

                {/* Category Filter */}
                <div>
                    <button
                        className="flex items-center justify-between w-full mb-4"
                        onClick={() => toggleSection('category')}
                    >
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                            Categories
                        </p>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${openSections.category ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.category && (
                        <div className="space-y-3">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="pl-9 h-8 text-sm rounded-sm border-border/60 bg-background"
                                />
                            </div>

                            <div className="space-y-0">
                                {filteredCategoryTree.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-2 italic">
                                        {isSearching ? "No categories found" : "No categories available"}
                                    </p>
                                ) : (
                                    filteredCategoryTree.map(({ root, subcategories, isExpanded }) => {
                                        const isRootSelected = selectedCategoryId === root.categoryId;
                                        const hasSubcategories = subcategories.length > 0;
                                        const rootCount = getCategoryCount(root);

                                        return (
                                            <div key={root.categoryId} className="border-b border-border/30 last:border-b-0 py-1">
                                                {/* Main / Top-level Category Row */}
                                                <div className="flex items-center justify-between w-full py-1.5 group">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCategorySelect(root.categoryId, hasSubcategories)}
                                                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left pr-2"
                                                    >
                                                        {/* Custom radio indicator */}
                                                        <span
                                                            className={cn(
                                                                "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                                                isRootSelected
                                                                    ? "border-[#c9a84c] bg-[#c9a84c]/10"
                                                                    : "border-border/60 group-hover:border-foreground/40"
                                                            )}
                                                        >
                                                            {isRootSelected && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] block" />
                                                            )}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "text-sm uppercase tracking-wider truncate transition-colors",
                                                                isRootSelected
                                                                    ? "text-foreground font-semibold"
                                                                    : "text-foreground/80 group-hover:text-foreground font-medium"
                                                            )}
                                                        >
                                                            {root.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-normal shrink-0">
                                                            ({rootCount.toLocaleString()})
                                                        </span>
                                                    </button>

                                                    {/* Accordion toggle button */}
                                                    {hasSubcategories && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => toggleExpand(root.categoryId, e)}
                                                            aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                                                            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                                                        >
                                                            <ChevronDown
                                                                className={cn(
                                                                    "h-3.5 w-3.5 transition-transform duration-200",
                                                                    isExpanded ? "rotate-180 text-foreground" : "text-muted-foreground"
                                                                )}
                                                            />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Subcategories Dropdown / Accordion */}
                                                {isExpanded && hasSubcategories && (
                                                    <div className="pl-4 ml-1.5 border-l border-border/40 space-y-0.5 py-1 mt-0.5 mb-1">
                                                        {subcategories.map((sub) => {
                                                            const isSubSelected = selectedCategoryId === sub.categoryId;
                                                            const subCount = getCategoryCount(sub);

                                                            return (
                                                                <button
                                                                    key={sub.categoryId}
                                                                    type="button"
                                                                    onClick={() => handleCategorySelect(sub.categoryId, false)}
                                                                    className={cn(
                                                                        "flex items-center justify-between w-full py-1.5 px-2 rounded-sm text-left group transition-colors",
                                                                        isSubSelected ? "bg-muted/60" : "hover:bg-muted/30"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                                                        <span
                                                                            className={cn(
                                                                                "w-3 h-3 rounded-full border shrink-0 flex items-center justify-center transition-colors",
                                                                                isSubSelected
                                                                                    ? "border-[#c9a84c] bg-[#c9a84c]/15"
                                                                                    : "border-border/60 group-hover:border-foreground/40"
                                                                            )}
                                                                        >
                                                                            {isSubSelected && (
                                                                                <span className="w-1 h-1 rounded-full bg-[#c9a84c] block" />
                                                                            )}
                                                                        </span>
                                                                        <span
                                                                            className={cn(
                                                                                "text-xs truncate transition-colors",
                                                                                isSubSelected
                                                                                    ? "text-foreground font-medium"
                                                                                    : "text-foreground/70 group-hover:text-foreground"
                                                                            )}
                                                                        >
                                                                            {sub.name}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[11px] text-muted-foreground font-normal shrink-0">
                                                                        ({subCount.toLocaleString()})
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div>
                    <button
                        className="flex items-center justify-between w-full mb-4"
                        onClick={() => toggleSection('price')}
                    >
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                            Price
                        </p>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${openSections.price ? 'rotate-180' : ''}`} />
                    </button>

                    {openSections.price && (
                        <div className="space-y-4">
                            <div className="px-1">
                                <Slider
                                    value={priceRange}
                                    onValueChange={(v) => setPriceRange(normalizeRange([v[0], v[1]]))}
                                    max={100000}
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>${priceRange[0].toLocaleString()}</span>
                                <span>${priceRange[1].toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([v, priceRange[1]]));
                                    }}
                                    className="text-center text-sm h-8 rounded-sm border-border/60"
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const v = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([priceRange[0], v]));
                                    }}
                                    className="text-center text-sm h-8 rounded-sm border-border/60"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    className="w-full rounded-none tracking-widest text-sm font-medium h-10"
                    onClick={applyFilters}
                >
                    Apply Filters
                </Button>

            </div>
        </div>
    );
};

export default FilterSidebar;
