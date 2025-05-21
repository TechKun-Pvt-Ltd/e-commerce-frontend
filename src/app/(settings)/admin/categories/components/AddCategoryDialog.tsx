// /components/admin/AddCategoryDialog.tsx
'use client';

import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelect, MultiSelectContent, MultiSelectFooter, MultiSelectMenu, MultiSelectMenuItem, MultiSelectSearchInput, MultiSelectTrigger } from "@/components/ui/multiselect";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Variation } from "@/types/domains/variation";
import { Attribute } from "@/types/domains/attribute";
import { ChevronsUpDown, Settings } from "lucide-react";
import Spinner from "@/components/ui/spinner";

interface CategoryData {
    name: string;
    // parentCategoryId?: number;
    variationIds: number[];
    attributeIds: number[];
};

const recordSchema = z.record(z.string().transform(k => Number(k)), z.boolean());

const categorySchema = z.object({
    name: z.string().nonempty("Category name is required"),
    variations: recordSchema,
    attributes: recordSchema
});

export default function AddCategoryDialog({
    variations, attributes, loading,
    open, onOpenChange, onAdd
}: {
    variations: Variation[];
    attributes: Attribute[];
    loading: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (data: CategoryData) => void;
}) {
    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            variations: {},
            attributes: {}
        }
    });

    const indexedVariations = useMemo(() => variations.reduce((acc, v) => {
        acc[v.variationId] = v;
        return acc;
    }, {} as Record<number, Variation>), [variations]);

    const indexedAttributes = useMemo(() => attributes.reduce((acc, v) => {
        acc[v.attributeId] = v;
        return acc;
    }, {} as Record<number, Attribute>), [attributes]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(data => {
                        onAdd({
                            name: data.name,
                            variationIds: Object.entries(data.variations)
                                .filter(([, v]) => v)
                                .map(([k]) => Number(k)),
                            attributeIds: Object.entries(data.attributes)
                                .filter(([, v]) => v)
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
                            render={({ field }) => {
                                const selectedEntries = Object.entries(field.value).filter(([, v]) => v);

                                return <FormItem>
                                    <FormLabel>Variations</FormLabel>
                                    <FormControl>
                                        <MultiSelect>
                                            <MultiSelectTrigger asChild>
                                                <Button disabled={field.disabled}
                                                    variant="outline"
                                                    className={`min-w-0 w-full justify-between ${selectedEntries.length ? "text-gray-900": "text-gray-600"}`}
                                                >
                                                    <span className="font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">{selectedEntries.length ?
                                                        selectedEntries
                                                            .map(([k]) => indexedVariations[Number(k)]?.name)
                                                            .filter(v => v).join(", ") :
                                                        "Select variations"
                                                    }</span>
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </MultiSelectTrigger>
                                            <MultiSelectContent>
                                                <MultiSelectSearchInput placeholder="Search variations" />
                                                <MultiSelectMenu>
                                                    {variations.map(v => {
                                                        const checked = field.value[v.variationId] ?? false;
                                                        const toggle = () => field.onChange({
                                                            ...field.value,
                                                            [v.variationId]: !checked
                                                        });

                                                        return <MultiSelectMenuItem key={v.variationId}
                                                            checked={checked} toggle={toggle}
                                                            label={v.name}
                                                        />;
                                                    })}
                                                </MultiSelectMenu>
                                                <MultiSelectFooter>
                                                    <Settings className="w-4 h-4" />
                                                    <span className="text-sm">Manage variations</span>
                                                </MultiSelectFooter>
                                            </MultiSelectContent>
                                        </MultiSelect>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="attributes"
                            disabled={loading}
                            render={({ field }) => {
                                const selectedEntries = Object.entries(field.value).filter(([, v]) => v);
                                return <FormItem>
                                    <FormLabel>Attributes</FormLabel>
                                    <FormControl>
                                        <MultiSelect>
                                            <MultiSelectTrigger asChild>
                                                <Button disabled={field.disabled}
                                                    variant="outline"
                                                    role="combobox"
                                                    className={`min-w-0 w-full justify-between ${selectedEntries.length ? "text-gray-900": "text-gray-600"}`}
                                                >
                                                    <span className="font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">{selectedEntries.length ?
                                                        selectedEntries.map(([k]) => indexedAttributes[Number(k)].name)
                                                            .join(", ") :
                                                        "Select attributes"
                                                    }</span>
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </MultiSelectTrigger>
                                            <MultiSelectContent>
                                                <MultiSelectSearchInput placeholder="Search attributes" />
                                                <MultiSelectMenu>
                                                    {attributes.map(v => {
                                                        const checked = field.value[v.attributeId] ?? false;
                                                        const toggle = () => field.onChange({
                                                            ...field.value,
                                                            [v.attributeId]: !checked
                                                        });

                                                        return <MultiSelectMenuItem key={v.attributeId}
                                                            checked={checked} toggle={toggle}
                                                            label={v.name}
                                                        />;
                                                    })}
                                                </MultiSelectMenu>
                                                <MultiSelectFooter>
                                                    <Settings className="w-4 h-4" />
                                                    <span className="text-sm">Manage attributes</span>
                                                </MultiSelectFooter>
                                            </MultiSelectContent>
                                        </MultiSelect>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }}
                        />
                        <Button disabled={loading}
                            variant="default"
                            type="submit"
                            size="sm"
                        >
                            {loading && <Spinner />}
                            Save
                        </Button>
                    </form>
                </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
