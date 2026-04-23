"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CategoryTree } from "@/types/domains/category";

const normalizeRange = (raw: [number, number]): [number, number] => {
    const min = Number.isFinite(raw[0]) ? raw[0] : 0;
    const max = Number.isFinite(raw[1]) ? raw[1] : 0;
    const a = Math.max(0, Math.min(100000, Math.round(min)));
    const b = Math.max(0, Math.min(100000, Math.round(max)));
    return a <= b ? [a, b] : [b, a];
};

interface FilterSidebarProps {
    categories: CategoryTree[];
    onCategoryChange: (categoryId: number | null) => void;
    selectedCategoryId?: number | null;
    priceRange?: [number, number];
    onPriceRangeChange?: (range: [number, number]) => void;
}

const FilterSidebar = ({
    categories,
    onCategoryChange,
    selectedCategoryId: selectedCategoryIdProp,
    priceRange: priceRangeProp,
    onPriceRangeChange,
}: FilterSidebarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Draft state (user adjusts UI), applied only on "Apply Filters"
    const [priceRange, setPriceRange] = useState<[number, number]>(priceRangeProp ?? [0, 100000]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(selectedCategoryIdProp || null);
    const [openSections, setOpenSections] = useState({
        category: true,
        price: true,
    });

    // Sync internal state with prop when it changes
    useEffect(() => {
        if (selectedCategoryIdProp !== undefined) {
            setSelectedCategoryId(selectedCategoryIdProp);
        }
    }, [selectedCategoryIdProp]);

    // Sync internal price range with prop when it changes
    useEffect(() => {
        if (priceRangeProp) {
            setPriceRange(priceRangeProp);
        }
    }, [priceRangeProp]);

    // Read price params from URL (deep-link / refresh)
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

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (value: string) => {
        // Category should apply immediately (no Apply button needed)
        const categoryId = value === "" ? null : parseInt(value, 10);
        setSelectedCategoryId(categoryId);
        onCategoryChange(categoryId);

        const params = new URLSearchParams(searchParams.toString());
        if (categoryId !== null) {
            params.set("categoryId", String(categoryId));
        } else {
            params.delete("categoryId");
        }
        const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
        router.push(newUrl);
    };

    const applyFilters = () => {
        const normalizedRange = normalizeRange(priceRange);
        const params = new URLSearchParams(searchParams.toString());

        params.set("minPrice", String(normalizedRange[0]));
        params.set("maxPrice", String(normalizedRange[1]));

        const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
        router.push(newUrl);

        onPriceRangeChange?.(normalizedRange);
    };

    // Recursively flatten all categories and subcategories for filtering
    const flattenCategories = (cats: CategoryTree[]): CategoryTree[] => {
        const result: CategoryTree[] = [];
        cats.forEach(cat => {
            result.push(cat);
            if (cat.subcategories && cat.subcategories.length > 0) {
                result.push(...flattenCategories(cat.subcategories));
            }
        });
        return result;
    };

    const allCategories = flattenCategories(categories);
    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <div className="w-72 bg-white border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Filter</h2>
                {(priceRange[0] !== 0 || priceRange[1] !== 100000) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setPriceRange([0, 100000]);
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('minPrice');
                            params.delete('maxPrice');
                            const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
                            router.push(newUrl);

                            onPriceRangeChange?.([0, 100000]);
                        }}
                    >
                        Clear
                    </Button>
                )}
            </div>

            <div className="p-4 space-y-6">

                {/* Category Filter */}
                <div>
                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => toggleSection('category')}
                    >
                        <h3 className="font-medium text-gray-900">Categories</h3>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
                    </div>

                    {openSections.category && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search categories"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="pl-10 text-sm"
                                />
                            </div>
                            <RadioGroup
                                value={selectedCategoryId !== null ? selectedCategoryId.toString() : ""}
                                onValueChange={handleCategoryChange}
                                className="space-y-2"
                            >
                                {filteredCategories.map((cat) => (
                                    <div
                                        key={cat.categoryId}
                                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
                                    >
                                        <RadioGroupItem
                                            value={cat.categoryId.toString()}
                                            id={`cat-${cat.categoryId}`}
                                        />
                                        <Label
                                            htmlFor={`cat-${cat.categoryId}`}
                                            className="flex-1 text-sm text-gray-700 cursor-pointer"
                                        >
                                            {cat.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div>
                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => toggleSection('price')}
                    >
                        <h3 className="font-medium text-gray-900">Price</h3>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
                    </div>

                    {openSections.price && (
                        <div className="space-y-4">
                            <div className="px-2">
                                <Slider
                                    value={priceRange}
                                    onValueChange={(v) => setPriceRange(normalizeRange([v[0], v[1]]))}
                                    max={100000}
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const nextMin = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([nextMin, priceRange[1]]));
                                    }}
                                    className="text-center text-sm"
                                />
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const nextMax = e.target.value === "" ? 0 : Number(e.target.value);
                                        setPriceRange(normalizeRange([priceRange[0], nextMax]));
                                    }}
                                    className="text-center text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Button className="w-full" onClick={applyFilters}>
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};

export default FilterSidebar;
