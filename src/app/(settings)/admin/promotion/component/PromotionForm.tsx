import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
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


const promotionFormSchema = z.object({
  description: z.string().nonempty("Description is required."),
  promotionType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().gt(0, "Discount value must be greater than 0."),
  validFrom: z.date().optional(),
  validTill: z.date().optional(),
  minimumOrderValue: z.number().optional(),
  maxUses: z.number().optional(),
  usagePerCustomer: z.number().optional(),
  categoryIds: z.array(z.number()).min(1, "At least one category is required.")
});

type PromotionFormData = z.infer<typeof promotionFormSchema>;

export function PromotionForm({ mode = "create", loading, onSubmit }: {
  mode: "create" | "edit";
  loading: boolean;
  onSubmit: (data: PromotionFormData) => void;
}) {
  const form = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      description: "",
      promotionType: "PERCENTAGE",
      discountValue: 0,
      minimumOrderValue: 0,
      maxUses: 0,
      usagePerCustomer: 0,
      categoryIds: []
    }
  });

  const handleSubmit = (data: z.infer<typeof promotionFormSchema>) => {
    onSubmit(data);
  };
  const [selectedCategory, setSelectedCategory] = useState<CategoryDropdownNode>();
  return (
    <Form {...form}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Promotion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>{mode === "create" ? "Create Promotion" : "Edit Promotion"}</DialogTitle>
        </DialogHeader>
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
              const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
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
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected Categories: {field.value.length > 0 ? field.value.map(id => {
                      const category = categories.find(cat => cat.categoryId === id);
                      return category ? category.name : id;
                    }).join(', ') : 'None'}
                  </div>
                  {field.value.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        field.onChange([]);
                        setSelectedCategory(undefined);
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={loading}>
            {mode === "create" ? "Create Promotion" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Form>
  );
}
