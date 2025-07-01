"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CategoryTree } from "@/types/domains/category";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import React from "react";

interface CategoryData {
    categoryId: number;
    name: string;
    code: string;
    parentCategory: CategoryData | undefined;
};

function renderCategoryDropdown(category: CategoryTree, onSelect: (id: number) => void) {
    if (category.subcategories.length === 0)
        return <DropdownMenuItem key={category.path} onClick={() => onSelect(category.categoryId)}>
            {category.name}
        </DropdownMenuItem>;

    return <div className="flex" key={category.path}>
        <DropdownMenuItem className="flex-1" onClick={() => onSelect(category.categoryId)}>
            {category.name}
        </DropdownMenuItem>
        <DropdownMenuSub>
            <DropdownMenuSubTrigger />
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {category.subcategories.map(sub => renderCategoryDropdown(sub, onSelect))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    </div>
};

export default function CategoriesDropdown({ disabled = false, categories, selectedCategoryDetails, onSelect }: {
    disabled?: boolean;
    categories: CategoryTree[];
    selectedCategoryDetails: CategoryData | undefined;
    onSelect: (id: number) => void;
}) {
    const selectedCategory = getParentStack(selectedCategoryDetails);

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button disabled={disabled}
                variant={"outline"}
                className={`border w-full px-3 py-1.5 justify-between ${selectedCategory ? "" : "text-muted-foreground"}`}
                style={{ height: "auto" }}
            >
                {selectedCategory ?
                    <div className="text-left">
                        <div className="mb-1">{selectedCategory.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {selectedCategory.parentStack.map((cat, i) => <React.Fragment key={cat.categoryId}>
                                {cat.name}
                                {i + 1 !== selectedCategory.parentStack.length && <ChevronRight className="size-3" />}
                            </React.Fragment>)}
                        </div>
                    </div> :
                    "Select a category"}
                <ChevronsUpDown className="opacity-50" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            {categories.map(cat => renderCategoryDropdown(cat, id => {
                if (id === selectedCategoryDetails?.categoryId)
                    return;

                onSelect(id);
            }))}
        </DropdownMenuContent>
    </DropdownMenu>
};

function getParentStack(categoryDetails: CategoryData | undefined): {
    name: string;
    parentStack: {
        categoryId: number;
        name: string;
    }[];
} | undefined {
    if (!categoryDetails)
        return undefined;

    let current: CategoryData | undefined = categoryDetails;
    const parentStack: {
        categoryId: number;
        name: string;
    }[] = [];
    while (current) {
        parentStack.splice(0, 0, {
            categoryId: current.categoryId,
            name: current.name
        });
        current = current.parentCategory;
    }
    return {
        name: categoryDetails.name,
        parentStack
    }
};