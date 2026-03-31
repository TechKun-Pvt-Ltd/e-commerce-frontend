/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoriesBar from '../components/CategoriesBar';

export default function StoreLayout({children}: {children: React.ReactNode}) {
    return (<>
        <Header />
        {/* <CategoriesBar /> */}
        <main>
            {children}
        </main>
        <Footer />
    </>);
}