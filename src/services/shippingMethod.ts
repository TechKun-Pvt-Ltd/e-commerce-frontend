import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { ShippingMethod, ShippingMethodDTO } from "@/types/domains/shipping_method";

export const createShippingMethod: ServiceFunction<ShippingMethodDTO, ShippingMethod> = (shippingMethodDto) => {
    return servicesApiClient.post('/shipping-methods', { data: shippingMethodDto });
};

export const getAllShippingMethods: ServiceFunction<[], ShippingMethod[]> = async () => {
    // return servicesApiClient.get(`/shipping-methods`);

    const mockShippingData: ShippingMethod[] = [
        {
            "id": 101,
            "name": "DHL Worldwide Express",
            "originCountry": "US",
            "originPostalCode": "10001",
            "processingTimeMin": 1,
            "processingTimeMax": 3,
            "shippingOptions": [
                {
                    "id": 201,
                    "shippingMethodId": 101,
                    "destinationCountry": "IN",
                    "carrier": "DHL Express",
                    "costFirstItem": 25.0,
                    "costAdditionalItem": 10.0,
                    "estimatedDeliveryMin": 5,
                    "estimatedDeliveryMax": 7
                },
                {
                    "id": 202,
                    "shippingMethodId": 101,
                    "destinationCountry": "TR",
                    "carrier": "DHL Express",
                    "costFirstItem": 27.0,
                    "costAdditionalItem": 12.0,
                    "estimatedDeliveryMin": 6,
                    "estimatedDeliveryMax": 9
                }
            ]
        },
        {
            "id": 102,
            "name": "FedEx International Priority",
            "originCountry": "CA",
            "originPostalCode": "M5V 3A8",
            "processingTimeMin": 2,
            "processingTimeMax": 4,
            "shippingOptions": [
                {
                    "id": 203,
                    "shippingMethodId": 102,
                    "destinationCountry": "US",
                    "carrier": "FedEx",
                    "costFirstItem": 30.0,
                    "costAdditionalItem": 15.0,
                    "estimatedDeliveryMin": 2,
                    "estimatedDeliveryMax": 4
                },
                {
                    "id": 204,
                    "shippingMethodId": 102,
                    "destinationCountry": "UK",
                    "carrier": "FedEx",
                    "costFirstItem": 32.0,
                    "costAdditionalItem": 16.0,
                    "estimatedDeliveryMin": 4,
                    "estimatedDeliveryMax": 6
                }
            ]
        },
        {
            "id": 103,
            "name": "UPS Worldwide Saver",
            "originCountry": "DE",
            "originPostalCode": "10115",
            "processingTimeMin": 1,
            "processingTimeMax": 2,
            "shippingOptions": [
                {
                    "id": 205,
                    "shippingMethodId": 103,
                    "destinationCountry": "DE",
                    "carrier": "UPS",
                    "costFirstItem": 22.5,
                    "costAdditionalItem": 9.0,
                    "estimatedDeliveryMin": 1,
                    "estimatedDeliveryMax": 2
                },
                {
                    "id": 206,
                    "shippingMethodId": 103,
                    "destinationCountry": "FR",
                    "carrier": "UPS",
                    "costFirstItem": 24.0,
                    "costAdditionalItem": 10.0,
                    "estimatedDeliveryMin": 2,
                    "estimatedDeliveryMax": 4
                }
            ]
        },
        {
            "id": 104,
            "name": "Aramex Global Solutions",
            "originCountry": "AE",
            "originPostalCode": "00000",
            "processingTimeMin": 2,
            "processingTimeMax": 3,
            "shippingOptions": [
                {
                    "id": 207,
                    "shippingMethodId": 104,
                    "destinationCountry": "AE",
                    "carrier": "Aramex",
                    "costFirstItem": 18.0,
                    "costAdditionalItem": 7.0,
                    "estimatedDeliveryMin": 1,
                    "estimatedDeliveryMax": 2
                },
                {
                    "id": 208,
                    "shippingMethodId": 104,
                    "destinationCountry": "SA",
                    "carrier": "Aramex",
                    "costFirstItem": 20.0,
                    "costAdditionalItem": 8.0,
                    "estimatedDeliveryMin": 2,
                    "estimatedDeliveryMax": 4
                }
            ]
        },
        {
            "id": 105,
            "name": "BlueDart Express India",
            "originCountry": "IN",
            "originPostalCode": "110001",
            "processingTimeMin": 1,
            "processingTimeMax": 3,
            "shippingOptions": [
                {
                    "id": 209,
                    "shippingMethodId": 105,
                    "destinationCountry": "IN",
                    "carrier": "BlueDart",
                    "costFirstItem": 10.0,
                    "costAdditionalItem": 4.0,
                    "estimatedDeliveryMin": 2,
                    "estimatedDeliveryMax": 5
                },
                {
                    "id": 210,
                    "shippingMethodId": 105,
                    "destinationCountry": "NP",
                    "carrier": "BlueDart",
                    "costFirstItem": 15.0,
                    "costAdditionalItem": 6.0,
                    "estimatedDeliveryMin": 4,
                    "estimatedDeliveryMax": 7
                }
            ]
        }
    ];

    return {
        success: true,
        data: mockShippingData
    };
};



export const updateShippingMethod: ServiceFunction<[shippingMethodId: number, shippingMethodDto: ShippingMethodDTO], ShippingMethod> = (shippingMethodId, shippingMethodDto) => {
    return servicesApiClient.put(`/shipping-methods/${shippingMethodId}`, { data: shippingMethodDto });
};

export const deleteShippingMethod: ServiceFunction<[shippingMethodId: number], void> = (shippingMethodId) => {
    return servicesApiClient.delete(`/shipping-methods/${shippingMethodId}`);
};