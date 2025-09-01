
import React from 'react'
import BannerSection from './components/BannerSection'
import ProductGrid from './components/ProductGrid'
import BestSeller from './components/BestSeller'

export default function page() {
    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid />
            <BestSeller />
        </div>
    )
}