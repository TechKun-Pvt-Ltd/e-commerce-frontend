import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from "next";
import Providers from './Providers';
import { Wrapper } from './Wrapper';

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
                <Providers>
                    <Wrapper>
                        {children}
                    </Wrapper>
                </Providers>
            </body>
        </html>
    );
}

