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

interface CategoryData {
    categoryId: number;
    name: string;
    parentCategory?: CategoryData;
    variationIds: number[];
    attributeIds: number[];
};

const optionStates = ["present", "absent", "present_in_parent"] as const;
type OptionState = typeof optionStates[number];

const recordSchema = z.record(z.string().transform(k => Number(k)), z.enum(optionStates));

const categorySchema = z.object({
    name: z.string().nonempty("Category name is required"),
    variations: recordSchema,
    attributes: recordSchema
});

const getDefaultValue = (category: CategoryData | null, variations: Variation[], attributes: Attribute[]) => {
    if (!category)
        return {
            name: "",
            variations: {} as Record<number, OptionState>,
            attributes: {} as Record<number, OptionState>
        };

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


    category.variationIds.forEach(v => {
        variationItemStates[v] = "present";
    }); 
    category.attributeIds.forEach(a => {
        attributeItemStates[a] = "absent";
    });

    let current = category.parentCategory;
    while (current) {
        current.variationIds.forEach(v => {
            if (!variationItemStates[v]) variationItemStates[v] = "present_in_parent";
        });
        current.attributeIds.forEach(a => {
            if (!attributeItemStates[a]) attributeItemStates[a] = "present_in_parent";
        });
        current = current.parentCategory;
    }

    return {
        name: category.name,
        variations: variationItemStates,
        attributes: attributeItemStates
    }
};

export default function EditCategoryForm({
    category,
    loading = false,
    variations,
    attributes,
    onSubmit
}: {
    category: CategoryData | null;
    loading?: boolean;
    variations: Variation[];
    attributes: Attribute[];
    onSubmit: (data: CategoryData) => void
}) {
    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            variations: {},
            attributes: {}
        }
    });

    useEffect(() => {
        form.reset(getDefaultValue(category, variations, attributes));
    }, [category, variations, attributes]);

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(data => {
                onSubmit({
                    ...category!,
                    name: data.name,
                    variationIds: Object.entries(data.variations)
                        .filter(([, v]) => v === "present")
                        .map(([k]) => Number(k)),
                    attributeIds: Object.entries(data.attributes)
                       .filter(([, v]) => v === "present")
                       .map(([k]) => Number(k))
                });
                form.reset();
            })}>
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
                                    items={variations.map(v => ({id: v.variationId, name: v.name}))}
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
                                    items={attributes.map(a => ({id: a.attributeId, name: a.name}))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={loading || !form.formState.isDirty}
                    variant="default"
                    type="submit"
                    size="sm"
                >
                    {loading && <Spinner />}
                    Save
                </Button>
            </form>
        </Form>
    );
};
