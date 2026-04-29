import axios from "axios";

const BASE = process.env.SERVER_URL!;

function authHeaders(token?: string) {
  return {
    Authorization: `Bearer ${token ?? ""}`,
    "Content-Type": "application/json",
  };
}

async function call(
  method: string,
  path: string,
  token: string | undefined,
  data?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<unknown> {
  try {
    const res = await axios({
      method,
      url: `${BASE}${path}`,
      headers: authHeaders(token),
      data,
      params,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = err.response.data?.error ?? err.response.data?.message ?? JSON.stringify(err.response.data);
      throw new Error(`Backend error ${err.response.status}: ${msg}`);
    }
    throw err;
  }
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  token: string | undefined
): Promise<unknown> {
  switch (name) {
    // ─── Products ───────────────────────────────────────────────────────────────
    case "list_products":
      return call("GET", "/products", token, {
        searchInput: input.searchInput ?? "",
        categoryId: input.categoryId ?? null,
        priceRangeMin: input.priceRangeMin ?? null,
        priceRangeMax: input.priceRangeMax ?? null,
        sortOption: input.sortOption ?? null,
      });

    case "get_product":
      return call("GET", `/products/${input.productId}`, token);

    case "create_product":
      return call("POST", "/products", token, input);

    case "update_product": {
      const { productId, ...body } = input;
      return call("PUT", `/products/${productId}`, token, body);
    }

    case "patch_product": {
      const { productId, ...body } = input;
      return call("PATCH", `/products/${productId}`, token, body);
    }

    case "patch_variant": {
      const { productId, variantId, ...body } = input;
      return call("PATCH", `/products/${productId}/variants/${variantId}`, token, body);
    }

    case "add_product_image": {
      const { productId, ...body } = input;
      return call("POST", `/products/${productId}/images`, token, body);
    }

    case "set_default_image":
      return call("PUT", `/products/${input.productId}/images/${input.productImageId}`, token);

    case "delete_product_image":
      return call("DELETE", `/products/images/${input.productImageId}`, token);

    case "duplicate_product":
      return call("POST", `/products/${input.productId}/duplicate`, token);

    case "bulk_create_products":
      return call("POST", "/products/bulk", token, input.products);

    case "get_low_stock_products":
      return call("GET", "/products/low-stock", token, undefined, {
        threshold: (input.threshold as number) ?? 5,
      });

    case "preview_product_code":
      return call("GET", "/products/code-preview", token, undefined, {
        title: input.title as string,
      });

    case "delete_product":
      return call("DELETE", `/products/${input.productId}`, token);

    // ─── Categories ─────────────────────────────────────────────────────────────
    case "list_categories":
      return call("GET", "/categories", token);

    case "search_categories":
      return call("GET", "/categories/search", token, undefined, {
        name: input.name as string,
      });

    case "get_category":
      return call("GET", `/categories/${input.categoryId}`, token);

    case "create_category":
      return call("POST", "/categories", token, {
        name: input.name,
        code: input.code,
        parentCategoryId: input.parentCategoryId
          ? { value: input.parentCategoryId, present: true }
          : { value: null, present: false },
        variationIds: input.variationIds ?? [],
        attributeIds: input.attributeIds ?? [],
        imageUrl: input.imageUrl
          ? { value: input.imageUrl, present: true }
          : { value: null, present: false },
      });

    case "update_category": {
      const { categoryId, ...rest } = input;
      const body: Record<string, unknown> = {};
      if (rest.name) body.name = rest.name;
      if (rest.code) body.code = rest.code;
      if (rest.variationIds !== undefined) body.variationIds = rest.variationIds;
      if (rest.attributeIds !== undefined) body.attributeIds = rest.attributeIds;
      if (rest.parentCategoryId !== undefined)
        body.parentCategoryId = rest.parentCategoryId !== null
          ? { value: rest.parentCategoryId, present: true }
          : { value: null, present: false };
      if (rest.imageUrl !== undefined)
        body.imageUrl = rest.imageUrl
          ? { value: rest.imageUrl, present: true }
          : { value: null, present: false };
      return call("PUT", `/categories/${categoryId}`, token, body);
    }

    case "delete_category":
      return call("DELETE", `/categories/${input.categoryId}`, token);

    // ─── Variations ─────────────────────────────────────────────────────────────
    case "list_variations":
      return call("GET", "/variations", token, undefined,
        input.categoryId ? { categoryId: input.categoryId as number } : undefined
      );

    case "create_variation":
      return call("POST", "/variations", token, input);

    case "update_variation": {
      const { variationId, ...body } = input;
      return call("PUT", `/variations/${variationId}`, token, body);
    }

    case "delete_variation":
      return call("DELETE", `/variations/${input.variationId}`, token);

    // ─── Attributes ─────────────────────────────────────────────────────────────
    case "list_attributes":
      return call("GET", "/attributes", token);

    case "create_attribute":
      return call("POST", "/attributes", token, input);

    case "update_attribute": {
      const { attributeId, ...body } = input;
      return call("PUT", `/attributes/${attributeId}`, token, body);
    }

    case "delete_attribute":
      return call("DELETE", `/attributes/${input.attributeId}`, token);

    // ─── Shipping Methods ───────────────────────────────────────────────────────
    case "list_shipping_methods":
      return call("GET", "/shipping-methods", token, undefined,
        input.originCountry ? { country: input.originCountry as string } : undefined
      );

    case "create_shipping_method":
      return call("POST", "/shipping-methods", token, input);

    case "update_shipping_method": {
      const { shippingMethodId, ...body } = input;
      return call("PUT", `/shipping-methods/${shippingMethodId}`, token, body);
    }

    case "delete_shipping_method":
      return call("DELETE", `/shipping-methods/${input.shippingMethodId}`, token);

    // ─── Promotions ─────────────────────────────────────────────────────────────
    case "list_promotions":
      return call("GET", "/promotions", token);

    case "create_promotion":
      return call("POST", "/promotions", token, input);

    case "update_promotion": {
      const { promotionId, ...body } = input;
      return call("PUT", `/promotions/${promotionId}`, token, body);
    }

    case "delete_promotion":
      return call("DELETE", `/promotions/${input.promotionId}`, token);

    // ─── Orders ─────────────────────────────────────────────────────────────────
    case "list_orders": {
      const params: Record<string, string | number | boolean> = {
        page: (input.page as number) ?? 0,
        size: (input.size as number) ?? 10,
      };
      if (input.customerId) params.customerId = input.customerId as number;
      return call("GET", "/shop-orders", token, input.status ? { status: input.status } : undefined, params);
    }

    case "get_order":
      return call("GET", `/shop-orders/${input.shopOrderId}`, token);

    case "update_order_status": {
      const { shopOrderId, ...body } = input;
      return call("PATCH", `/shop-orders/${shopOrderId}/status`, token, body);
    }

    // ─── Users ──────────────────────────────────────────────────────────────────
    case "list_users": {
      const body: Record<string, unknown> = {};
      if (input.fullName) body.fullName = input.fullName;
      if (input.email) body.email = input.email;
      if (input.phoneNo) body.phoneNo = input.phoneNo;
      return call("GET", "/users", token, Object.keys(body).length ? body : undefined);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
