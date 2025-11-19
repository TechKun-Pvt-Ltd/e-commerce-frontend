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

interface FilterSidebarProps {
    categories: CategoryTree[];
    onCategoryChange: (categoryId: number | null) => void;
    selectedCategoryId?: number | null;
}

const FilterSidebar = ({ categories, onCategoryChange, selectedCategoryId: selectedCategoryIdProp }: FilterSidebarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [priceRange, setPriceRange] = useState([0, 100000]);
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

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (value: string) => {
        // RadioGroup returns string, convert to number or null
        const categoryId = value === "" ? null : parseInt(value, 10);
        setSelectedCategoryId(categoryId);
        onCategoryChange(categoryId);

        // Update URL with categoryId query parameter
        if (categoryId !== null) {
            router.push(`/products?categoryId=${categoryId}`);
        } else {
            // Remove categoryId from URL if deselected
            const params = new URLSearchParams(searchParams.toString());
            params.delete('categoryId');
            const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
            router.push(newUrl);
        }
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
                {selectedCategoryId !== null && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedCategoryId(null);
                            setPriceRange([0, 100000]);
                            onCategoryChange(null);
                            // Remove categoryId from URL
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('categoryId');
                            const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
                            router.push(newUrl);
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
                                    onValueChange={setPriceRange}
                                    max={100000}
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{priceRange[0]} SAR</span>
                                <span>{priceRange[1]} SAR</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || priceRange[1]])}
                                    className="text-center text-sm"
                                />
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="text-center text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
