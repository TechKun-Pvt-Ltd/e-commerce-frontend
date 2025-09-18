"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShippingMethodUpdationPayload } from "@/types/domains/shipping_method";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import { z } from "zod";

const shippingSchema = z.object({
    name: z.string().nonempty("Shipping method name is required."),
    shippingOptions: z.array(
        z.object({
            id: z.number().optional(),
            key: z.number(),
            destination_country: z.string().nonempty("Destination country is required."),
            carrier: z.string().nonempty("Carrier is required."),
            cost_first_item: z.number().min(0, "Cost must be 0 or greater.")
        })
    ).min(1, "There must be at least one shipping option.")
});

const defaultFieldValues = {
    name: "",
    shippingOptions: [{
        key: 0,
        destination_country: "",
        carrier: "",
        cost_first_item: 0
    }]
};

type FieldValues = z.infer<typeof shippingSchema>;

const countries = [
    "US", "CA", "UK", "NZ", "JP", "AU", "IN", "BR", "MX", 
    "DE", "FR", "IT", "ES", "NL", "SE", "NO", "DK", "FI",
    "AE", "SA", "TR", "KR", "SG", "MY", "TH", "VN", "PH",
    "CN", "HK", "TW", "ID", "BD", "PK", "LK", "NP", "AF"
];

const carriers = [
    "DHL Express", "FedEx", "UPS", "Aramex", "BlueDart", 
    "TNT", "DPD", "GLS", "Hermes", "Royal Mail",
    "USPS", "Canada Post", "Australia Post", "India Post"
];

