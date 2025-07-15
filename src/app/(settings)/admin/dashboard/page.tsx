"use client";
import React, { useState } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
} from "lucide-react";

import { subDays } from "date-fns";
import { TopCustomersTable } from "./components/TopCustomersTable";
import { DiscountsTable } from "./components/DiscountTable";
import { OrdersChart } from "./components/OrderChart";
import { SalesChart } from "./components/SalesChart";
import { MetricCard } from "./components/MatricCard";
import { DateRangeSelector } from "./components/DateRangeSelector";
import useDataFetch from "@/hooks/use-data-fetch";

const mockSalesData = {
  totalSales: 145280,
  totalOrders: 892,
  averageOrderValue: 163,
  salesByPeriod: [
    { period: "Jan", sales: 12500 },
    { period: "Feb", sales: 15800 },
    { period: "Mar", sales: 18200 },
    { period: "Apr", sales: 22100 },
    { period: "May", sales: 19800 },
    { period: "Jun", sales: 25400 },
    { period: "Jul", sales: 31200 }
  ]
};

const mockCategoriesData = {
  totalRevenue: 145280,
  totalUnitsSold: 2847,
  categories: [
    { categoryId: 1, categoryName: "Electronics", unitsSold: 645, revenue: 45200 },
    { categoryId: 2, categoryName: "Clothing", unitsSold: 892, revenue: 32800 },
    { categoryId: 3, categoryName: "Home & Garden", unitsSold: 523, revenue: 28900 },
    { categoryId: 4, categoryName: "Sports", unitsSold: 387, revenue: 18600 },
    { categoryId: 5, categoryName: "Books", unitsSold: 400, revenue: 19780 }
  ]
};

const mockCustomersData = {
  customersOnboarded: 156,
  activeCustomers: 1245,
  topCustomers: [
    {
      userId: 1,
      fullName: "Sarah Johnson",
      totalSpent: 2850,
      orderedItems: 12,
      phoneNo: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      address: {}
    },
    {
      userId: 2,
      fullName: "Michael Chen",
      totalSpent: 2320,
      orderedItems: 8,
      phoneNo: "+1 (555) 234-5678",
      email: "michael.chen@email.com",
      address: {}
    },
    {
      userId: 3,
      fullName: "Emily Rodriguez",
      totalSpent: 1980,
      orderedItems: 15,
      phoneNo: "+1 (555) 345-6789",
      email: "emily.rodriguez@email.com",
      address: {}
    },
    {
      userId: 4,
      fullName: "David Thompson",
      totalSpent: 1750,
      orderedItems: 6,
      phoneNo: "+1 (555) 456-7890",
      email: "david.thompson@email.com",
      address: {}
    }
  ]
};

const mockProductsData = {
  totalViews: 45280,
  totalPurchases: 2847,
  totalRevenue: 145280,
  averageConversionRate: 6.3,
  averageReturnRate: 2.1,
  averageOrderValue: 163,
  products: [
    {
      productId: 1,
      productTitle: "Wireless Bluetooth Headphones",
      views: 5420,
      purchases: 892,
      conversionRate: 16.5,
      returnRate: 1.2,
      unitsSold: 892,
      revenue: 35680
    },
    {
      productId: 2,
      productTitle: "Smart Fitness Watch",
      views: 4280,
      purchases: 523,
      conversionRate: 12.2,
      returnRate: 2.8,
      unitsSold: 523,
      revenue: 28900
    },
    {
      productId: 3,
      productTitle: "Premium Coffee Maker",
      views: 3190,
      purchases: 245,
      conversionRate: 7.7,
      returnRate: 1.6,
      unitsSold: 245,
      revenue: 19600
    },
    {
      productId: 4,
      productTitle: "Organic Cotton T-Shirt",
      views: 2890,
      purchases: 387,
      conversionRate: 13.4,
      returnRate: 3.1,
      unitsSold: 387,
      revenue: 11610
    }
  ]
};

const mockOrdersData = [
  { status: "completed", count: 756 },
  { status: "pending", count: 89 },
  { status: "processing", count: 34 },
  { status: "cancelled", count: 13 }
];

const mockDiscountsData = {
  totalRevenueInfluenced: 28540,
  averageOrderValue: 184,
  discounts: [
    {
      discountCode: "SUMMER20",
      timesUsed: 156,
      revenueInfluenced: 12480,
      averageOrderValue: 192
    },
    {
      discountCode: "NEWUSER10",
      timesUsed: 89,
      revenueInfluenced: 8920,
      averageOrderValue: 176
    },
    {
      discountCode: "FREESHIP",
      timesUsed: 234,
      revenueInfluenced: 7140,
      averageOrderValue: 168
    }
  ]
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DateRangeSelector 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange} 
            />
           
          </div>
        </div>
       
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Sales"
                value={`$${mockSalesData.totalSales.toLocaleString()}`}
                change={12.5}
                icon={<DollarSign className="h-5 w-5" />}
                iconColor="bg-orange-100 text-orange-600"
              />
              <MetricCard
                title="Total Orders"
                value={mockSalesData.totalOrders.toLocaleString()}
                change={8.2}
                icon={<ShoppingCart className="h-5 w-5" />}
                iconColor="bg-blue-100 text-blue-600"
              />
              <MetricCard
                title="New Customers"
                value={mockCustomersData.customersOnboarded}
                change={15.8}
                icon={<Users className="h-5 w-5" />}
                iconColor="bg-green-100 text-green-600"
              />
              <MetricCard
                title="Operations"
                value={mockProductsData.totalPurchases.toLocaleString()}
                change={-19}
                icon={<Package className="h-5 w-5" />}
                iconColor="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SalesChart data={mockSalesData.salesByPeriod} />
              <OrdersChart data={mockOrdersData} />
            </div>

            {/* Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TopCustomersTable customers={mockCustomersData.topCustomers} />
              <DiscountsTable discounts={mockDiscountsData.discounts} />
            </div>
          

         
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Views"
                value={mockProductsData.totalViews.toLocaleString()}
                change={22.1}
                icon={<Eye className="h-5 w-5" />}
                iconColor="bg-blue-100 text-blue-600"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${mockProductsData.averageConversionRate}%`}
                change={5.3}
                icon={<Percent className="h-5 w-5" />}
                iconColor="bg-green-100 text-green-600"
              />
              <MetricCard
                title="Active Customers"
                value={mockCustomersData.activeCustomers.toLocaleString()}
                change={18.7}
                icon={<Users className="h-5 w-5" />}
                iconColor="bg-purple-100 text-purple-600"
              />
              <MetricCard
                title="Discount Impact"
                value={`$${mockDiscountsData.totalRevenueInfluenced.toLocaleString()}`}
                change={9.4}
                icon={<Tag className="h-5 w-5" />}
                iconColor="bg-orange-100 text-orange-600"
              />
            </div> */}

    
            {/* <div className="grid gap-4 md:grid-cols-4">
              {mockOrdersData.map((order) => (
                <MetricCard
                  key={order.status}
                  title={`${order.status.charAt(0).toUpperCase() + order.status.slice(1)} Orders`}
                  value={order.count.toLocaleString()}
                  icon={<Package className="h-5 w-5" />}
                  iconColor="bg-gray-100 text-gray-600"
                />
              ))}
            </div> */}
       

         
      </div>
    </div>
  );
}