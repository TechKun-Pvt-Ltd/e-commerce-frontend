'use client';
import './styles/globals.css';
import { Inter } from 'next/font/google';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { Providers } from './providers';
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Your one-stop shop for all your needs",
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Provider store={store}>
            <Providers>
              <Header />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </Providers>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}

