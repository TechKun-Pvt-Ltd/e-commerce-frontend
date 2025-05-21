"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, Trash, X } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CartItemPreview } from "@/types/domains/cart";
import { updateCart } from "@/store/slices/cartSlice";

const mockCartItems: CartItemPreview[] = [
    {
        cartItemId: 1,
        addedAt: new Date(),
        imageUrl: "https://drive.google.com/uc?export=view&id=1P5LsB3Kl1wb0j_D8BrkhVJetaSRqdTMX",
        title: "iPhone X",
        productVariantId: 2001,
        price: 299.99,
        sku: "IPHONE-X-64GB-BLK",
        quantityInStock: 10,
        quantity: 1
    },
    {
        cartItemId: 2,
        addedAt: new Date(),
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        title: "Dell Latitude",
        productVariantId: 2001,
        price: 349.99,
        sku: "DELL-LAT-5420-i5",
        quantityInStock: 15,
        quantity: 1
    },
    {
        cartItemId: 3,
        addedAt: new Date(),
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        title: "Lenovo Pro",
        productVariantId: 2001,
        price: 279.99,
        sku: "LEN-PRO-T14-i7",
        quantityInStock: 12,
        quantity: 1
    },
    {
        cartItemId: 4,
        addedAt: new Date(),
        imageUrl: "https://img.freepik.com/premium-photo/young-woman-order-purchase-product-internet-using-laptop-blithe_31965-289001.jpg?w=996",
        title: "Laptop Pro",
        productVariantId: 2002,
        price: 499.99,
        sku: "LAP-PRO-2023-i9",
        quantityInStock: 8,
        quantity: 1
    }
];

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

export default function CartToast() {
    const dispatch = useAppDispatch();
    const { items: cartItems, totalItems, totalAmount } = useAppSelector(state => state.cart);
    const [exitAnimationIndex, setExitAnimationIndex] = React.useState<number>();
    const listRef = useRef<HTMLUListElement>(null);
    const prevLengthRef = useRef(cartItems.length);

    // useEffect(() => {
    //     dispatch(updateCart(mockCartItems));
    // }, []);

    useEffect(() => {
        if ((cartItems.length > prevLengthRef.current) && listRef.current)
            listRef.current.scrollTo({behavior: "smooth", top: listRef.current.scrollHeight});

        prevLengthRef.current = cartItems.length;
    }, [cartItems]);

    function closeToast() {
        toast.dismiss('cart-toast');
    };

    return <div className='w-full'>
        <div className='px-4 py-4 border-b flex items-center justify-between'>
            <h3 className='text-base'>Cart Items</h3>
            <X size="20" className='text-gray-600 hover:text-gray-900' onClick={closeToast} />
        </div>
        <ul ref={listRef} className='px-4 w-full border-b divide-y max-h-56 overflow-y-auto thin-scrollbar'>
            {cartItems.map((item, i) => (
                <li key={item.cartItemId} className={`w-full ${
                    i === exitAnimationIndex ?
                        "animate-out zoom-out-95 fade-out-0 duration-300":
                        "animate-in zoom-in-95 fade-in-0 slide-in-from-top-2 duration-500"
                    } flex items-center justify-between py-4`
                } onAnimationEnd={(animationEvent) => {
                    if (animationEvent.animationName !== "exit")
                        return;

                    const newCartItems = [...cartItems];
                    newCartItems.splice(i, 1);
                    if (newCartItems.length === 0)
                        closeToast();
                    dispatch(updateCart(newCartItems));
                    setExitAnimationIndex(undefined);
                }}>
                    <div className='flex items-center gap-2.5 w-5/12'>
                        <Image
                            src={item.imageUrl!}
                            alt={item.title}
                            width={50}
                            height={50}
                            className="rounded w-10 h-auto aspect-square object-cover"
                        />
                        <div className='w-full overflow-hidden'>
                            <h4 className="font-medium text-base overflow-hidden whitespace-nowrap text-ellipsis">{item.title}</h4>
                            <p className="font-normal text-sm text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis">{item.sku}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className="flex items-center gap-2">
                            <Minus size="28"
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => {
                                    if (item.quantity <= 1)
                                        return;

                                    item.quantity -= 1;
                                    const newCartItems = [...cartItems];
                                    newCartItems[i] = item;
                                    dispatch(updateCart(newCartItems));
                                }}
                            />
                            <span className="min-w-[0.8rem] font-normal text-center">{item.quantity}</span>
                            <Plus size="28"
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => {
                                    if (item.quantity >= item.quantityInStock)
                                        return;

                                    item.quantity += 1;
                                    const newCartItems = [...cartItems];
                                    newCartItems[i] = item;
                                    dispatch(updateCart(newCartItems));
                                }}
                            />
                        </div>
                        <p className="w-[5rem] text-base text-right">{formatter.format(item.price * item.quantity)}</p>
                        <Button variant="ghost" size="icon"
                            onClick={() => setExitAnimationIndex(i)}
                        >
                            <Trash />
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
        <div className="px-4 pt-3 pb-4">
            <div className='mb-3 flex items-end justify-between font-medium'>
                <div className='text-base text-gray-700'>Total {totalItems} items</div>
                <div className="text-lg text-right">{formatter.format(totalAmount)}</div>
            </div>
            <div className="flex gap-2">
                <Button className="flex-1" variant="outline" size="sm">Go to Cart</Button>
                <Button className="flex-1" variant="default" size="sm">Place Order</Button>
            </div>
        </div>
    </div>;
}