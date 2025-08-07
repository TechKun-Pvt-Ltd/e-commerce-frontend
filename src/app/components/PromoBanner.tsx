'use client'

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'

const promos = [
  {
    title: 'Flash Sale: Up to 50% Off',
    description: 'Don’t miss out on our flash sale event! Enjoy up to 50% off on our best-sellers.',
  },
  {
    title: 'Buy 1 Get 1 Free',
    description: 'Limited-time offer! Buy one and get one free on select items.',
  },
  {
    title: 'Free Shipping Over ₹999',
    description: 'Enjoy free shipping on all orders above ₹999.',
  },
]

export default function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationClass, setAnimationClass] = useState('translate-x-full')
  const [show, setShow] = useState(true)

  useEffect(() => {
    let slideTimeout: NodeJS.Timeout

    const startSlide = () => {
      // Step 1: Enter from right
      setAnimationClass('translate-x-full')
      setShow(true)

      setTimeout(() => {
        setAnimationClass('translate-x-0') // Move to center
      }, 50)

      // Step 2: Stay centered for 3s, then slide out left
      slideTimeout = setTimeout(() => {
        setAnimationClass('-translate-x-full')
      }, 3000) // Center stay duration

      // Step 3: After sliding out, prepare next
      setTimeout(() => {
        setShow(false)
        setCurrentIndex((prev) => (prev + 1) % promos.length)
      }, 3500) // Exit ends
    }

    startSlide()

    const interval = setInterval(startSlide, 4000) // Total cycle: 4s (fast)

    return () => {
      clearInterval(interval)
      clearTimeout(slideTimeout)
    }
  }, [])

  return (
    <div className='w-full h-[55vh] bg-[url("https://i.pinimg.com/736x/61/d1/b7/61d1b7f6533bafe362bd3a22da61607d.jpg")] bg-no-repeat bg-cover bg-center relative overflow-hidden'>
      <div className='bg-black/60 w-full h-full flex justify-center items-center overflow-hidden relative'>
        {show && (
          <div
            className={`
              absolute text-center space-y-6 w-full px-4 transition-all duration-300 ease-in-out
              ${animationClass}
            `}
          >
            <h1 className='text-5xl text-white font-bold'>
              {promos[currentIndex].title}
            </h1>
            <p className='text-white max-w-[700px] mx-auto'>
              {promos[currentIndex].description}
            </p>
            <Button
              variant="ghost"
              className="hover:bg-white rounded-full text-white border p-4 border-white"
            >
              Shop Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
