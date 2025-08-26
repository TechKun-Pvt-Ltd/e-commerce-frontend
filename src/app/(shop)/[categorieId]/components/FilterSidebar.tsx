"use client"
import React, { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const brands = [
    { name: "Nike", count: 156 },
    { name: "Adidas", count: 89 },
    { name: "Apple", count: 34 },
    { name: "New Balance", count: 67 },
    { name: "Puma", count: 123 },
    { name: "Uniqlo", count: 45 },
];

const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

const FilterSidebar = () => {
    const [priceRange, setPriceRange] = useState([2900, 100000]);
    const [brandSearch, setBrandSearch] = useState("");
    const [selectedBrands, setSelectedBrands] = useState(new Set(["Nike"])); // Nike selected by default
    const [selectedSizes, setSelectedSizes] = useState(new Set());
    const [selectedColors, setSelectedColors] = useState(new Set());
    const [openSections, setOpenSections] = useState({
        brand: true,
        price: true,
        size: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleBrand = (brandName: string) => {
        const newSelected = new Set(selectedBrands);
        if (newSelected.has(brandName)) {
            newSelected.delete(brandName);
        } else {
            newSelected.add(brandName);
        }
        setSelectedBrands(newSelected);
    };

    const toggleSize = (size: string) => {
        const newSelected = new Set(selectedSizes);
        if (newSelected.has(size)) {
            newSelected.delete(size);
        } else {
            newSelected.add(size);
        }
        setSelectedSizes(newSelected);
    };

    const toggleColor = (color: string) => {
        const newSelected = new Set(selectedColors);
        if (newSelected.has(color)) {
            newSelected.delete(color);
        } else {
            newSelected.add(color);
        }
        setSelectedColors(newSelected);
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );

    return (
        <div className="w-72 bg-white border-r border-gray-200">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Filter</h2>
                {(selectedBrands.size > 0 || selectedSizes.size > 0 || selectedColors.size > 0) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedBrands(new Set());
                            setSelectedSizes(new Set());
                            setSelectedColors(new Set());
                            setPriceRange([2900, 100000]);
                        }}
                    >
                        Clear
                    </Button>
                )}
            </div>

            <div className="p-4 space-y-6">
                {(selectedBrands.size > 0 || selectedSizes.size > 0 || selectedColors.size > 0) && (
                    <div className="pb-4 border-b border-gray-200">
                        {/* Active filters display */}
                        <div className="mt-3 space-y-2">
                            {selectedBrands.size > 0 && (
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Brands: </span>
                                    {Array.from(selectedBrands).join(', ')}
                                </div>
                            )}
                            {selectedSizes.size > 0 && (
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Sizes: </span>
                                    {Array.from(selectedSizes).join(', ')}
                                </div>
                            )}
                            {selectedColors.size > 0 && (
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Colors: </span>
                                    {Array.from(selectedColors).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Brand Filter */}
                <div>
                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => toggleSection('brand')}
                    >
                        <h3 className="font-medium text-gray-900">Brand</h3>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.brand ? 'rotate-180' : ''}`} />
                    </div>

                    {openSections.brand && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search brand"
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                    className="pl-10 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredBrands.map((brand) => (
                                    <div key={brand.name} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={brand.name}
                                            checked={selectedBrands.has(brand.name)}
                                            onCheckedChange={() => toggleBrand(brand.name)}
                                        />
                                        <div className="flex items-center w-6 h-6">
                                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-600">
                                                    {brand.name.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <label
                                            htmlFor={brand.name}
                                            className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                                            onClick={() => toggleBrand(brand.name)}
                                        >
                                            <span className="text-gray-700">{brand.name}</span>
                                            <span className="text-gray-400 text-xs">({brand.count})</span>
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
                                    max={300000}
                                    min={2900}
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
                                    placeholder="2900"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 2900, priceRange[1]])}
                                    className="text-center text-sm"
                                />
                                <Input
                                    type="number"
                                    placeholder="300,000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 300000])}
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