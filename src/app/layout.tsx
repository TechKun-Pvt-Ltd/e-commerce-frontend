import "@/app/styles/globals.scss"; // Ensure the correct path
import Footer from "./layout/Footer";
import Header from "./layout/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

