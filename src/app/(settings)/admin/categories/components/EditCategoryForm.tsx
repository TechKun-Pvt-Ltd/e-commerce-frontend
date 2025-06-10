"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Variation } from "@/types/domains/variation";
import { Attribute } from "@/types/domains/attribute";
import Spinner from "@/components/ui/spinner";
import FormMultiSelect from "./FormMultiSelect";
import { extractConsonants } from "@/lib/utils";

interface CategoryData {
    categoryId: number;
    name: string;
    code: string;
    parentCategory?: CategoryData;
    variationIds: number[];
    attributeIds: number[];
};

const optionStates = ["present", "absent", "present_in_parent"] as const;
type OptionState = typeof optionStates[number];

const recordSchema = z.record(z.string().transform(k => Number(k)), z.enum(optionStates));

const categorySchema = z.object({
    name: z.string().trim().nonempty("Category name is required."),
    code: z.string().trim().nonempty("Category code is required."),
    variations: recordSchema,
    attributes: recordSchema
});

const getDefaultValue = (category: CategoryData | null, variations: Variation[], attributes: Attribute[]) => {
    const variationItemStates = variations
        .reduce((acc, v) => {
            acc[v.variationId] = "absent";
            return acc;
        }, {} as Record<number, OptionState>);

    const attributeItemStates = attributes
        .reduce((acc, a) => {
            acc[a.attributeId] = "absent";
            return acc;
        }, {} as Record<number, OptionState>);

    if (category) {
        category.variationIds.forEach(v => {
            variationItemStates[v] = "present";
        });
        category.attributeIds.forEach(a => {
            attributeItemStates[a] = "present";
        });
    }

    let current = category?.parentCategory;
    while (current) {
        current.variationIds.forEach(v => {
            variationItemStates[v] = "present_in_parent";
        });
        current.attributeIds.forEach(a => {
            attributeItemStates[a] = "present_in_parent";
        });
        current = current.parentCategory;
    }

    return {
        name: category?.name || "",
        code: category?.code || "",
        variations: variationItemStates,
        attributes: attributeItemStates
    }
};

export default function EditCategoryForm({
    category,
    loading = false,
    variations,
    attributes,
    onSubmit,
    manageVariations,
    manageAttributes
}: {
    category: CategoryData | null;
    loading?: boolean;
    variations: Variation[];
    attributes: Attribute[];
    onSubmit: (data: Partial<Omit<CategoryData, 'categoryId' | 'parentCategory'>>) => void
    manageVariations: () => void;
    manageAttributes: () => void;
}) {
    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            code: "",
            variations: {},
            attributes: {}
        }
    });

    useEffect(() => {
        form.reset(getDefaultValue(category, variations, attributes));
    }, [category, variations, attributes]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(data => {
                const submitData: Parameters<typeof onSubmit>[0] = {};
                const dirtyFields = form.formState.dirtyFields;
                if (dirtyFields.name)
                    submitData.name = data.name;
                if (dirtyFields.code)
                    submitData.code = data.code;
                if (dirtyFields.variations)
                    submitData.variationIds = Object.entries(data.variations)
                       .filter(([, v]) => v === "present")
                       .map(([k]) => Number(k));
                if (dirtyFields.attributes)
                    submitData.attributeIds = Object.entries(data.attributes)
                       .filter(([, v]) => v === "present")
                      .map(([k]) => Number(k));

                onSubmit(submitData);
            })}>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter category name"
                                        {...field}
                                        onChange={e => {
                                            const newValue = e.target.value;
                                            field.onChange(newValue);
                                            form.setValue("code", extractConsonants(newValue).toUpperCase(), { shouldDirty: true });
                                        }}
                                        onBlur={() => field.onChange(field.value.trim())}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter category code"
                                        {...field}
                                        onBlur={() => field.onChange(field.value.trim())}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="variations"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Variations</FormLabel>
                                <FormControl>
                                    <FormMultiSelect
                                        {...field}
                                        items={variations.map(v => ({ id: v.variationId, name: v.name }))}
                                        onFooterClick={manageVariations}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="attributes"
                        disabled={loading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attributes</FormLabel>
                                <FormControl>
                                    <FormMultiSelect
                                        {...field}
                                        items={attributes.map(a => ({ id: a.attributeId, name: a.name }))}
                                        onFooterClick={manageAttributes}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button disabled={loading || !form.formState.isDirty}
                    variant="default"
                    type="submit" size="sm"
                    className="w-full"
                >
                    {loading && <Spinner />}
                    Save
                </Button>
            </form>
        </Form>
    );
};
