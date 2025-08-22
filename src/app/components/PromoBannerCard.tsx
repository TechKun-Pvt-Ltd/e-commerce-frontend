import { Button } from '@/components/ui/button'
import React from 'react'



export default function PromoBannerCard() {
    return (
        <div className='responsive-container w-full h-[520px] '>
            <div className='flex flex-row justify-center  h-full gap-8 '>
                <div className=' flex flex-col items-center justify-center gap-4'>

                    <h1 className='text-3xl text-center mb-6'>80% OFF on Figurines</h1>
                    <Button variant="ghost" className="w-32 hover:bg-black  rounded-full  my-4 text-black hover:text-white border p-4 border-black">
                        Shop Now
                    </Button>

                </div>
                <div className='hidden md:block'>
                    <div className='flex gap-6 p-8 '>
                        <img className='w-[200px] h-[300px] ' src="https://i.pinimg.com/736x/f4/5c/36/f45c3603aaf44bf6c97ea64ae0f64c46.jpg" />
                        <img className='w-[200px] h-[300px] relative top-38' src="https://i.pinimg.com/736x/a2/04/82/a20482c072133079acca7686428e31ae.jpg" />
                        <img className='w-[200px] h-[300px] ' src="https://i.pinimg.com/736x/98/a5/39/98a539360514ea653e04c55bec6734ee.jpg" />
                        <img className='w-[200px] h-[300px] relative top-38' src="https://i.pinimg.com/736x/ab/ce/81/abce81f2c6534c95e60e7c6aa3a807d1.jpg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
