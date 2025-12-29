"use client"
import { OrderPreviewDTO, OrderStatus } from '@/types/domains/order';
import React from 'react';
import { Calendar, Package, CreditCard, ArrowRight } from 'lucide-react';

interface OrderListProps {
    orders: OrderPreviewDTO[];
}

const getStatusColor = (status: string | OrderStatus) => {
    const statusStr = (typeof status === 'string' ? status : String(status)).toLowerCase();
    switch (statusStr) {
        case 'delivered':
            return 'bg-green-50 text-green-700 border-green-200';
        case 'cancelled':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'pending':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'processing':
        case 'confirmed':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'shipped':
            return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'out_for_delivery':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'returned':
        case 'refunded':
            return 'bg-gray-50 text-gray-700 border-gray-200';
        case 'failed':
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusIcon = (status: string | OrderStatus) => {
    const statusStr = (typeof status === 'string' ? status : String(status)).toLowerCase();
    switch (statusStr) {
        case 'delivered':
            return '✓';
        case 'cancelled':
            return '✕';
        case 'pending':
            return '⏳';
        case 'processing':
        case 'confirmed':
            return '⚙';
        case 'shipped':
            return '📦';
        case 'out_for_delivery':
            return '🚚';
        default:
            return '•';
    }
};

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    if (ordersArray.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                <p className="text-gray-500">Start shopping to create your first order</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {ordersArray.map((order) => {
                const statusStr = typeof order.status === 'string' ? order.status : order.status;
                const statusColor = getStatusColor(order.status);

                return (
                    <div
                        key={order.orderId}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        <div className="p-6">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                                            <Package className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Order ID</p>
                                            <p className="text-xl font-bold text-gray-900">#{order.orderId}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(order.orderDate)}</span>
                                    </div>
                                </div>

                                <div className={`self-start sm:self-center ${statusColor} px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2`}>
                                    <span>{getStatusIcon(order.status)}</span>
                                    <span className="capitalize">{statusStr.replace(/_/g, ' ').toLowerCase()}</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            {order.customer && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="text-sm font-medium text-gray-900">{order.customer.customerName}</p>
                                    <p className="text-xs text-gray-600">{order.customer.email}</p>
                                </div>
                            )}

                            {/* Payment Method */}
                            {order.paymentMethod && (
                                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                                    <CreditCard className="w-4 h-4" />
                                    <span>
                                        {order.paymentMethod.last4
                                            ? `Card ending in ${order.paymentMethod.last4}`
                                            : 'Payment method'
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Footer Section */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rs. {order.totalPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>

                                <a
                                    href={`/orders/${order.orderId}`}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm group"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderList;