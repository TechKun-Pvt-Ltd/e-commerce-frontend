"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VariationUpdationPayload } from "@/types/domains/variation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import { z } from "zod";

const variationSchema = z.object({
    name: z.string().nonempty("Variation name is required."),
    variationOptions: z.array(z.object({
        id: z.number().optional(),
        key: z.number(),
        name: z.string().nonempty("Variation option name is required.")
    })).min(1, "There must be at least one variation option.")
});

const defaultFieldValues = {
    name: "",
    variationOptions: [{
        key: 0,
        name: ""
    }]
};

type FieldValues = z.infer<typeof variationSchema>;

export default function VariationForm({
    variation,
    loading,
    onSubmit
}: {
    variation: VariationUpdationPayload,
    loading: boolean,
    onSubmit: (data: VariationUpdationPayload) => void
} | {
    variation?: undefined,
    loading: boolean,
    onSubmit: (data: FieldValues) => void
}) {
    const firstRender = useRef(true);
    const defaultValues = useMemo(() => variation ? {
        name: variation.name,
        variationOptions: variation.variationOptions.map((opt, i) => ({
            id: opt.variationOptionId,
            key: i,
            name: opt.name
        }))
    }: defaultFieldValues, [variation]);

    const variationForm = useForm<FieldValues>({
        resolver: zodResolver(variationSchema),
        defaultValues
    });

    useEffect(() => {
        if (!firstRender.current)
            return variationForm.reset(defaultValues);

        firstRender.current = false;
    }, [defaultValues]);

    const renderVariationOptionField = useCallback(({ field }) => (
        <FormItem className="w-full">
            <FormControl>
                <Input placeholder="Enter variation option name"
                    {...field}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `variationOptions.${number}.name`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    return <Form {...variationForm}>
        <form className="space-y-6" onSubmit={variationForm.handleSubmit(data => {
            if (variation)
                onSubmit({
                    name: data.name,
                    variationOptions: data.variationOptions.map(opt => ({
                        variationOptionId: opt.id,
                        name: opt.name
                    }))
                });
            else
                onSubmit(data);
        })}>
            <div className="space-y-4">
                <FormField
                    control={variationForm.control}
                    name="name"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Variation Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter variation name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={variationForm.control}
                    name="variationOptions"
                    disabled={loading}
                    render={({ field }) => {
                        return <FormItem>
                            <FormLabel>Variation Options</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div className="space-y-2 border rounded-md h-64 p-2.5 overflow-y-auto thin-scrollbar">
                                        {field.value.map((opt, i) => <div key={opt.key} className="flex gap-2">
                                            <FormField
                                                control={variationForm.control}
                                                name={`variationOptions.${i}.name`}
                                                disabled={field.disabled}
                                                render={renderVariationOptionField}
                                            />
                                            {field.value.length === 1 ?
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="h-min">
                                                            <Button variant="outline" disabled>
                                                                <Minus />
                                                            </Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>At least one option must be there</p>
                                                    </TooltipContent>
                                                </Tooltip> :
                                                <Button variant="outline"
                                                    type="button"
                                                    disabled={field.disabled || field.value.length === 1}
                                                    onClick={() => {
                                                        const currentValue = variationForm.getValues("variationOptions");
                                                        currentValue.splice(i, 1);
                                                        field.onChange([...currentValue]);
                                                    }}
                                                >
                                                    <Minus />
                                                </Button>
                                            }
                                        </div>)}
                                    </div>
                                    <FormMessage />
                                    <Button variant="outline"
                                        type="button"
                                        disabled={field.disabled}
                                        className="w-full justify-start gap-1"
                                        onClick={() => {
                                            const currentValue = variationForm.getValues("variationOptions");
                                            const key = currentValue.length ? currentValue[currentValue.length - 1]?.key + 1 : 1;
                                            field.onChange([...currentValue, { key, name: "" }]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                        <div className="font-medium text-sm text-gray-600">Add Variation</div>
                                    </Button>
                                </div>
                            </FormControl>
                        </FormItem>
                    }}
                />
            </div>
            <Button disabled={loading || !variationForm.formState.isDirty}
                variant="default"
                type="submit" size="sm"
                className="w-full"
            >
                {loading && <Spinner />}
                Save
            </Button>
        </form>
    </Form>
};
