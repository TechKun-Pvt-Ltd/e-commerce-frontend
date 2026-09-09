"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CategoryTree } from "@/types/domains/category";
import { CATEGORY_BAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";

function CircleImage({ src, alt, size }: { src: string; alt: string; size: number }) {
    const [errored, setErrored] = useState(false);
    if (errored) {
        // Keep the same dimensions so layout is never disrupted
        return (
            <div
                className="shrink-0 rounded-full bg-[oklch(0.88_0.022_75)] border border-border/40 flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
            </div>
        );
    }
    return (
        <div className="relative shrink-0 rounded-full overflow-hidden border border-border/40" style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                sizes={`${size}px`}
                className="object-cover"
                onError={() => setErrored(true)}
            />
        </div>
    );
}

const PINNED_LINKS = [
    { label: "New Arrivals", href: "/products?sort=NEWEST" },
    { label: "Bestsellers", href: "/products?sort=MOST_REVIEWED" },
    { label: "Panoramic Canvas", href: "/products?categoryId=97" },
];

const VISIBLE_LIMIT = 8;

const linkClass = "text-[0.95rem] md:text-base font-medium text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap";

function SubcategoryItemWithFlyout({
    sub,
    onClose,
}: {
    sub: CategoryTree;
    onClose: () => void;
}) {
    const hasChildren = sub.subcategories && sub.subcategories.length > 0;
    const [subOpen, setSubOpen] = useState(false);
    const [flyoutSide, setFlyoutSide] = useState<'right' | 'left'>('right');
    const itemRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            // 280px flyout width: check if fits on right side of viewport
            if (rect.right + 280 > window.innerWidth) {
                setFlyoutSide('left');
            } else {
                setFlyoutSide('right');
            }
        }
        if (hasChildren) {
            setSubOpen(true);
        }
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setSubOpen(false), 140);
    };

    return (
        <div
            ref={itemRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={cn(
                "flex items-center justify-between rounded-lg p-1.5 -m-1.5 transition-all group",
                subOpen ? "bg-black/5" : "hover:bg-black/[0.03]"
            )}>
                <Link
                    href={`/products?categoryId=${sub.categoryId}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 text-[0.95rem] text-foreground/70 hover:text-foreground transition-colors flex-1 min-w-0"
                >
                    {/* Circular image */}
                    {sub.imageUrl ? (
                        <div className="group-hover:ring-2 group-hover:ring-[#c9a84c] rounded-full transition-all shrink-0">
                            <CircleImage src={sub.imageUrl} alt={sub.name} size={48} />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-[oklch(0.92_0.022_75)] border border-border/40 group-hover:border-[#c9a84c] flex items-center justify-center shrink-0 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                    <span className="whitespace-nowrap font-medium">{sub.name}</span>
                </Link>

                {hasChildren && (
                    <span className="text-muted-foreground/60 group-hover:text-[#c9a84c] transition-colors pl-2 shrink-0">
                        <ChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-150",
                            subOpen && (flyoutSide === 'right' ? "translate-x-0.5 text-[#c9a84c]" : "-translate-x-0.5 text-[#c9a84c]")
                        )} />
                    </span>
                )}
            </div>

            {/* Açılır Pencere (Flyout Window / Submenu) */}
            {hasChildren && subOpen && (
                <div
                    className={cn(
                        "absolute top-0 z-[60] bg-white border-t-2 border-[#c9a84c] shadow-2xl rounded-sm p-4 w-[280px]",
                        "animate-in fade-in-0 zoom-in-95 duration-150",
                        // Invisible hover bridge to prevent mouse leave gap
                        flyoutSide === 'right'
                            ? "left-full ml-2 before:absolute before:top-0 before:bottom-0 before:-left-3 before:w-4 before:content-['']"
                            : "right-full mr-2 before:absolute before:top-0 before:bottom-0 before:-right-3 before:w-4 before:content-['']"
                    )}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Header */}
                    <div className="pb-2.5 mb-2.5 border-b border-border/30 flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#c9a84c] truncate">
                            {sub.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {sub.subcategories.length} Alt Kategori
                        </span>
                    </div>

                    {/* Subcategories list */}
                    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                        {sub.subcategories.map((child) => (
                            <Link
                                key={child.categoryId}
                                href={`/products?categoryId=${child.categoryId}`}
                                onClick={onClose}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 text-[0.88rem] text-foreground/75 hover:text-foreground hover:bg-black/5 rounded transition-colors group/child"
                            >
                                {child.imageUrl ? (
                                    <CircleImage src={child.imageUrl} alt={child.name} size={28} />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60 group-hover/child:bg-[#c9a84c] group-hover/child:scale-125 shrink-0 transition-all" />
                                )}
                                <span className="truncate">{child.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 mt-2.5 border-t border-border/30">
                        <Link
                            href={`/products?categoryId=${sub.categoryId}`}
                            onClick={onClose}
                            className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#c9a84c] hover:text-[#b8960c] transition-colors block text-center"
                        >
                            Tümünü Gör ({sub.name}) →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoryLink({ category }: { category: CategoryTree }) {
    const [open, setOpen] = useState(false);
    const [align, setAlign] = useState<'left' | 'right'>('left');
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const hasChildren = category.subcategories.length > 0;

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setAlign(rect.left > window.innerWidth / 2 ? 'right' : 'left');
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 120);
    };

    const CategoryImage = () => (
        category.imageUrl ? <CircleImage src={category.imageUrl} alt={category.name} size={40} /> : null
    );

    if (!hasChildren) {
        return (
            <Link href={`/products?categoryId=${category.categoryId}`} className={cn(linkClass, "flex items-center gap-2")}>
                <CategoryImage />
                {category.name}
            </Link>
        );
    }

    const cols = category.subcategories.length > 8 ? 3 : category.subcategories.length > 4 ? 2 : 1;

    return (
        <div
            ref={triggerRef}
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className={cn(linkClass, "flex items-center gap-2 outline-none h-full")}>
                <CategoryImage />
                {category.name}
                <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform duration-150", open && "rotate-180")} />
            </button>

            {open && (
                <div
                    className="absolute top-full z-50 bg-white border-t-2 border-[#c9a84c] shadow-2xl"
                    style={{
                        minWidth: cols === 3 ? "720px" : cols === 2 ? "480px" : "300px",
                        left: align === 'left' ? 0 : 'auto',
                        right: align === 'right' ? 0 : 'auto',
                    }}
                >

                    {/* Header */}
                    <div className="px-8 pt-5 pb-3 border-b border-border/30">
                        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a84c]">
                            {category.name}
                        </p>
                    </div>

                    {/* Subcategory grid */}
                    <div className={cn(
                        "grid px-8 py-5",
                        cols === 3 && "grid-cols-3 gap-x-8 gap-y-4",
                        cols === 2 && "grid-cols-2 gap-x-8 gap-y-4",
                        cols === 1 && "grid-cols-1 gap-y-4"
                    )}>
                        {category.subcategories.map((sub) => (
                            <SubcategoryItemWithFlyout
                                key={sub.categoryId}
                                sub={sub}
                                onClose={() => setOpen(false)}
                            />
                        ))}
                    </div>

                    {/* Shop All footer */}
                    <div className="px-8 py-3 bg-[oklch(0.97_0.012_75)] border-t border-border/30">
                        <Link
                            href={`/products?categoryId=${category.categoryId}`}
                            onClick={() => setOpen(false)}
                            className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#c9a84c] hover:text-[#b8960c] transition-colors"
                        >
                            Shop All {category.name} →
                        </Link>
                    </div>

                </div>
            )}
        </div>
    );
}

/* AllCategoriesSheet — commented out, keep for future use
function AllCategoriesSheet({ categories }: { categories: CategoryTree[] }) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 shrink-0 px-3 h-full border-r border-border/50 text-sm font-semibold text-foreground hover:bg-black/5 transition-colors"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                All
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="left"
                    className="p-0 w-[300px] bg-[oklch(0.97_0.012_75)] border-r border-border flex flex-col"
                >
                    <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
                        <SheetTitle className="text-left text-base font-semibold tracking-wide">
                            All Categories
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto py-2">
                        {categories.map((cat) => {
                            const hasChildren = cat.subcategories.length > 0;
                            const isExpanded = expanded === cat.categoryId;

                            return (
                                <div key={cat.categoryId}>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/products?categoryId=${cat.categoryId}`}
                                            onClick={() => setOpen(false)}
                                            className="flex-1 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-black/5 transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                        {hasChildren && (
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : cat.categoryId)}
                                                className="px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                                            </button>
                                        )}
                                    </div>

                                    {hasChildren && isExpanded && (
                                        <div className="bg-black/3 border-t border-b border-border/40">
                                            {cat.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.categoryId}
                                                    href={`/products?categoryId=${sub.categoryId}`}
                                                    onClick={() => setOpen(false)}
                                                    className="flex items-center gap-2 pl-8 pr-5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
                                                >
                                                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
*/

export default function CategoriesBar({ categories }: { categories: CategoryTree[] }) {
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.name.toUpperCase().includes("CANVAS")) return -1;
        if (b.name.toUpperCase().includes("CANVAS")) return 1;
        return a.name.localeCompare(b.name);
    });
    const overflowing = sortedCategories.length > VISIBLE_LIMIT + 1;
    const visible = overflowing ? sortedCategories.slice(0, VISIBLE_LIMIT) : sortedCategories;
    const overflow = overflowing ? sortedCategories.slice(VISIBLE_LIMIT) : [];

    return (
        <div
            className="w-full bg-[oklch(0.92_0.022_75)] border-b border-border/70 overflow-visible"
            style={{ height: CATEGORY_BAR_HEIGHT }}
        >
            {/* ── Mobile: horizontal category scroll ── */}
            <div className="sm:hidden h-full flex items-center gap-5 px-4 overflow-x-auto scrollbar-none">
                {sortedCategories.map((cat) => (
                    <Link
                        key={cat.categoryId}
                        href={`/products?categoryId=${cat.categoryId}`}
                        className="text-sm font-medium text-foreground/75 hover:text-foreground whitespace-nowrap shrink-0 transition-colors"
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            {/* ── Desktop: categories ── */}
            <div className="hidden sm:flex h-full items-center justify-center gap-10 max-w-6xl mx-auto w-full px-6 md:px-10">
                {visible.map((cat) => (
                    <div key={cat.categoryId} className="shrink-0 h-full flex items-center">
                        <CategoryLink category={cat} />
                    </div>
                ))}

                {overflow.length > 0 && (
                    <MoreDropdown overflow={overflow} />
                )}
            </div>
        </div>
    );
}

function MoreDropdown({ overflow }: { overflow: CategoryTree[] }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 120);
    };

    return (
        <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className={cn(linkClass, "flex items-center gap-0.5 outline-none h-full")}>
                More <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform duration-150", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full right-0 z-50 bg-[oklch(0.97_0.012_75)] border border-border shadow-xl">
                    <div className="py-2 min-w-[160px]">
                        {overflow.map((cat) => (
                            <Link
                                key={cat.categoryId}
                                href={`/products?categoryId=${cat.categoryId}`}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-black/5 transition-colors whitespace-nowrap"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
