import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Metadata } from "next";
import ReduxProvider from './ReduxProvider';
import { AppGateway } from './AppGateway';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
    title: "E-Commerce Store",
    description: "Your one-stop shop for all your needs",
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-headline',
    weight: ['400', '600', '700', '800'],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${plusJakarta.variable} ${inter.className} overflow-x-hidden`}
                style={{ width: '100vw' }}
            >
                <NextTopLoader
                    color="#000"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={true}
                    easing="ease"
                    speed={200}
                />
                <ReduxProvider>
                    <AppGateway>
                        {children}
                    </AppGateway>
                </ReduxProvider>
            </body>
        </html>
    );
}

