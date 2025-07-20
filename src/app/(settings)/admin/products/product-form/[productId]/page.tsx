"use client";
import { useAppSelector } from "@/store/hooks";
import { categoriesUnionSelector } from "@/store/selectors";
import React, { Usable, useEffect } from "react";
import * as productServices from "@/services/product";
import { getCategoryById } from "@/services/category";
import useDataFetch from "@/hooks/use-data-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "nextjs-toploader/app";

import { Product, ProductDetails } from "@/types/domains/product";
import ProductForm from "../../components/ProductForm";


export default function ProductPage({ params }: { params: Usable<{ productId: string }> }) {

    const { productId } = React.use(params);
    const router = useRouter();
    const productById = useDataFetch(productServices.getProductById);
    const updateProduct = useDataFetch(productServices.updateProduct);
    const getCategoryDetails = useDataFetch(getCategoryById);
    const { categories, variations, attributes, loading } = useAppSelector(categoriesUnionSelector);
 
    useEffect(() => {
        productById.request(Number(productId));
    }, []);

    return <div className="h-full space-y-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <div className="flex-1 py-2">
            <Card>
                <CardContent>
                    <ProductForm
                        mode="update"
                        product={productById.data}
                        categories={categories}
                        variations={variations}
                        attributes={attributes}
                        loading={productById.isLoading || updateProduct.isLoading}
                        categoriesLoading={loading || getCategoryDetails.isLoading}
                        fetchCategoryDetails={getCategoryDetails.request}
                        onSubmit={data => {
                            updateProduct.request(Number(productId), {

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
}
