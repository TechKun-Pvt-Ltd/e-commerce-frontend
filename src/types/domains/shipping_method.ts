export interface ShippingOption {
  id?: number;
  profile_id?: number;
  destination_country: string;
  carrier: string;
  cost_first_item: number;
}

export interface ShippingMethod {
  id: number;
  seller_id: number;
  name: string;
  shippingOptions: ShippingOption[];
}

export interface ShippingMethodDTO {
  seller_id: number;
  name: string;
  shippingOptions: ShippingOption[];
}

export interface ShippingMethodUpdationPayload {
  name: string;
  seller_id: number;
  shippingOptions: ShippingOption[];
}