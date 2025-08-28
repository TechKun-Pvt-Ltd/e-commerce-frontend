
import React from 'react'
import BannerSection from './components/BannerSection'
import ProductGrid from './components/ProductGrid'
import ProductCarousel from './components/ProductCarousel'

export default function page() {
    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid />
            <ProductCarousel />
        </div>
    )
}