"use client";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CategoryDetails, CategoryTree } from "@/types/domains/category";
import { Variation, VariationOption } from "@/types/domains/variation";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Attribute, AttributeType } from "@/types/domains/attribute";
import { extractConsonants } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { RequestFunction } from "@/hooks/use-data-fetch";
import CategoriesDropdown from "@/app/components/CategoriesDropdown";

const productFormSchema = z.object({
    title: z.string().nonempty("Title is required."),
    code: z.string().nonempty("Code is required."),
    description: z.string().nonempty("Description is required."),
    starred: z.boolean(),
    categoryId: z.number().gt(0, "Category is required."),
    variants: z.array(
        z.object({
            productVariantId: z.number().optional(),
            sku: z.string().nonempty("SKU is required."),
            quantityInStock: z.number(),
            price: z.number(),
            disabled: z.boolean(),
            variationOptionIds: z.array(z.number()).min(1, "At least one variation option is required.")
        })
    ),
    attributes: z.array(
        z.object({
            attributeId: z.number(),
            value: z.string()
        })
    )
}).refine(data => data.variants.length > 0, { message: "At least one variant is required." });

type ProductFormData = z.infer<typeof productFormSchema>;

interface CategoryData {
    categoryId: number;
    name: string;
    code: string;
    parentCategory: CategoryData | undefined;
    variationIds: number[];
    attributeIds: number[];
}

const categoryDetailsMap = new Map<number, CategoryData>();

