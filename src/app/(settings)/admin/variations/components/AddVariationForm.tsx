"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Variation } from "@/types/domains/variation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import { z } from "zod";

const variationSchema = z.object({
    name: z.string().nonempty("Variation name is required."),
    variationOptions: z.array(z.object({
        id: z.number().optional(),
        name: z.string().nonempty("Variation option name is required.")
    })).min(1)
});

type FieldValues = z.infer<typeof variationSchema>;

export default function AddVariationForm({
    variation,
    loading,
    onSubmit
}: {
    variation: Variation,
    loading: boolean,
    onSubmit: (data: Variation) => void
} | {
    variation?: undefined,
    loading: boolean,
    onSubmit: (data: FieldValues) => void
}) {
    const variationForm = useForm<FieldValues>({
        mode: "onSubmit",
        resolver: zodResolver(variationSchema),
        defaultValues: {
            name: "",
            variationOptions: [{
                name: ""
            }]
        }
    });

    useEffect(() => {
        if (!variation) return;

        variationForm.reset({
            name: variation.name,
            variationOptions: variation.variationOptions.map(opt => ({
                id: opt.variationOptionId,
                name: opt.name
            }))
        });
    }, [variation]);

    const renderVariationOptionField = useCallback(({ field: optionNameField }) => (
        <FormItem className="w-full">
            <FormControl>
                <Input placeholder="Enter variation option name"
                    {...optionNameField}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    ), []) as (({ field, fieldState, formState, }: {
        field: ControllerRenderProps<FieldValues, `variationOptions.${number}.name`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    return <Form {...variationForm}>
        <form className="space-y-6" onSubmit={variationForm.handleSubmit(data => {
            if (variation)
                onSubmit({
                    variationId: variation.variationId,
                    name: data.name,
                    variationOptions: data.variationOptions.map(opt => ({
                        variationOptionId: opt.id!,
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
                                    <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar">
                                        {field.value.map((_, i) => <div key={i} className="flex gap-1">
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
                                                            <Button variant="ghost" disabled>
                                                                <Minus />
                                                            </Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>At least one option must be there</p>
                                                    </TooltipContent>
                                                </Tooltip> :
                                                <Button variant="ghost"
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
                                    <Button variant="ghost"
                                        disabled={field.disabled}
                                        className="w-full justify-start gap-1"
                                        onClick={() => field.onChange([...variationForm.getValues("variationOptions"), { name: "" }])}
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
            <Button
                variant="default"
                type="submit" size="sm"
                className="w-full"
            >
                {loading && <Spinner />}
                Add
            </Button>
        </form>
    </Form>
};
