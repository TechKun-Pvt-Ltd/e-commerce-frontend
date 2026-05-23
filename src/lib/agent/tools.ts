/* eslint-disable @typescript-eslint/no-explicit-any */
type ToolDefinition = {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
};

const tools: ToolDefinition[] = [
  // ─── Products ────────────────────────────────────────────────────────────────
  {
    name: "list_products",
    description:
      "Get a list of products. Supports filtering by search term, category, price range, and active/inactive status.",
    input_schema: {
      type: "object" as const,
      properties: {
        searchInput: { type: "string", description: "Search by product title" },
        categoryId: { type: "number", description: "Filter by category ID" },
        priceRangeMin: { type: "number", description: "Minimum price filter" },
        priceRangeMax: { type: "number", description: "Maximum price filter" },
        status: { type: "boolean", description: "true = active products only, false = inactive only, omit = all products" },
        sortOption: {
          type: "string",
          enum: ["NEWEST", "POPULAR", "PRICE_HIGH_TO_LOW", "PRICE_LOW_TO_HIGH"],
          description: "How to sort results",
        },
      },
      required: [],
    },
  },
  {
    name: "get_product",
    description: "Get full details of a single product including all variants, images, and attributes.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number", description: "The product ID" },
      },
      required: ["productId"],
    },
  },
  {
    name: "create_product",
    description:
      "Create a new product. Code and SKUs are auto-generated if omitted. Call list_variations and list_attributes first to get valid IDs.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Product title" },
        code: { type: "string", description: "Unique product code (auto-generated from title if omitted)" },
        description: { type: "string", description: "Product description" },
        categoryId: { type: "number", description: "Category ID" },
        shippingMethodId: { type: "number", description: "Shipping method ID" },
        starred: { type: "boolean", description: "Featured product (default false)" },
        status: { type: "boolean", description: "Active/inactive (default true)" },
        variants: {
          type: "array",
          description: "Product variants (at least one required)",
          items: {
            type: "object",
            properties: {
              sku: { type: "string", description: "SKU (auto-generated if omitted)" },
              price: { type: "number", description: "Price" },
              quantityInStock: { type: "number", description: "Stock quantity (default 0)" },
              disabled: { type: "boolean", description: "Disabled flag (default false)" },
              variationOptionIds: {
                type: "array",
                items: { type: "number" },
                description: "List of variation option IDs for this variant",
              },
            },
            required: ["price", "variationOptionIds"],
          },
        },
        images: {
          type: "array",
          description: "Product images",
          items: {
            type: "object",
            properties: {
              imageUrl: { type: "string" },
              isDefault: { type: "boolean" },
            },
            required: ["imageUrl"],
          },
        },
        attributes: {
          type: "array",
          description: "Product attributes",
          items: {
            type: "object",
            properties: {
              attributeId: { type: "number" },
              value: { type: "string" },
            },
            required: ["attributeId", "value"],
          },
        },
      },
      required: ["title", "description", "categoryId", "shippingMethodId", "variants"],
    },
  },
  {
    name: "update_product",
    description:
      "Fully update a product (replaces variants/images/attributes if provided). Use patch_product for simple field updates.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
        title: { type: "string" },
        code: { type: "string" },
        description: { type: "string" },
        categoryId: { type: "number" },
        shippingMethodId: { type: "number" },
        starred: { type: "boolean" },
        status: { type: "boolean" },
        variants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productVariantId: { type: "number", description: "Omit to create a new variant" },
              sku: { type: "string" },
              price: { type: "number" },
              quantityInStock: { type: "number" },
              disabled: { type: "boolean" },
              variationOptionIds: { type: "array", items: { type: "number" } },
            },
            required: ["price", "variationOptionIds"],
          },
        },
        images: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productImageId: { type: "number" },
              imageUrl: { type: "string" },
              isDefault: { type: "boolean" },
            },
          },
        },
        attributes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              attributeId: { type: "number" },
              value: { type: "string" },
            },
            required: ["attributeId", "value"],
          },
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "patch_product",
    description: "Quickly update a product's title, active status, featured flag, or category.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
        title: { type: "string" },
        starred: { type: "boolean" },
        status: { type: "boolean" },
        categoryId: { type: "number" },
      },
      required: ["productId"],
    },
  },
  {
    name: "patch_variant",
    description: "Update a single variant's price, stock quantity, SKU, or disabled flag.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
        variantId: { type: "number" },
        sku: { type: "string" },
        price: { type: "number" },
        quantityInStock: { type: "number" },
        disabled: { type: "boolean" },
      },
      required: ["productId", "variantId"],
    },
  },
  {
    name: "add_product_image",
    description: "Add an image URL to a product.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
        imageUrl: { type: "string", description: "The image URL (e.g. from Cloudflare)" },
        isDefault: { type: "boolean", description: "Set as the default/thumbnail image" },
      },
      required: ["productId", "imageUrl"],
    },
  },
  {
    name: "set_default_image",
    description: "Set a product image as the default thumbnail.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
        productImageId: { type: "number" },
      },
      required: ["productId", "productImageId"],
    },
  },
  {
    name: "delete_product_image",
    description: "Delete a product image by its image ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        productImageId: { type: "number" },
      },
      required: ["productImageId"],
    },
  },
  {
    name: "duplicate_product",
    description:
      "Duplicate a product. Creates an inactive copy with a new unique code and auto-generated SKUs.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
      },
      required: ["productId"],
    },
  },
  {
    name: "bulk_create_products",
    description: "Create multiple products at once. Returns per-row success/error results.",
    input_schema: {
      type: "object" as const,
      properties: {
        products: {
          type: "array",
          description: "Array of product payloads (same schema as create_product)",
          items: { type: "object" },
        },
      },
      required: ["products"],
    },
  },
  {
    name: "get_low_stock_products",
    description: "Get products where any variant has stock at or below the threshold.",
    input_schema: {
      type: "object" as const,
      properties: {
        threshold: { type: "number", description: "Stock threshold (default 5)" },
      },
      required: [],
    },
  },
  {
    name: "preview_product_code",
    description: "Preview what product code would be auto-generated from a given title.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
    },
  },
  {
    name: "delete_product",
    description: "Delete a product. Fails if orders have been placed for it.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number" },
      },
      required: ["productId"],
    },
  },

  // ─── Categories ──────────────────────────────────────────────────────────────
  {
    name: "list_categories",
    description: "Get the full category tree.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "search_categories",
    description: "Search categories by name (partial, case-insensitive).",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Category name to search for" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_category",
    description: "Get details of a category including its attributes and variations.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoryId: { type: "number" },
      },
      required: ["categoryId"],
    },
  },
  {
    name: "create_category",
    description: "Create a new category.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        code: { type: "string", description: "Unique category code" },
        parentCategoryId: { type: "number", description: "ID of the parent category (omit for top-level)" },
        variationIds: {
          type: "array",
          items: { type: "number" },
          description: "Variation IDs available for products in this category",
        },
        attributeIds: {
          type: "array",
          items: { type: "number" },
          description: "Attribute IDs available for products in this category",
        },
        imageUrl: { type: "string" },
      },
      required: ["name", "code"],
    },
  },
  {
    name: "update_category",
    description: "Update a category's name, code, parent, variations, attributes, or image.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoryId: { type: "number" },
        name: { type: "string" },
        code: { type: "string" },
        parentCategoryId: { type: "number", description: "Pass null to make it a top-level category" },
        variationIds: { type: "array", items: { type: "number" } },
        attributeIds: { type: "array", items: { type: "number" } },
        imageUrl: { type: "string" },
      },
      required: ["categoryId"],
    },
  },
  {
    name: "delete_category",
    description: "Delete a category. Fails if it has products or subcategories.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoryId: { type: "number" },
      },
      required: ["categoryId"],
    },
  },

  // ─── Variations ──────────────────────────────────────────────────────────────
  {
    name: "list_variations",
    description: "Get all variations (e.g. Color, Size) with their options.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoryId: { type: "number", description: "Filter to variations used by a specific category" },
      },
      required: [],
    },
  },
  {
    name: "create_variation",
    description: "Create a new variation type with its options (e.g. Color with Red, Blue, Green).",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Variation name, e.g. 'Color'" },
        variationOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Display name, e.g. 'Red'" },
              code: { type: "string", description: "Short code, e.g. 'RED'" },
            },
            required: ["name", "code"],
          },
        },
      },
      required: ["name", "variationOptions"],
    },
  },
  {
    name: "update_variation",
    description:
      "Update a variation's name and/or options. Send the full options list — existing ones (matched by code) are updated, new ones are added, missing ones are removed.",
    input_schema: {
      type: "object" as const,
      properties: {
        variationId: { type: "number" },
        name: { type: "string" },
        variationOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              code: { type: "string" },
            },
            required: ["name", "code"],
          },
        },
      },
      required: ["variationId"],
    },
  },
  {
    name: "delete_variation",
    description: "Delete a variation. Fails if it is used in existing orders.",
    input_schema: {
      type: "object" as const,
      properties: {
        variationId: { type: "number" },
      },
      required: ["variationId"],
    },
  },

  // ─── Attributes ──────────────────────────────────────────────────────────────
  {
    name: "list_attributes",
    description: "Get all product attributes (e.g. Material, Weight).",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "create_attribute",
    description:
      "Create a product attribute. Type is ENUMERATED (fixed list of values) or CUSTOM (free text).",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["ENUMERATED", "CUSTOM"] },
        allowedValues: {
          type: "array",
          items: { type: "string" },
          description: "Required when type is ENUMERATED",
        },
      },
      required: ["name", "type"],
    },
  },
  {
    name: "update_attribute",
    description: "Update an attribute's name, type, or allowed values.",
    input_schema: {
      type: "object" as const,
      properties: {
        attributeId: { type: "number" },
        name: { type: "string" },
        type: { type: "string", enum: ["ENUMERATED", "CUSTOM"] },
        allowedValues: { type: "array", items: { type: "string" } },
      },
      required: ["attributeId"],
    },
  },
  {
    name: "delete_attribute",
    description: "Delete an attribute. Fails if it is used in existing orders.",
    input_schema: {
      type: "object" as const,
      properties: {
        attributeId: { type: "number" },
      },
      required: ["attributeId"],
    },
  },

  // ─── Shipping Methods ─────────────────────────────────────────────────────────
  {
    name: "list_shipping_methods",
    description: "Get all shipping methods.",
    input_schema: {
      type: "object" as const,
      properties: {
        originCountry: { type: "string", description: "Filter by origin country" },
      },
      required: [],
    },
  },
  {
    name: "create_shipping_method",
    description: "Create a shipping method with destination options.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        originCountry: { type: "string" },
        originPostalCode: { type: "string" },
        processingTimeMin: { type: "number", description: "Min processing days" },
        processingTimeMax: { type: "number", description: "Max processing days" },
        shippingOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              destinationCountry: { type: "string" },
              carrier: { type: "string" },
              costFirstItem: { type: "number" },
              costAdditionalItem: { type: "number" },
              estimatedDeliveryMin: { type: "number" },
              estimatedDeliveryMax: { type: "number" },
            },
            required: ["destinationCountry", "costFirstItem", "estimatedDeliveryMin", "estimatedDeliveryMax"],
          },
        },
      },
      required: ["name", "originCountry", "processingTimeMin", "processingTimeMax"],
    },
  },
  {
    name: "update_shipping_method",
    description: "Update a shipping method (replaces shipping options if provided).",
    input_schema: {
      type: "object" as const,
      properties: {
        shippingMethodId: { type: "number" },
        name: { type: "string" },
        originCountry: { type: "string" },
        originPostalCode: { type: "string" },
        processingTimeMin: { type: "number" },
        processingTimeMax: { type: "number" },
        shippingOptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              destinationCountry: { type: "string" },
              carrier: { type: "string" },
              costFirstItem: { type: "number" },
              costAdditionalItem: { type: "number" },
              estimatedDeliveryMin: { type: "number" },
              estimatedDeliveryMax: { type: "number" },
            },
            required: ["destinationCountry", "costFirstItem", "estimatedDeliveryMin", "estimatedDeliveryMax"],
          },
        },
      },
      required: ["shippingMethodId", "name", "originCountry", "processingTimeMin", "processingTimeMax"],
    },
  },
  {
    name: "delete_shipping_method",
    description: "Delete a shipping method.",
    input_schema: {
      type: "object" as const,
      properties: {
        shippingMethodId: { type: "number" },
      },
      required: ["shippingMethodId"],
    },
  },

  // ─── Promotions ───────────────────────────────────────────────────────────────
  {
    name: "list_promotions",
    description: "Get all promotions/discounts.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "create_promotion",
    description: "Create a promotion/discount. Always ask for start date, end date, minimum order value, max uses, and per-customer limit before creating — do not skip these.",
    input_schema: {
      type: "object" as const,
      properties: {
        description: { type: "string" },
        promotionType: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT"], description: "PERCENTAGE = percent off, FIXED_AMOUNT = flat dollar amount off" },
        discountValue: { type: "number", description: "Discount value (must be > 0). For PERCENTAGE: 0–100. For FIXED_AMOUNT: dollar amount." },
        categoryIds: {
          type: "array",
          items: { type: "number" },
          description: "Apply to specific category IDs (omit or empty array for store-wide)",
        },
        validFrom: { type: "string", description: "Start date in ISO format YYYY-MM-DD. Promotion is inactive before this date. Omit for no start restriction." },
        validTill: { type: "string", description: "End date in ISO format YYYY-MM-DD (inclusive). Promotion expires after this date. Omit for no expiry." },
        minimumOrderValue: { type: "number", description: "Minimum cart total required for the promotion to apply. Omit for no minimum." },
        maxUses: { type: "number", description: "Maximum total number of times this promotion can be redeemed across all customers. Omit for unlimited." },
        usagePerCustomer: { type: "number", description: "Maximum number of times a single customer can redeem this promotion. Omit for unlimited." },
      },
      required: ["description", "promotionType", "discountValue"],
    },
  },
  {
    name: "update_promotion",
    description: "Update a promotion. Any field omitted is left unchanged.",
    input_schema: {
      type: "object" as const,
      properties: {
        promotionId: { type: "number" },
        description: { type: "string" },
        promotionType: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT"] },
        discountValue: { type: "number" },
        categoryIds: { type: "array", items: { type: "number" }, description: "Full replacement list of category IDs (empty array = store-wide)" },
        validFrom: { type: "string", description: "Start date YYYY-MM-DD. Pass null to remove the restriction." },
        validTill: { type: "string", description: "End date YYYY-MM-DD. Pass null to remove expiry." },
        minimumOrderValue: { type: "number", description: "Minimum cart total. Pass null to remove minimum." },
        maxUses: { type: "number", description: "Total redemption cap. Pass null to make unlimited." },
        usagePerCustomer: { type: "number", description: "Per-customer redemption cap. Pass null to make unlimited." },
      },
      required: ["promotionId"],
    },
  },
  {
    name: "delete_promotion",
    description: "Delete a promotion. Fails if it is used in existing orders.",
    input_schema: {
      type: "object" as const,
      properties: {
        promotionId: { type: "number" },
      },
      required: ["promotionId"],
    },
  },

  // ─── Orders ──────────────────────────────────────────────────────────────────
  {
    name: "list_orders",
    description: "Get paginated list of orders. Admins can see all orders. Supports rich filtering by status, date range, customer, and tracking number.",
    input_schema: {
      type: "object" as const,
      properties: {
        page: { type: "number", description: "Page number (0-based, default 0)" },
        size: { type: "number", description: "Page size (default 10)" },
        customerId: { type: "number", description: "Filter by customer ID" },
        statuses: {
          type: "array",
          items: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "FAILED"],
          },
          description: "Filter by one or more order statuses (e.g. [\"SHIPPED\",\"OUT_FOR_DELIVERY\"])",
        },
        fromDate: { type: "string", description: "Start of date range, ISO format YYYY-MM-DD (order placed on or after)" },
        toDate: { type: "string", description: "End of date range, ISO format YYYY-MM-DD (order placed on or before)" },
        customerName: { type: "string", description: "Search by customer's full name (partial match)" },
        trackingNumber: { type: "string", description: "Filter by shipment tracking number" },
      },
      required: [],
    },
  },
  {
    name: "get_order",
    description: "Get full details of a single order.",
    input_schema: {
      type: "object" as const,
      properties: {
        shopOrderId: { type: "number" },
      },
      required: ["shopOrderId"],
    },
  },
  {
    name: "update_order_status",
    description:
      "Update an order's status and optionally set tracking information (trackingNumber, carrierName, etc.).",
    input_schema: {
      type: "object" as const,
      properties: {
        shopOrderId: { type: "number" },
        status: {
          type: "string",
          enum: [
            "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED",
            "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
            "RETURNED", "REFUNDED", "FAILED",
          ],
        },
        trackingNumber: { type: "string" },
        carrierName: { type: "string" },
        shippingProvider: { type: "string" },
        estimatedDeliveryDate: { type: "string", description: "ISO date (YYYY-MM-DD)" },
      },
      required: ["shopOrderId", "status"],
    },
  },

  // ─── Users ────────────────────────────────────────────────────────────────────
  {
    name: "list_users",
    description: "Get all users. Supports filtering by name, email, phone, city, or country.",
    input_schema: {
      type: "object" as const,
      properties: {
        fullName: { type: "string", description: "Filter by full name (partial match)" },
        email: { type: "string", description: "Filter by email address" },
        phoneNo: { type: "string", description: "Filter by phone number" },
        city: { type: "string", description: "Filter by city" },
        country: { type: "string", description: "Filter by country" },
      },
      required: [],
    },
  },
  {
    name: "remove_user",
    description: "Deactivate/remove a user account by their user ID. This is a soft delete — the user is disabled but their order history is preserved. Use with caution and confirm with the admin first.",
    input_schema: {
      type: "object" as const,
      properties: {
        userId: { type: "number", description: "The user ID to remove" },
      },
      required: ["userId"],
    },
  },

  // ─── Banner Images ────────────────────────────────────────────────────────────
  {
    name: "list_banner_images",
    description: "Get all homepage banner/hero images.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "create_banner_image",
    description: "Add a new banner/hero image to the homepage. Pass isDefault: true to make it the primary banner.",
    input_schema: {
      type: "object" as const,
      properties: {
        imageUrl: { type: "string", description: "The image URL (e.g. Cloudinary URL)" },
        isDefault: { type: "boolean", description: "Set as the default/primary banner (default false)" },
      },
      required: ["imageUrl"],
    },
  },
  {
    name: "update_banner_image",
    description: "Update a banner image's URL or default status.",
    input_schema: {
      type: "object" as const,
      properties: {
        bannerImageId: { type: "number", description: "The banner image ID to update" },
        imageUrl: { type: "string", description: "New image URL" },
        isDefault: { type: "boolean", description: "Set as the default/primary banner" },
      },
      required: ["bannerImageId"],
    },
  },
  {
    name: "delete_banner_image",
    description: "Delete a banner image by its ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        bannerImageId: { type: "number", description: "The banner image ID to delete" },
      },
      required: ["bannerImageId"],
    },
  },

  // ─── Reports ──────────────────────────────────────────────────────────────────
  {
    name: "get_report",
    description: "Fetch a business report for a date range. Reports available: sales (revenue & order totals), orders (orders grouped by status), products_performance (top/bottom selling products), categories_performance (revenue by category), customers (new vs returning, top spenders), discounts_performance (promotion usage & savings).",
    input_schema: {
      type: "object" as const,
      properties: {
        reportType: {
          type: "string",
          enum: ["sales", "orders", "products_performance", "categories_performance", "customers", "discounts_performance"],
          description: "Which report to fetch",
        },
        startDate: { type: "string", description: "Start date YYYY-MM-DD (inclusive)" },
        endDate: { type: "string", description: "End date YYYY-MM-DD (inclusive)" },
      },
      required: ["reportType", "startDate", "endDate"],
    },
  },

  // ─── Reviews ──────────────────────────────────────────────────────────────────
  {
    name: "list_reviews",
    description: "List product reviews. Filter by product or customer. Admins can see all reviews and delete inappropriate ones.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number", description: "Filter reviews for a specific product" },
        customerId: { type: "number", description: "Filter reviews by a specific customer" },
        page: { type: "number", description: "Page number (0-based)" },
        size: { type: "number", description: "Page size (default 10)" },
        sort: { type: "string", description: "Sort order, e.g. 'newest', 'highest_rating', 'lowest_rating'" },
      },
      required: [],
    },
  },
  {
    name: "delete_review",
    description: "Delete a review (e.g. inappropriate or spam). Confirm with the admin before deleting.",
    input_schema: {
      type: "object" as const,
      properties: {
        reviewId: { type: "number", description: "The review ID to delete" },
      },
      required: ["reviewId"],
    },
  },

  // ─── Q&A ──────────────────────────────────────────────────────────────────────
  {
    name: "list_questions",
    description: "List customer questions for a product. Use this to find unanswered questions that need a reply.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "number", description: "Product ID to fetch questions for" },
        page: { type: "number", description: "Page number (0-based, default 0)" },
        size: { type: "number", description: "Page size (default 5)" },
      },
      required: ["productId"],
    },
  },
  {
    name: "answer_question",
    description: "Post an answer to a customer's product question (as the admin/store).",
    input_schema: {
      type: "object" as const,
      properties: {
        questionId: { type: "number", description: "The question ID to answer" },
        answerText: { type: "string", description: "The answer text" },
      },
      required: ["questionId", "answerText"],
    },
  },
  {
    name: "delete_question",
    description: "Delete a customer question (e.g. spam or inappropriate). Confirm before deleting.",
    input_schema: {
      type: "object" as const,
      properties: {
        questionId: { type: "number", description: "The question ID to delete" },
      },
      required: ["questionId"],
    },
  },
  {
    name: "delete_answer",
    description: "Delete a specific answer on a product question. Confirm before deleting.",
    input_schema: {
      type: "object" as const,
      properties: {
        answerId: { type: "number", description: "The answer ID to delete" },
      },
      required: ["answerId"],
    },
  },

  // ─── Support Tickets ──────────────────────────────────────────────────────────
  {
    name: "list_support_tickets",
    description: "List customer support tickets. Admins see all tickets; filter by status, customer name, or date range.",
    input_schema: {
      type: "object" as const,
      properties: {
        customerId: { type: "number", description: "Filter tickets by a specific customer ID" },
        status: { type: "string", description: "Filter by ticket status (e.g. OPEN, IN_PROGRESS, RESOLVED, CLOSED)" },
        customerName: { type: "string", description: "Search by customer name (partial match)" },
        fromDate: { type: "string", description: "Start date YYYY-MM-DD" },
        toDate: { type: "string", description: "End date YYYY-MM-DD" },
      },
      required: [],
    },
  },
  {
    name: "update_support_ticket",
    description: "Update the status of a support ticket (e.g. mark as resolved, close it).",
    input_schema: {
      type: "object" as const,
      properties: {
        supportTicketId: { type: "number", description: "The support ticket ID" },
        status: { type: "string", description: "New status: OPEN, IN_PROGRESS, RESOLVED, or CLOSED" },
      },
      required: ["supportTicketId", "status"],
    },
  },
];

export default tools;
