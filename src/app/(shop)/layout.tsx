import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function StoreLayout({children}: {children: React.ReactNode}) {
    return (
      <ErrorBoundary>
        <>
          <Header />
          <main className="pt-[5rem] overflow-x-clip">
            {children}
          </main>
          <Footer />
        </>
      </ErrorBoundary>
    );
}