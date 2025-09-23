
import React from 'react'
import BannerSection from '../products/Components/BannerSection'
import ProductGrid from '../products/Components/ProductGrid'
import BestSeller from '../products/Components/BestSeller'

export default function page() {
    return (
        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid />
            <BestSeller />
        </div>
    )
}