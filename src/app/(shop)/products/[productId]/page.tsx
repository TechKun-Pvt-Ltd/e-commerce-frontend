"use client"

import { useState } from "react"
import { Product } from "@/types/domains/product"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AttributeType } from "@/types/domains/attribute";

const product: Product = {
    productId: 1,
    categoryId: 101,
    title: "Premium Wireless Headphones",
    description:
      "Experience high-fidelity audio with our noise-cancelling, over-ear wireless headphones. Built for comfort and performance.",
    dateAdded: "2025-04-10T00:00:00Z",
    starred: true,
    productImages: [
      {
        productImageId: 1,
        imageUrl: "https://example.com/images/headphones1.png",
        isDefault: true,
    // Placeholder, circular
      },
      {
        productImageId: 2,
        imageUrl: "https://example.com/images/headphones2.png",
        isDefault: false,
      },
    ],
    variants: [
      {
        productVariantId: 101,
        sku: "WH-1000XM5-BLK",
        disabled: false,
        quantityInStock: 28,
        price: 349.99,
        variationOptions: [
          {
            variationOptionId: 1,
            name: "Black",
            variationId: 1,
          },
          {
            variationOptionId: 4,
            name: "Over-Ear",
            variationId: 2,
          },
        ],
      },
      {
        productVariantId: 102,
        sku: "WH-1000XM5-SLV",
        disabled: false,
        quantityInStock: 12,
        price: 349.99,
        variationOptions: [
          {
            variationOptionId: 2,
            name: "Silver",
            variationId: 1,
          },
          {
            variationOptionId: 4,
            name: "Over-Ear",
            variationId: 2,
          },
        ],
      },
    ],
    attributes: [
      {
        productAttributeId: 1,
        attribute: {
          attributeId: 1,
          name: "Battery Life",
          type: AttributeType.CUSTOM,
          allowedValues: []
        },
        value: "30 hours",
      },
      {
        productAttributeId: 2,
        attribute: {
          attributeId: 2,
          name: "Connectivity",
          type: AttributeType.ENUMERATED,
          allowedValues: ["Bluetooth", "Wired"],
        },
        value: "Bluetooth",
      },
    ],
  }

export default function ProductDetailsPage() {
  const [activeImage, setActiveImage] = useState(
    product.productImages.find((img) => img.isDefault)?.imageUrl ??
      product.productImages[0]?.imageUrl
  )

  // Extract all variations
  const variations = Array.from(
    new Set(
      product.variants.flatMap((variant) =>
        variant.variationOptions.map((opt) => opt.variationId)
      )
    )
  )

  const variationMap: Record<
    number,
    { variationId: number; name: string; options: { id: number; name: string }[] }
  > = {}

  product.variants.forEach((variant) => {
    variant.variationOptions.forEach((opt) => {
      if (!variationMap[opt.variationId]) {
        variationMap[opt.variationId] = {
          variationId: opt.variationId,
          name: "", // will fill later
          options: [],
        }
      }
      if (!variationMap[opt.variationId].options.find((o) => o.id === opt.variationOptionId)) {
        variationMap[opt.variationId].options.push({ id: opt.variationOptionId, name: opt.name })
      }
    })
  })

  // Fill variation names from one of the variants
  for (const variant of product.variants) {
    for (const opt of variant.variationOptions) {
      variationMap[opt.variationId].name = opt.name.split(" ")[0]
    }
    break
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <div className="border rounded-md overflow-hidden">
          <img
            src={activeImage}
            alt="Product preview"
            className="w-full h-[400px] object-contain"
          />
        </div>
        <div className="mt-4 flex gap-2">
          {product.productImages.map((img) => (
            <button
              key={img.productImageId}
              onClick={() => setActiveImage(img.imageUrl)}
              className={`border rounded-md p-1 w-16 h-16 ${
                activeImage === img.imageUrl ? "border-primary" : "border-muted"
              }`}
            >
              <img src={img.imageUrl} alt="thumb" className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="text-muted-foreground">{product.description}</p>

        {/* Attribute List */}
        <div className="space-y-2">
          {product.attributes.map((attr) => (
            <div key={attr.productAttributeId} className="text-sm">
              <span className="font-medium">{attr.attribute.name}: </span>
              <span>{attr.value}</span>
            </div>
          ))}
        </div>

        {/* Variation Selects */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.values(variationMap).map((variation) => (
            <div key={variation.variationId}>
              <label className="text-sm font-medium">{variation.name}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${variation.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {variation.options.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Variant Info (mocked default) */}
        <div className="space-y-1">
          <div className="text-lg font-semibold text-primary">
            ${product.variants[0]?.price.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {product.variants[0]?.quantityInStock} in stock
          </div>
        </div>

        <Button size="lg" className="w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  )
};