export default function ProductForm({ categories, variations, attributes, loading, categoriesLoading, fetchCategoryDetails, onSubmit }: {
    categories: CategoryTree[];
    variations: Variation[];
    attributes: Attribute[];
    loading: boolean;
    categoriesLoading: boolean;
    fetchCategoryDetails: RequestFunction<[categoryId: number], CategoryDetails>;
    onSubmit: (data: ProductFormData) => void;
}) {
    const productForm = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: "",
            code: "",
            description: "",
            starred: false,
            variants: [],
            attributes: []
        }
    });
    const indexedVariations = useMemo(() => variations.reduce((acc, variation) => {
        acc[variation.variationId] = variation;
        return acc;   
    }, {} as Record<number, typeof variations[number]>), [variations]);
    const indexedVariationOptions = useMemo(() => variations.reduce((acc, variation) => {
        variation.variationOptions.forEach(opt =>
            acc[opt.variationOptionId] = opt
        );
        return acc;
    }, {} as Record<number, VariationOption>), [variations]);
    const indexedAttributes = useMemo(() => attributes.reduce((acc, attribute) => {
        acc[attribute.attributeId] = attribute;
        return acc;
    }, {} as Record<number, typeof attributes[number]>), [attributes]);

    const selectedCategoryDetails = categoryDetailsMap.get(productForm.watch("categoryId"));
    const categoryVariationIds = useMemo(() => {
        const categoryVariationIdSet: Set<number> = new Set();
        let current = selectedCategoryDetails;
        while (current) {
            current.variationIds.forEach(vId =>
                categoryVariationIdSet.add(vId)
            );
            current = current.parentCategory;
        }
        return Array.from(categoryVariationIdSet).sort();
    }, [selectedCategoryDetails]);
    const productVariants = productForm.watch("variants");
    const productAttributes = productForm.watch("attributes");

    const updateSkus = useCallback((productCode: string) => (
        productVariants.forEach((v, i) => (
            productForm.setValue(
                `variants.${i}.sku`,
                `${selectedCategoryDetails?.code || ''}-${productCode}-${v.variationOptionIds.map(optId => indexedVariationOptions[optId].code).join('-')}`
            )
        ))
    ), [productVariants, productForm, selectedCategoryDetails, indexedVariationOptions]);

    const updateVariantsAndAttributes = useCallback((categoryDetails: CategoryData) => {
        const variants = getVariantsFromVariations(
            getCategoryVariations(categoryDetails).map(vId => indexedVariations[vId])
        );
        variants.forEach(v => v.sku = `${categoryDetails.code}-${productForm.watch("code")}-${v.variationOptionIds.map(optId => indexedVariationOptions[optId].code).join("-")}`)
        productForm.setValue('variants', variants);
        productForm.setValue('attributes', getCategoryAttributes(categoryDetails)
            .map(aId => ({
                attributeId: aId, value: ""
            }))
        );
    }, [productForm, indexedVariations, indexedVariationOptions]);

    return <Form {...productForm}>
        <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                    <FormField disabled={loading}
                        control={productForm.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Product Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product title"
                                        {...field}
                                        onChange={e => {
                                            const newValue = e.target.value;
                                            field.onChange(newValue);
                                            productForm.setValue("code", extractConsonants(newValue).toUpperCase(), { shouldDirty: true });
                                        }}
                                        onBlur={e => {
                                            field.onBlur();
                                            const trimmedValue = e.target.value.trim();
                                            field.onChange(trimmedValue);
                                            updateSkus(extractConsonants(trimmedValue).toUpperCase());
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField disabled={loading}
                        control={productForm.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Product Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product code" {...field}
                                        onBlur={e => {
                                            field.onBlur();
                                            const formatted = e.target.value.trim().toUpperCase().replace(/\s+/g, '-');
                                            field.onChange(formatted);
                                            updateSkus(formatted);
                                        }} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField disabled={loading}
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter product description"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-4">
                    <FormField
                        control={productForm.control}
                        name="categoryId"
                        disabled={loading || categoriesLoading}
                        render={({ field }) => {
                            return <FormItem className="min-w-xs">
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <CategoriesDropdown
                                        categories={categories}
                                        disabled={field.disabled}
                                        selectedCategoryNode={categoryDetailsMap.get(field.value)}
                                        onSelect={node => {
                                            if (categoryDetailsMap.has(node.categoryId)) {
                                                field.onChange(node.categoryId);
                                                updateVariantsAndAttributes(categoryDetailsMap.get(node.categoryId)!);
                                            } else {
                                                fetchCategoryDetails(node.categoryId).onSuccess(res => {
                                                    field.onChange(node.categoryId);
                                                    updateVariantsAndAttributes(registerCategoryDetails(res));
                                                });
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>;
                        }}
                    />

                    <FormField disabled={loading}
                        control={productForm.control}
                        name="starred"
                        render={({ field }) => (
                            <FormItem className="md:flex-1 gap-3">
                                <FormLabel>Starred</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <label className="text-sm text-muted-foreground">Check if you want this product to appear on top.</label>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label>Product Variants</Label>
                    {categoryVariationIds.length ? <div
                        data-slot="table-container"
                        className="relative w-full overflow-x-auto"
                    >
                        <Table className="border-separate border-spacing-0 border rounded-md overflow-hidden">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="border-b">Sr. No.</TableHead>
                                    {categoryVariationIds.map(vId => (
                                        <TableHead key={vId} className="border-b w-[15%]">
                                            {indexedVariations[vId].name}
                                        </TableHead>
                                    ))}
                                    <TableHead className="border-b min-w-36 w-[20%]">SKU</TableHead>
                                    <TableHead className="border-b min-w-24 w-[15%]">Price</TableHead>
                                    <TableHead className="border-b min-w-24 w-[15%]">Stock</TableHead>
                                    <TableHead className="border-b">Disabled</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productVariants.map((variant, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        {variant.variationOptionIds.map(optId => (
                                            <TableCell key={optId}>
                                                {indexedVariationOptions[optId].name}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <FormField disabled={loading}
                                                control={productForm.control}
                                                name={`variants.${index}.sku`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField disabled={loading}
                                                control={productForm.control}
                                                name={`variants.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField disabled={loading}
                                                control={productForm.control}
                                                name={`variants.${index}.quantityInStock`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField disabled={loading}
                                                control={productForm.control}
                                                name={`variants.${index}.disabled`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div> :
                    <div className="text-sm text-muted-foreground">Select a category to get variants.</div>}
                </div>

                {productAttributes.map((attr, index) => (
                    <FormField disabled={loading}
                        key={attr.attributeId}
                        control={productForm.control}
                        name={`attributes.${index}.value`}
                        render={({ field }) => {
                            const attribute = indexedAttributes[attr.attributeId];

                            return <FormItem className="max-w-xs">
                                <FormLabel>{attribute.name}</FormLabel>
                                <FormControl>
                                    {attribute.type === AttributeType.CUSTOM ? <Input className="w-full" {...field} /> :
                                        <Select disabled={field.disabled}
                                            value={field.value}
                                            onValueChange={value => field.onChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a value" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attribute.allowedValues.map(option => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        }}
                    />
                ))}
            </div>

            {productForm.formState.errors.root && (
                <div className="text-sm font-medium text-destructive">
                    {productForm.formState.errors.root.message}
                </div>
            )}

            <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                Create Product
            </Button>
        </form>
    </Form>
};

function registerCategoryDetails(categoryDetails: CategoryDetails): CategoryData {
    const { categoryId } = categoryDetails;
    if (categoryDetailsMap.has(categoryId))
        return categoryDetailsMap.get(categoryId)!;

    const details = {
        categoryId: categoryId,
        name: categoryDetails.name,
        code: categoryDetails.code,
        parentCategory: categoryDetails.parentCategory ?
            registerCategoryDetails(categoryDetails.parentCategory) :
            undefined,
        variationIds: categoryDetails.variations.map(v => v.variationId),
        attributeIds: categoryDetails.attributes.map(a => a.attributeId),
    };
    categoryDetailsMap.set(categoryId, details);
    return details;
};

function getCategoryVariations(categoryDetails: CategoryData): number[] {
    const categoryVariationIdSet: Set<number> = new Set();
    let current: CategoryData | undefined = categoryDetails;
    while (current) {
        current.variationIds.forEach(vId => {
            if (categoryVariationIdSet.has(vId))
                return;
            categoryVariationIdSet.add(vId);
        });
        current = current.parentCategory;
    }
    return Array.from(categoryVariationIdSet).sort();
};

function getCategoryAttributes(categoryDetails: CategoryData): number[] {
    const categoryAttributeIdSet: Set<number> = new Set();
    let current: CategoryData | undefined = categoryDetails;
    while (current) {
        current.attributeIds.forEach(vId => {
            if (categoryAttributeIdSet.has(vId))
                return;
            categoryAttributeIdSet.add(vId);
        });
        current = current.parentCategory;
    }
    return Array.from(categoryAttributeIdSet);
};

function getVariantsFromVariations(variations: Variation[]): ProductFormData["variants"] {
    if (!variations.length)
        return [];

    const variation = variations[0];
    const options = variation.variationOptions;
    let variantProperties = options.map(o => [o.variationOptionId]);
    for (let i = 1; i < variations.length; i++) {
        const varI = variations[i];
        const varIOptions = varI.variationOptions;
        variantProperties = variantProperties.flatMap(variant => varIOptions.map(o => [...variant, o.variationOptionId]));
    }

    return variantProperties.map(options => ({
        sku: "",
        price: 0,
        quantityInStock: 0,
        disabled: false,
        variationOptionIds: options
    }))
}
