// app/(shop)/about-us/page.tsx
import { Metadata } from "next";
import Feature from "../../products/components/Feature";

export const metadata: Metadata = {
  title: "About Us | Kavengo - Premium Frames & Art Prints",
  description:
    "Learn about Kavengo – your destination for premium wall art, glass décor, textiles, and furniture. We bring craftsmanship and elegance to every home.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="responsive-container relative text-center">
          <span className="inline-block bg-white text-gray-900 text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Crafting Design That <br />
            <span className="text-gray-300">Tells Your Story</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            From minimalist interiors to bold artistic statements — Kavengo brings ideas to life.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-12">
        <div className="responsive-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "In-house", label: "Production" },
            { value: "Premium", label: "Materials" },
            { value: "Global", label: "Shipping" },
            { value: "Curated", label: "Designs" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section - English */}
      <section className="py-20 border-b border-gray-100">
        <div className="responsive-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 block">
                Who We Are (English)
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                About Kavengo
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed font-semibold">
                Kavengo is more than a décor brand — it’s a production-driven design studio.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We specialize in creating high-quality printed products, from wall art and glass décor to textiles and furniture pieces. Every item is produced in our own facility using advanced printing technologies and carefully selected materials.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Mission:</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                To make stylish, high-quality home décor accessible to everyone.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With a wide product range and the ability to customize designs, we help our customers turn their living spaces into personal expressions of style. From minimalist interiors to bold artistic statements — Kavengo brings ideas to life.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/banner-image/ArtDrawing-removebg-preview.png"
                alt="Kavengo Studio"
                className="w-full max-w-2xl object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Turkish */}
      <section className="py-20 bg-gray-50">
        <div className="responsive-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 flex items-center justify-center">
               {/* Optional second image or placeholder graphic */}
               <div className="w-full max-w-xl aspect-square bg-gray-200 rounded-3xl flex items-center justify-center opacity-70">
                 <span className="text-5xl">🎨</span>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 block">
                Biz Kimiz (Türkçe)
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Hakkımızda
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed font-semibold">
                Kavengo, sadece bir dekor markası değil; üretim odaklı bir tasarım stüdyosudur.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Duvar tablolarından cam baskılara, tekstil ürünlerinden mobilyalara kadar geniş bir ürün yelpazesinde yüksek kaliteli baskı ürünleri üretiyoruz. Tüm ürünlerimiz kendi üretim tesisimizde, ileri teknoloji baskı sistemleri ve özenle seçilmiş malzemeler kullanılarak hazırlanır.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Misyonumuz:</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Şık ve kaliteli dekorasyonu herkes için ulaşılabilir hale getirmek.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Kavengo ile yaşam alanlarınızı kişisel tarzınızın bir yansımasına dönüştürebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-4 bg-white">
        <div className="responsive-container">
          <Feature />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="responsive-container text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Get in Touch / İletişime Geçin
          </h2>
          <p className="text-gray-500 mb-6">
            We're here to help you create your dream space.
          </p>
          <a
            href="/support"
            className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
