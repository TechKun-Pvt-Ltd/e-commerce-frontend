import servicesApiClient from "@/lib/services-api-client";
import { ServiceFunction } from "@/types/api";
import { CategoriesPerformanceResponse, CustomersReportResponse, DateRange, DiscountsPerformanceResponse, OrdersReportResponse, ProductsPerformanceResponse, SalesReportResponse } from "@/types/domains/reports";
// API Service Functions
export const getSalesReport: ServiceFunction<DateRange, SalesReportResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/sales', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};

export const getCategoriesPerformanceReport: ServiceFunction<DateRange, CategoriesPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/categories-performance', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};

export const getOrdersReport: ServiceFunction<DateRange, OrdersReportResponse[]> = (dateRange) => {
    return servicesApiClient.get('/reports/orders', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};

export const getCustomersReport: ServiceFunction<DateRange, CustomersReportResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/customers', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};

export const getProductsPerformanceReport: ServiceFunction<DateRange, ProductsPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/products-performance', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};

export const getDiscountsPerformanceReport: ServiceFunction<DateRange, DiscountsPerformanceResponse> = (dateRange) => {
    return servicesApiClient.get('/reports/discounts-performance', { 
        params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
        } 
    });
};