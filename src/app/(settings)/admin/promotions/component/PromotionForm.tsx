import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CategoriesDropdown, { CategoryDropdownNode } from "@/app/components/CategoriesDropdown"
import { useAppSelector } from "@/store/hooks"
import { useState } from "react"
import { PromotionDetails, PromotionType } from "@/types/domains/promotion"
import Spinner from "@/components/ui/spinner"
import { CategoryTree } from "@/types/domains/category"


const promotionFormSchema = z.object({
    description: z.string().nonempty("Description is required."),
    promotionType: z.enum([PromotionType.PERCENTAGE, PromotionType.FLAT]),
    discountValue: z.number().gt(0, "Discount value must be greater than 0."),
    validFrom: z.date().optional(),
    validTill: z.date().optional(),
    minimumOrderValue: z.number().optional(),
    maxUses: z.number().optional(),
    usagePerCustomer: z.number().optional(),
    categoryIds: z.array(z.number()).min(1, "At least one category is required.")
});

type PromotionFormData = z.infer<typeof promotionFormSchema>;

export function PromotionForm({ mode = "create", promotion, categories,loading, categoriesLoading, onSubmit, onCancel }: {
    mode: "create" | "edit";
    promotion?: PromotionDetails;
    categories: CategoryTree[];
    loading: boolean;
    categoriesLoading: boolean;
    onSubmit: (data: PromotionFormData) => void;
    onCancel: () => void;

}) {
    const form = useForm<z.infer<typeof promotionFormSchema>>({
        resolver: zodResolver(promotionFormSchema),
        defaultValues: {
            description: promotion?.description || "",
            promotionType: promotion?.promotionType || PromotionType.PERCENTAGE,
            discountValue: promotion?.discountValue || 0,
            minimumOrderValue: promotion?.minimumOrderValue || 0,
            maxUses: promotion?.maxUses || 0,
            usagePerCustomer: promotion?.usagePerCustomer || 0,
            categoryIds: promotion?.categories?.map(cat => cat.categoryId) || []
        }
    });

    const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter promotion description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="promotionType"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Promotion Type</FormLabel>
                                    <FormControl>
                                        <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select promotion type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                                <SelectItem value="FLAT">Flat Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                        <FormField
                            control={form.control}
                            name="discountValue"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>{form.watch('promotionType') === 'FLAT' ? 'Flat Amount' : 'Discount Value'}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value === 0 ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                            placeholder={form.watch('promotionType') === 'FLAT' ? 'Enter flat amount' : 'Enter discount value'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="minimumOrderValue"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Minimum Order Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value === 0 ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="Enter minimum order value"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                        <FormField
                            control={form.control}
                            name="validFrom"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Valid From</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            placeholder="Select start date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="validTill"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Valid Till</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            placeholder="Select end date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                        <FormField
                            control={form.control}
                            name="maxUses"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Maximum Uses</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value === 0 ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="Enter maximum uses"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="usagePerCustomer"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Usage Per Customer</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value === 0 ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                            placeholder="Enter usage per customer"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Categories</FormLabel>
                                    <FormControl>
                                        <CategoriesDropdown
                                            selectedCategoryNode={selectedCategory}
                                            onSelect={(node) => {
                                                if (!field.value.includes(node.categoryId)) {
                                                    field.onChange([...field.value, node.categoryId]);
                                                    setSelectedCategory(undefined); // Reset to allow selecting another category
                                                }
                                            }}
                                            categories={categories}
                                            disabled={loading || categoriesLoading}
                                        />
                                    </FormControl>
                                    <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center">
                                        Selected Categories: {field.value.length > 0 ? field.value.map(id => {
                                            const category = categories.find((cat: any) => cat.categoryId === id);
                                            return category ? category.name : id;
                                        }).join(', ') : 'None'}
                                        {field.value.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    field.onChange([]);
                                                    setSelectedCategory(undefined);
                                                }}
                                            >
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Spinner />}
                        {mode === "create" ? "Create Promotion" : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
