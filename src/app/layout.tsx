import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from "next";
import ReduxProvider from './ReduxProvider';
import { AppGateway } from './AppGateway';

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
            <body className={`${inter.className} overflow-x-hidden`} style={{width: '100vw'}}>
                <ReduxProvider>
                    <AppGateway>
                        {children}
                    </AppGateway>
                </ReduxProvider>
            </body>
        </html>
    );
}

