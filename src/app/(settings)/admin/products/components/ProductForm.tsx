/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ShippingMethod } from "@/types/domains/shipping_method";
import { extractConsonants } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { RequestFunction } from "@/hooks/use-data-fetch";
import CategoriesDropdown from "@/app/components/CategoriesDropdown";
import { ProductDetails } from "@/types/domains/product";
import useDrivePicker from "react-google-drive-picker";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const productFormSchema = z
   .object({
      title: z.string().nonempty("Title is required."),
      code: z.string().nonempty("Code is required."),
      description: z.string().nonempty("Description is required."),
      starred: z.boolean(),
      categoryId: z.number().gt(0, "Category is required."),
      shippingMethodId: z.number().gt(0, "Shipping method is required."),
      images: z.array(
         z.object({
            productImageId: z.number().optional(),
            imageUrl: z.string().url("Invalid image URL"),
            isDefault: z.boolean(),
         })
      ),
      variants: z.array(
         z.object({
            productVariantId: z.number().optional(),
            sku: z.string().nonempty("SKU is required."),
            quantityInStock: z.number(),
            price: z.number(),
            disabled: z.boolean(),
            variationOptionIds: z.array(z.number()).min(1, "At least one variation option is required."),
         })
      ),
      attributes: z.array(
         z.object({
            attributeId: z.number(),
            value: z.string(),
         })
      ),
   })
   .refine((data) => data.variants.length > 0, { message: "At least one variant is required." });

type ProductFormData = z.infer<typeof productFormSchema>;

function assignField<T extends keyof ProductFormData>(field: T, target: Partial<ProductFormData>, value: ProductFormData[T]) {
   target[field] = value;
}

interface CategoryData {
   categoryId: number;
   name: string;
   code: string;
   parentCategory: CategoryData | undefined;
   variationIds: number[];
   attributeIds: number[];
}

const categoryDetailsMap = new Map<number, CategoryData>();

