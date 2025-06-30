"use client";
import { useAppSelector } from "@/store/hooks";
import { categoriesUnionSelector } from "@/store/selectors";
import React from "react";
import * as productServices from "@/services/product";
import { getCategoryById } from "@/services/category";
import useDataFetch from "@/hooks/use-data-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "nextjs-toploader/app";
import ProductForm from "../components/ProductForm";

export default function AddProductPage(
    // { searchParams }: { searchParams: Usable<{ sequenceNumber: string }> }
) {
    // const { sequenceNumber } = React.use(searchParams);
    // if (!sequenceNumber)
    //     return <Dialog open>
    //         <DialogContent closeIcon={false}>
    //             <DialogTitle>Error</DialogTitle>
    //             <DialogDescription>The sequence number parameter must not be empty.</DialogDescription>
    //         </DialogContent>
    //     </Dialog>;

    // const seqNo = sequenceNumber.padStart(6, "0");

    const router = useRouter();
    const createProduct = useDataFetch(productServices.createProduct);
    const getCategoryDetails = useDataFetch(getCategoryById);
    const { categories, variations, attributes, loading, error } = useAppSelector(categoriesUnionSelector);
    // const productFormRef = useRef();

    return <div className="h-full space-y-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <div className="flex-1 py-2">
            <Card>
                <CardContent>
                    <ProductForm
                        categories={categories}
                        variations={variations}
                        attributes={attributes}
                        loading={createProduct.isLoading}
                        categoriesLoading={loading || getCategoryDetails.isLoading}
                        fetchCategoryDetails={getCategoryDetails.request}
                        onSubmit={data => {
                            createProduct.request({
                                ...data,
                                attributes: data.attributes.filter(attr => attr.value)
                            }).onSuccess(() => {
                                // productFormRef.current.reset();
                                router.replace("/admin/products");
                            });
                        }} />
                </CardContent>
            </Card>
        </div>
    </div>
};
