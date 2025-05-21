// /app/admin/categories/page.tsx
'use client';

import React, { useState } from "react";
import CategoryTreeNode from "./components/CategoryTreeNode";
import { CategoryDetails, CategoryDTO, CategoryTree } from "@/types/domains/category";
import AddCategoryDialog from "./components/AddCategoryDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
import EditCategoryForm from "./components/EditCategoryForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCategories } from "@/store/slices/categorySlice";
import CategoryTreeSkeleton from "./components/CategoryTreeSkeleton";
import useDataFetch from "@/hooks/use-data-fetch";
import * as categoryServices from "@/services/category";
import Spinner from "@/components/ui/spinner";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

type CategoryData = React.ComponentProps<typeof EditCategoryForm>["category"] & {};

const categoryDetailsMap = new Map<number, Omit<CategoryData, "parentCategory"> & { parentCategoryId?: number }>();

const unionSelector = createSelector(
    [
        (state: RootState) => state.categories,
        (state: RootState) => state.variations,
        (state: RootState) => state.attributes
    ],
    (categories, variations, attributes) => ({
        categories: categories.items,
        variations: variations.items,
        attributes: attributes.items,
        loading: categories.loading || variations.loading || attributes.loading,
        error: categories.error || variations.error || attributes.error
    })
);

