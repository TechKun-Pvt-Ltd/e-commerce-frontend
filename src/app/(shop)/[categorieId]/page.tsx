import React from 'react'
import BannerSection from './components/BannerSection'
import ProductGrid from './components/ProductGrid'

export default function page() {
    return (

        <div className='container-responsive'>
            <BannerSection />
            <ProductGrid />
        </div>

    )
}