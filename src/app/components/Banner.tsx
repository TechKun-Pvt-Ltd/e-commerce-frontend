import { Button } from '@/components/ui/button'
import { url } from 'inspector'
import React from 'react'

export default function Banner() {
    return (
        <div style={{ background: `url('/banner-image/banner.jpg')` }} className='w-full h-[85vh]'>
            <div className='bg-black/60 w-full h-full'>
                <div className='flex flex-col justify-center items-center h-full space-y-8'>
                    <p className='text-white tracking-widest'>
                        FIND YOUR BEST PRODUCTS
                    </p>
                    <h1 className='text-5xl font-bold text-white'>
                        Welcome to E-Commerce Store
                    </h1>
                    <Button variant="ghost" className=" hover:bg-white rounded-full text-white border p-4 border-white">
                        Shop Now
                    </Button>
                </div>
            </div>
        </div>

    )
}