export default function ProductForm({
   mode = "create",
   product,
   categories,
   variations,
   attributes,
   shippingMethods,
   loading,
   categoriesLoading,
   shippingMethodsLoading,
   fetchCategoryDetails,
   onSubmit,
}: {
   mode?: "create" | "update";
   product?: ProductDetails;
   categories: CategoryTree[];
   variations: Variation[];
   attributes: Attribute[];
   shippingMethods: ShippingMethod[];
   loading: boolean;
   categoriesLoading: boolean;
   shippingMethodsLoading: boolean;
   fetchCategoryDetails: RequestFunction<[categoryId: number], CategoryDetails>;
   onSubmit: (data: Partial<ProductFormData>) => void;
}) {
   const [openPicker, authResponse] = useDrivePicker();
   const productForm = useForm({
      resolver: zodResolver(productFormSchema),
      defaultValues: {
         title: "",
         code: "",
         description: "",
         starred: false,
         shippingMethodId: 0,
         images: [],
         variants: [],
         attributes: [],
      },
   });
   const firstRender = useRef(true);

   useEffect(() => {
      if (!firstRender.current && product) {
         fetchCategoryDetails(product.categoryId).onSuccess((categoryDetails) => {
            registerCategoryDetails(categoryDetails);
            productForm.reset({
               title: product.title,
               code: product.code,
               description: product.description,
               starred: product.starred ?? false,
               categoryId: product.categoryId,
               shippingMethodId: product.shippingMethodId || 0,
               images: product.images || [],
               variants: product.variants.map((v) => ({
                  ...v,
                  variationOptionIds: Object.values(v.variantProperties).map((opt) => opt.variationOptionId),
               })),
               attributes: product.attributes || [],
            });
         });
         return;
      }
      firstRender.current = false;
   }, [product]);

   const indexedVariations = useMemo(
      () =>
         variations.reduce((acc, variation) => {
            acc[variation.variationId] = variation;
            return acc;
         }, {} as Record<number, (typeof variations)[number]>),
      [variations]
   );
   const indexedVariationOptions = useMemo(
      () =>
         variations.reduce((acc, variation) => {
            variation.variationOptions.forEach((opt) => (acc[opt.variationOptionId] = opt));
            return acc;
         }, {} as Record<number, VariationOption>),
      [variations]
   );
   const indexedAttributes = useMemo(
      () =>
         attributes.reduce((acc, attribute) => {
            acc[attribute.attributeId] = attribute;
            return acc;
         }, {} as Record<number, (typeof attributes)[number]>),
      [attributes]
   );

   const selectedCategoryDetails = categoryDetailsMap.get(productForm.watch("categoryId"));
   const categoryVariationIds = useMemo(() => {
      const categoryVariationIdSet: Set<number> = new Set();
      let current = selectedCategoryDetails;
      while (current) {
         current.variationIds.forEach((vId) => categoryVariationIdSet.add(vId));
         current = current.parentCategory;
      }
      return Array.from(categoryVariationIdSet).sort();
   }, [selectedCategoryDetails]);
   const productVariants = productForm.watch("variants");
   const productAttributes = productForm.watch("attributes");
   const productImages = productForm.watch("images");

   const updateSkus = useCallback(
      (productCode: string) =>
         productVariants.forEach((v, i) =>
            productForm.setValue(
               `variants.${i}.sku`,
               `${selectedCategoryDetails?.code || ""}-${productCode}-${v.variationOptionIds
                  .map((optId) => indexedVariationOptions[optId].code)
                  .join("-")}`
            )
         ),
      [productVariants, productForm, selectedCategoryDetails, indexedVariationOptions]
   );

   const updateVariantsAndAttributes = useCallback(
      (categoryDetails: CategoryData) => {
         const variants = getVariantsFromVariations(getCategoryVariations(categoryDetails).map((vId) => indexedVariations[vId]));
         variants.forEach(
            (v) =>
               (v.sku = `${categoryDetails.code}-${productForm.watch("code")}-${v.variationOptionIds
                  .map((optId) => indexedVariationOptions[optId].code)
                  .join("-")}`)
         );
         productForm.setValue("variants", variants);
         productForm.setValue(
            "attributes",
            getCategoryAttributes(categoryDetails).map((aId) => ({
               attributeId: aId,
               value: "",
            }))
         );
      },
      [productForm, indexedVariations, indexedVariationOptions]
   );

   const handleOpenPicker = useCallback(() => {
      try {
         openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
            token: authResponse?.access_token,
            viewId: "DOCS_IMAGES",
            setParentFolder: "10ZZvkCV_n6HaM_5AMSXM7uSMbEqqkpi7",
            multiselect: false,
            supportDrives: true,
            showUploadView: true,
            viewMimeTypes: "image/png,image/jpeg,image/jpg,image/gif,image/webp",

            callbackFunction(data) {
               if (!(data.action === "picked" && data.docs && data.docs.length > 0)) return;

               const file = data.docs[0];
               const fileId = file.id;
               const imageUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
               if (productImages.some((img) => img.imageUrl === imageUrl)) return;

               productForm.setValue(
                  "images",
                  [
                     ...productImages,
                     {
                        imageUrl,
                        isDefault: productImages.length === 0,
                     },
                  ],
                  { shouldDirty: true }
               );
            },
         });
      } catch (error) {
         toast.error("Failed to open Google Drive picker. Please try again.");
      }
   }, [openPicker, authResponse, productImages]);

   const removeImage = useCallback(
      (imageUrl: string) => {
         const indexToRemove = productImages.findIndex((img) => img.imageUrl === imageUrl);
         const updatedImages = [...productImages];
         if (indexToRemove !== -1) {
            const [removedImage] = updatedImages.splice(indexToRemove, 1);
            if (removedImage.isDefault && updatedImages.length > 0) updatedImages[0].isDefault = true;
            productForm.setValue("images", updatedImages, { shouldDirty: true });
         }
      },
      [productForm, productImages]
   );

   const setAsDefault = useCallback(
      (imageUrl: string) => {
         const updatedImages = productImages.map((img) => ({
            ...img,
            isDefault: img.imageUrl === imageUrl,
         }));
         productForm.setValue("images", updatedImages, { shouldDirty: true });
      },
      [productForm, productImages]
   );

   return (
      <Form {...productForm}>
         <form
            onSubmit={productForm.handleSubmit((data) => {
               const dataToSubmit: Partial<ProductFormData> = {};
               const dirtyFields = productForm.formState.dirtyFields;
               const dirtyFieldKeys = Object.keys(dirtyFields) as (keyof ProductFormData)[];
               if (dirtyFieldKeys.length === 0) return;

               dirtyFieldKeys.forEach((key) => {
                  if (dirtyFields[key]) assignField(key, dataToSubmit, data[key]);
               });

               onSubmit(dataToSubmit);
            })}
            className="space-y-8"
         >
            <div className="space-y-6">
               <div className="space-y-4">
                  <Label>Product Images</Label>

                  <div className="h-72 flex gap-4">
                     {productImages.length > 0 && (
                        <div className="flex-1 overflow-x-auto thin-scrollbar flex gap-4">
                           {productImages.map((image, index) => (
                              <div
                                 key={image.imageUrl}
                                 className="relative cursor-pointer"
                                 onClick={() => setAsDefault(image.imageUrl)}
                              >
                                 <Image
                                    src={image.imageUrl}
                                    alt={`Product image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    style={{ maxWidth: "none" }}
                                    className={`w-auto h-full object-cover rounded-md transition-all duration-300 ${
                                       image.isDefault
                                          ? "outline outline-[3px] outline-green-500 outline-offset-[-3px]"
                                          : "outline-none"
                                    }`}
                                    onError={(e) => {
                                       (e.target as HTMLImageElement).src = "/placeholder-image.jpeg";
                                    }}
                                 />
                                 <span
                                    className={`
                                        absolute top-3 left-3
                                        bg-green-800 text-white px-2 py-1 rounded-md text-xs
                                        transition-opacity transition-transform duration-300
                                        ${image.isDefault ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
                                    `}
                                 >
                                    Default
                                 </span>
                                 <Button
                                    className="absolute top-3 right-3"
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       removeImage(image.imageUrl);
                                    }}
                                    disabled={loading}
                                 >
                                    <Trash2 />
                                 </Button>
                              </div>
                           ))}
                        </div>
                     )}
                     {productImages.length < 10 && (
                        <div
                           className="border bg-accent rounded-md min-w-64 flex flex-col justify-center items-center gap-2 cursor-pointer"
                           onClick={loading ? undefined : handleOpenPicker}
                        >
                           <Plus className="size-8 text-muted-foreground" />
                           <p className="text-sm text-muted-foreground">Select from Google Drive</p>
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                  <FormField
                     disabled={loading}
                     control={productForm.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel>Product Title</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder="Enter product title"
                                 {...field}
                                 onChange={(e) => {
                                    const newValue = e.target.value;
                                    field.onChange(newValue);
                                    productForm.setValue("code", extractConsonants(newValue).toUpperCase(), {
                                       shouldDirty: true,
                                    });
                                 }}
                                 onBlur={(e) => {
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
                  <FormField
                     disabled={loading}
                     control={productForm.control}
                     name="code"
                     render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel>Product Code</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder="Enter product code"
                                 {...field}
                                 onBlur={(e) => {
                                    field.onBlur();
                                    const formatted = e.target.value.trim().toUpperCase().replace(/\s+/g, "-");
                                    field.onChange(formatted);
                                    updateSkus(formatted);
                                 }}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <FormField
                  disabled={loading}
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
                              onBlur={(e) => {
                                 field.onBlur();
                                 field.onChange(e.target.value.trim());
                              }}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-4">
                  <FormField
                     control={productForm.control}
                     name="categoryId"
                     disabled={loading || categoriesLoading}
                     render={({ field }) => {
                        return (
                           <FormItem className="min-w-xs flex-1">
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                 <CategoriesDropdown
                                    categories={categories}
                                    disabled={field.disabled}
                                    selectedCategoryNode={categoryDetailsMap.get(field.value)}
                                    onSelect={(node) => {
                                       if (categoryDetailsMap.has(node.categoryId)) {
                                          field.onChange(node.categoryId);
                                          updateVariantsAndAttributes(categoryDetailsMap.get(node.categoryId)!);
                                       } else {
                                          fetchCategoryDetails(node.categoryId).onSuccess((res) => {
                                             field.onChange(node.categoryId);
                                             updateVariantsAndAttributes(registerCategoryDetails(res));
                                          });
                                       }
                                    }}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        );
                     }}
                  />

                  <FormField
                     control={productForm.control}
                     name="shippingMethodId"
                     disabled={loading || shippingMethodsLoading}
                     render={({ field }) => (
                        <FormItem className="min-w-xs flex-1">
                           <FormLabel>Shipping Method</FormLabel>
                           <FormControl>
                              <Select
                                 disabled={field.disabled}
                                 value={field.value ? field.value.toString() : ""}
                                 onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select shipping method" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {shippingMethods.map((method) => (
                                       <SelectItem key={method.shippingMethodId} value={method.shippingMethodId.toString()}>
                                           <div className="flex flex-col items-start text-left w-full">
                                                <span className="font-medium text-left">{method.name}</span>
                                                <span className="text-xs text-muted-foreground text-left">
                                                   {method.originCountry} • {method.processingTimeMin}-{method.processingTimeMax} days processing
                                                </span>
                                             </div>
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     disabled={loading}
                     control={productForm.control}
                     name="starred"
                     render={({ field }) => (
                        <FormItem className="lg:flex-1 gap-3">
                           <FormLabel>Starred</FormLabel>
                           <FormControl>
                              <div className="flex items-center gap-2">
                                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                 <label className="text-sm text-muted-foreground">
                                    Check if you want this product to appear on top.
                                 </label>
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
                  {categoryVariationIds.length ? (
                     <div data-slot="table-container" className="relative w-full overflow-x-auto">
                        <Table className="border-separate border-spacing-0 border rounded-md overflow-hidden">
                           <TableHeader>
                              <TableRow>
                                 <TableHead className="border-b">Sr. No.</TableHead>
                                 {categoryVariationIds.map((vId) => (
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
                                    {variant.variationOptionIds.map((optId) => (
                                       <TableCell key={optId}>{indexedVariationOptions[optId].name}</TableCell>
                                    ))}
                                    <TableCell>
                                       <FormField
                                          disabled={loading}
                                          control={productForm.control}
                                          name={`variants.${index}.sku`}
                                          render={({ field }) => (
                                             <FormItem>
                                                <FormControl>
                                                   <Input
                                                      {...field}
                                                      onBlur={(e) => {
                                                         field.onBlur();
                                                         field.onChange(e.target.value.trim());
                                                      }}
                                                   />
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                    </TableCell>
                                    <TableCell>
                                       <FormField
                                          disabled={loading}
                                          control={productForm.control}
                                          name={`variants.${index}.price`}
                                          render={({ field }) => (
                                             <FormItem>
                                                <FormControl>
                                                   <Input
                                                      type="number"
                                                      {...field}
                                                      onChange={(e) => {
                                                         const value = e.target.value;
                                                         field.onChange(value === "" ? "" : parseFloat(value));
                                                      }}
                                                   />
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                    </TableCell>
                                    <TableCell>
                                       <FormField
                                          disabled={loading}
                                          control={productForm.control}
                                          name={`variants.${index}.quantityInStock`}
                                          render={({ field }) => (
                                             <FormItem>
                                                <FormControl>
                                                   <Input
                                                      type="number"
                                                      {...field}
                                                      onChange={(e) => {
                                                         const value = e.target.value;
                                                         field.onChange(value === "" ? "" : parseFloat(value));
                                                      }}
                                                   />
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                    </TableCell>
                                    <TableCell>
                                       <FormField
                                          disabled={loading}
                                          control={productForm.control}
                                          name={`variants.${index}.disabled`}
                                          render={({ field }) => (
                                             <FormItem>
                                                <FormControl>
                                                   <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                             </FormItem>
                                          )}
                                       />
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  ) : (
                     <div className="text-sm text-muted-foreground">Select a category to get variants.</div>
                  )}
               </div>

               {productAttributes.map((attr, index) => (
                  <FormField
                     disabled={loading}
                     key={attr.attributeId}
                     control={productForm.control}
                     name={`attributes.${index}.value`}
                     render={({ field }) => {
                        const attribute = indexedAttributes[attr.attributeId];

                        return (
                           <FormItem className="max-w-xs">
                              <FormLabel>{attribute.name}</FormLabel>
                              <FormControl>
                                 {attribute.type === AttributeType.CUSTOM ? (
                                    <Input className="w-full" {...field} />
                                 ) : (
                                    <Select
                                       disabled={field.disabled}
                                       value={field.value}
                                       onValueChange={(value) => field.onChange(value)}
                                    >
                                       <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a value" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          {attribute.allowedValues.map((option) => (
                                             <SelectItem key={option} value={option}>
                                                {option}
                                             </SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 )}
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        );
                     }}
                  />
               ))}
            </div>

            {productForm.formState.errors.root && (
               <div className="text-sm font-medium text-destructive">{productForm.formState.errors.root.message}</div>
            )}

            <Button type="submit" disabled={loading || !productForm.formState.isDirty}>
               {loading && <Spinner />}
               {mode === "update" ? "Update Product" : "Create Product"}
            </Button>
         </form>
      </Form>
   );
}

function registerCategoryDetails(categoryDetails: CategoryDetails): CategoryData {
   const { categoryId } = categoryDetails;
   if (categoryDetailsMap.has(categoryId)) return categoryDetailsMap.get(categoryId)!;

   const details = {
      categoryId: categoryId,
      name: categoryDetails.name,
      code: categoryDetails.code,
      parentCategory: categoryDetails.parentCategory ? registerCategoryDetails(categoryDetails.parentCategory) : undefined,
      variationIds: categoryDetails.variations.map((v) => v.variationId),
      attributeIds: categoryDetails.attributes.map((a) => a.attributeId),
   };
   categoryDetailsMap.set(categoryId, details);
   return details;
}

function getCategoryVariations(categoryDetails: CategoryData): number[] {
   const categoryVariationIdSet: Set<number> = new Set();
   let current: CategoryData | undefined = categoryDetails;
   while (current) {
      current.variationIds.forEach((vId) => {
         if (categoryVariationIdSet.has(vId)) return;
         categoryVariationIdSet.add(vId);
      });
      current = current.parentCategory;
   }
   return Array.from(categoryVariationIdSet).sort();
}

function getCategoryAttributes(categoryDetails: CategoryData): number[] {
   const categoryAttributeIdSet: Set<number> = new Set();
   let current: CategoryData | undefined = categoryDetails;
   while (current) {
      current.attributeIds.forEach((vId) => {
         if (categoryAttributeIdSet.has(vId)) return;
         categoryAttributeIdSet.add(vId);
      });
      current = current.parentCategory;
   }
   return Array.from(categoryAttributeIdSet);
}

function getVariantsFromVariations(variations: Variation[]): ProductFormData["variants"] {
   if (!variations.length) return [];

   const variation = variations[0];
   const options = variation.variationOptions;
   let variantProperties = options.map((o) => [o.variationOptionId]);
   for (let i = 1; i < variations.length; i++) {
      const varI = variations[i];
      const varIOptions = varI.variationOptions;
      variantProperties = variantProperties.flatMap((variant) => varIOptions.map((o) => [...variant, o.variationOptionId]));
   }

   return variantProperties.map((options) => ({
      sku: "",
      price: 0,
      quantityInStock: 0,
      disabled: false,
      variationOptionIds: options,
   }));
}