export default function AdminCategoryPage() {
    const [addDialog, setAddDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [targetCategory, setTargetCategory] = useState<CategoryTree | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
    const createCategory = useDataFetch(categoryServices.createCategory, {
        onResponseReceived(res) {
            categoryDetailsMap.set(res.categoryId, {
                categoryId: res.categoryId,
                name: res.name,
                parentCategoryId: res.parentCategory?.categoryId,
                variationIds: res.variations.map(v => v.variationId),
                attributeIds: res.attributes.map(a => a.attributeId),
            });
            dispatch(updateCategories(
                addCategoryNode(categories, targetCategory?.path || "", {
                    categoryId: res.categoryId,
                    name: res.name,
                    subcategories: []
                })
            ));

            setTargetCategory(null);
            setAddDialog(false);
        },
    });
    const updateCategory = useDataFetch(categoryServices.updateCategory, {
        onResponseReceived(res) {
            if (!selectedCategory)
                return;

            const node = findCategoryByParents(categories, selectedCategory);
            if (!node)
                return;

            node.name = res.name;
            categoryDetailsMap.set(node.categoryId, {
                categoryId: selectedCategory.categoryId,
                name: res.name,
                parentCategoryId: res.parentCategory?.categoryId,
                variationIds: res.variations.map(v => v.variationId),
                attributeIds: res.attributes.map(a => a.attributeId),
            });
            dispatch(updateCategories([...categories]));
            setSelectedCategory(null);
        },
    });
    const getCategory = useDataFetch(categoryServices.getCategoryById, {
        onResponseReceived(res) {
            let current: CategoryDetails | undefined = res;
            while (current) {
                if (!categoryDetailsMap.has(current.categoryId))
                    categoryDetailsMap.set(current.categoryId, {
                        categoryId: current.categoryId,
                        name: current.name,
                        parentCategoryId: current.parentCategory?.categoryId,
                        variationIds: current.variations.map(v => v.variationId),
                        attributeIds: current.attributes.map(a => a.attributeId),
                    });
                current = current.parentCategory;
            }

            setSelectedCategory(generateFormInput(res.categoryId));
        },
    });
    const deleteCategory = useDataFetch(categoryServices.deleteCategory, {
        onResponseReceived() {
            dispatch(updateCategories(removeCategoryByPath(categories, targetCategory!.path)));

            setTargetCategory(null);
            setDeleteDialog(false);
        },
    });

    const dispatch = useAppDispatch();
    const {
        categories, variations, attributes,
        loading, error
    } = useAppSelector(unionSelector);

    return (<>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <div className="flex-1 flex gap-4">
                <div className="flex-[7] min-w-0">
                    {loading ?
                        <CategoryTreeSkeleton />:
                        (!error && categories.length) && categories.map(cat => (
                            <CategoryTreeNode
                                key={cat.categoryId}
                                node={cat}
                                onSelectCategory={id => {
                                    if (categoryDetailsMap.has(id))
                                        setSelectedCategory(generateFormInput(id));
                                    else
                                        getCategory.request(id);
                                }}
                                onAddSubcategory={node => {
                                    setTargetCategory(node);
                                    setAddDialog(true);
                                }}
                                onDeleteCategory={node => {
                                    setTargetCategory(node);
                                    setDeleteDialog(true);
                                }}
                            />
                        ))
                    }
                    <div className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                        onClick={() => {
                            setAddDialog(true);
                            setSelectedCategory(null);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        <div className="font-medium text-base">Add Category</div>
                    </div>
                </div>
                <div className="relative flex-[5] min-w-0 bg-card text-card-foreground rounded-md border p-6">
                    {selectedCategory || getCategory.isLoading ?
                        <EditCategoryForm loading={updateCategory.isLoading}
                            category={selectedCategory}
                            variations={variations}
                            attributes={attributes}
                            onSubmit={data => updateCategory.request(data.categoryId, data)}
                        />:
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                            <Folder className="w-8 h-8" />
                            <div className="text-lg text-center">Select a Category</div>
                        </div>
                    }
                    {getCategory.isLoading && (
                        <div className="bg-white/50 absolute top-0 left-0 w-full h-full flex justify-center items-center">
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <AddCategoryDialog
            variations={variations}
            attributes={attributes}
            loading={createCategory.isLoading}
            open={addDialog}
            onOpenChange={setAddDialog}
            onAdd={data => {
                const payload: CategoryDTO = { ...data };
                if (targetCategory)
                    payload.parentCategoryId = targetCategory.categoryId;

                createCategory.request(payload);
            }}
        />

        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove Category</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to delete this category? It will delete all of its subcategories too.</div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setDeleteDialog(false)}>No</Button>
                    <Button onClick={() => {
                        if (!targetCategory)
                            return;

                        deleteCategory.request(targetCategory.categoryId);
                    }}>
                        {deleteCategory.isLoading && <Spinner />}
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>);
};

function addCategoryNode(tree: CategoryTree[], parentPath: string, newNode: Omit<CategoryTree, "path">): CategoryTree[] {
    if (!parentPath)
        return [...tree, {
            ...newNode,
            path: `${tree.length}`
        }];

    const parent = findCategoryByPath(tree, parentPath);
    if (!parent)
        return tree;

    const newPath = `${parentPath}.${parent.subcategories.length}`;
    parent.subcategories = [
        ...parent.subcategories,
        { ...newNode, path: newPath }
    ];
    return [...tree];
};

function removeCategoryByPath(tree: CategoryTree[], targetPath: string): CategoryTree[] {
    findCategoryByPath(tree, targetPath, (list, index) => list.splice(index, 1));
    return [...tree];
};

function findCategoryByParents(tree: CategoryTree[], categoryData: CategoryData): CategoryTree | null {
    let current: CategoryData | undefined = categoryData;
    const stack = [current.categoryId];
    while (current?.parentCategory) {
        stack.push(current.parentCategory.categoryId);
        current = current.parentCategory;
    }

    while (true) {
        const id = stack.pop();
        const node = tree.find(cat => cat.categoryId === id);
        if (!node)
            return null;

        if (stack.length)
            tree = node.subcategories;
        else
            return node;
    }
};

function findCategoryByPath(
    tree: CategoryTree[],
    path: string,
    action: (list: CategoryTree[], targetIndex: number, targetNode: CategoryTree) => void = () => {}
): CategoryTree | null {
    const regexp = /\d+(?:\.\d+)*/;
    if (!regexp.test(path))
        return null;

    const pathParts = path.split(".");
    if (pathParts.length === 0)
        return null;

    let level = 0;
    let i = 0;
    while (i < tree.length) {
        const node = tree[i];
        if (!regexp.test(node.path)) {
            i++;
            continue;
        }

        const nodePathParts = node.path.split(".");
        if (nodePathParts[nodePathParts.length - 1] !== pathParts[level]) {
            i++;
            continue;
        }

        if (level === pathParts.length - 1) {
            action(tree, i, node);
            return node;
        } else {
            level++;
            i = 0;
            tree = node.subcategories;
            continue;
        }
    }

    return null;
};

function generateFormInput(categoryId: number) {
    const details = categoryDetailsMap.get(categoryId)!;
    let parentId: number | undefined = details.parentCategoryId;
    const formData: CategoryData = { ...details };
    let formDataCursor: CategoryData | undefined = formData;
    while (parentId && formDataCursor) {
        const parent = categoryDetailsMap.get(parentId);
        formDataCursor.parentCategory = parent;
        parentId = parent?.parentCategoryId;
        formDataCursor = formDataCursor.parentCategory;
    }

    return formData;
}