"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pen, Trash, MapPin, Truck, DollarSign } from "lucide-react";
import { ShippingMethod } from "@/types/domains/shipping_method";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

function ShippingItem({ shippingMethod, onEdit, onDelete }: {
    shippingMethod: ShippingMethod;
    onEdit: (shippingMethod: ShippingMethod) => void;
    onDelete: (shippingMethod: ShippingMethod) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    const nodeTitleEl = (
        <span className="font-medium text-gray-800 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {shippingMethod.name}
        </span>
    );

    return <div>
        <div className="border rounded-md h-9 bg-background pr-2.5 transition-colors duration-500 flex items-center justify-between">
            <div className="pl-2.5 min-w-0 flex items-center gap-1.5">
                {shippingMethod.shippingOptions.length === 0 ?
                    <Tooltip>
                        <TooltipTrigger className="p-1 opacity-50">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>No shipping options added</p>
                        </TooltipContent>
                    </Tooltip>:
                    <Button variant="ghost"
                        size={"none" as Parameters<typeof Button>[0]["size"]}
                        className="px-1 py-1"
                        onClick={() => setCollapsed(prev => !prev)}
                    >
                        {collapsed ?
                            <ChevronRight className="w-4 h-4 text-gray-600" /> :
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        }
                    </Button>
                }
                {nodeTitleEl}
            </div>
            <div className="flex gap-2">
                <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-2 h-6 text-sm"
                    onClick={() => onEdit(shippingMethod)}
                >
                    <Pen style={{ width: '0.85rem', height: '0.85rem' }} className="text-gray-600" />
                    <span className="text-gray-600">Edit</span>
                </Button>
                <Button variant="ghost"
                    size={"none" as Parameters<typeof Button>[0]["size"]}
                    className="px-1 h-6"
                    onClick={() => onDelete(shippingMethod)}
                >
                    <Trash className="w-4 h-4 text-gray-600" />
                </Button>
            </div>
        </div>

        {!!shippingMethod.shippingOptions.length && <div hidden={collapsed} className="ml-5 mt-1 pl-4 py-1.5 border-l border-gray-300 space-y-2">
            {shippingMethod.shippingOptions.map((option, index) => (
                <div key={option.id || index} className="border rounded-md h-auto bg-background pr-2.5 py-2 transition-colors duration-500 flex items-center justify-between">
                    <div className="pl-3.5 flex items-center gap-3 overflow-hidden flex-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium whitespace-nowrap">{option.destination_country}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                            <Truck className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">{option.carrier}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium">{option.cost_first_item.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>}
    </div>;
};

export default React.memo(ShippingItem);