export default function ShippingForm({
    shippingMethod,
    loading,
    onSubmit
}: {
    shippingMethod: ShippingMethodUpdationPayload,
    loading: boolean,
    onSubmit: (data: ShippingMethodUpdationPayload) => void
} | {
    shippingMethod?: undefined,
    loading: boolean,
    onSubmit: (data: FieldValues) => void
}) {
    const firstRender = useRef(true);
    const defaultValues = useMemo(() => shippingMethod ? {
        name: shippingMethod.name,
        shippingOptions: shippingMethod.shippingOptions.map((opt, i) => ({
            id: opt.id,
            key: i,
            destination_country: opt.destination_country,
            carrier: opt.carrier,
            cost_first_item: opt.cost_first_item
        }))
    } : defaultFieldValues, [shippingMethod]);

    const shippingForm = useForm<FieldValues>({
        resolver: zodResolver(shippingSchema),
        defaultValues
    });

    useEffect(() => {
        if (!firstRender.current)
            return shippingForm.reset(defaultValues);

        firstRender.current = false;
    }, [defaultValues]);

    const renderDestinationCountryField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <Select
                    value={field.value}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                                {country}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormControl>
            <FormMessage className="w-full whitespace-normal" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `shippingOptions.${number}.destination_country`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    const renderCarrierField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <Select
                    value={field.value}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                        {carriers.map((carrier) => (
                            <SelectItem key={carrier} value={carrier}>
                                {carrier}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormControl>
            <FormMessage className="w-full whitespace-normal" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `shippingOptions.${number}.carrier`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    const renderCostField = useCallback(({ field }) => (
        <FormItem>
            <FormControl>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter cost"
                    {...field}
                    value={field.value === 0 ? '' : field.value}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
            </FormControl>
            <FormMessage className="w-full whitespace-normal" />
        </FormItem>
    ), []) as ((params: {
        field: ControllerRenderProps<FieldValues, `shippingOptions.${number}.cost_first_item`>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<FieldValues>;
    }) => React.ReactElement);

    return <Form {...shippingForm}>
        <form className="space-y-6" onSubmit={shippingForm.handleSubmit(data => {
            // Check for duplicate country-carrier combinations
            const erroneousIndices: number[] = [];
            const combinationSet = new Set<string>();
            data.shippingOptions.forEach((opt, i) => {
                const combination = `${opt.destination_country}-${opt.carrier}`;
                if (combinationSet.has(combination)) {
                    erroneousIndices.push(i);
                } else {
                    combinationSet.add(combination);
                }
            });
            
            for (const i of erroneousIndices) { 
                shippingForm.setError(`shippingOptions.${i}.destination_country`, {
                    message: "Country-Carrier combination must be unique."
                });
                shippingForm.setError(`shippingOptions.${i}.carrier`, {
                    message: "Country-Carrier combination must be unique."
                });
            }
            if (erroneousIndices.length)
                return;

            if (shippingMethod)
                onSubmit({
                    name: data.name,
                    seller_id: shippingMethod.seller_id,
                    shippingOptions: data.shippingOptions.map(opt => ({
                        id: opt.id,
                        destination_country: opt.destination_country,
                        carrier: opt.carrier,
                        cost_first_item: opt.cost_first_item
                    }))
                });
            else
                onSubmit(data);
        })}>
            <div className="space-y-4">
                <FormField
                    control={shippingForm.control}
                    name="name"
                    disabled={loading}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Method Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter shipping method name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={shippingForm.control}
                    name="shippingOptions"
                    disabled={loading}
                    render={({ field }) => {
                        return <FormItem>
                            <FormLabel>Shipping Options</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div
                                        data-slot="table-container"
                                        className="relative w-full max-w-full h-64 overflow-auto"
                                    >
                                        <Table className="border-separate border-spacing-0 w-full table-fixed">
                                            <TableHeader className="sticky top-0">
                                                <TableRow>
                                                    <TableHead className="border-y border-x rounded-tl-md bg-background w-[35%]">Country</TableHead>
                                                    <TableHead className="border-y border-r bg-background w-[35%]">Carrier</TableHead>
                                                    <TableHead className="border-y border-r bg-background w-[20%]">Cost ($)</TableHead>
                                                    <TableHead className="border-y border-r rounded-tr-md bg-background w-[10%]" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {field.value.map((opt, i) => <TableRow key={opt.key}>
                                                    <TableCell className={`border-b border-x p-2 ${i === field.value.length - 1 ? "rounded-bl-md": ""}`}>
                                                        <FormField
                                                            control={shippingForm.control}
                                                            name={`shippingOptions.${i}.destination_country`}
                                                            disabled={field.disabled}
                                                            render={renderDestinationCountryField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="border-b border-r p-2">
                                                        <FormField
                                                            control={shippingForm.control}
                                                            name={`shippingOptions.${i}.carrier`}
                                                            disabled={field.disabled}
                                                            render={renderCarrierField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="border-b border-r p-2">
                                                        <FormField
                                                            control={shippingForm.control}
                                                            name={`shippingOptions.${i}.cost_first_item`}
                                                            disabled={field.disabled}
                                                            render={renderCostField}
                                                        />
                                                    </TableCell>
                                                    <TableCell className={`border-b border-r p-1 ${i === field.value.length - 1 ? "rounded-br-md": ""}`}>
                                                        {field.value.length === 1 ?
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="h-min">
                                                                        <Button variant="ghost" disabled size="sm">
                                                                            <Minus className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>At least one option must be there</p>
                                                                </TooltipContent>
                                                            </Tooltip> :
                                                            <Button variant="ghost"
                                                                type="button"
                                                                size="sm"
                                                                disabled={field.disabled || field.value.length === 1}
                                                                onClick={() => {
                                                                    const currentValue = shippingForm.getValues("shippingOptions");
                                                                    currentValue.splice(i, 1);
                                                                    field.onChange([...currentValue]);
                                                                }}
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </Button>
                                                        }
                                                    </TableCell>
                                                </TableRow>)}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <FormMessage />
                                    <Button variant="outline"
                                        type="button"
                                        disabled={field.disabled}
                                        className="w-full justify-start gap-1"
                                        onClick={() => {
                                            const currentValue = shippingForm.getValues("shippingOptions");
                                            const key = currentValue.length ? currentValue[currentValue.length - 1]?.key + 1 : 1;
                                            field.onChange([...currentValue, { 
                                                key, 
                                                destination_country: "", 
                                                carrier: "", 
                                                cost_first_item: 0 
                                            }]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                        <div className="font-medium text-sm text-gray-600">Add Shipping Option</div>
                                    </Button>
                                </div>
                            </FormControl>
                        </FormItem>
                    }}
                />
            </div>
            <Button disabled={loading || !shippingForm.formState.isDirty}
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