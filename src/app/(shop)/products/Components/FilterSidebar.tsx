"use client"
import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { CategoryTree } from "@/types/domains/category";

interface FilterSidebarProps {
    categories: CategoryTree[];
    onCategoryChange: (categoryId: number | null) => void;
}

const FilterSidebar = ({ categories, onCategoryChange }: FilterSidebarProps) => {
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [categorySearch, setCategorySearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSizes, setSelectedSizes] = useState(new Set());
    const [selectedColors, setSelectedColors] = useState(new Set());
    const [openSections, setOpenSections] = useState({
        category: true,
        price: true,
        size: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleCategory = (categoryId: number) => {
        // Single selection: if same category is clicked, deselect it; otherwise select the new one
        const newCategoryId = selectedCategoryId === categoryId ? null : categoryId;
        setSelectedCategoryId(newCategoryId);
        onCategoryChange(newCategoryId);
    };

    // Flatten categories and subcategories for filtering
    const allCategories = categories.flatMap(cat => [cat, ...(cat.subcategories || [])]);
    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <div className="w-72 bg-white border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Filter</h2>
                {(selectedCategoryId !== null || selectedSizes.size > 0 || selectedColors.size > 0) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedCategoryId(null);
                            setSelectedSizes(new Set());
                            setSelectedColors(new Set());
                            setPriceRange([0, 100000]);
                            onCategoryChange(null);
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
                            <div className="space-y-2">
                                {filteredCategories.map((cat) => (
                                    <div key={cat.categoryId} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`cat-${cat.categoryId}`}
                                            checked={selectedCategoryId === cat.categoryId}
                                            onCheckedChange={() => toggleCategory(cat.categoryId)}
                                        />
                                        <label
                                            htmlFor={`cat-${cat.categoryId}`}
                                            className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                                            onClick={() => toggleCategory(cat.categoryId)}
                                        >
                                            <span className="text-gray-700">{cat.name}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
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
