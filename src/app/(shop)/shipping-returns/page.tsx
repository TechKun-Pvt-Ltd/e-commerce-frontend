// app/(shop)/shipping-returns/page.tsx
import { Metadata } from "next";
import TableOfContents from "./TableOfContents";

export const metadata: Metadata = {
  title: "Shipping & Returns | Kavengo",
  description:
    "Distance Sales Agreement and Shipping & Return Policy for Kavengo.",
};

const sections = [
  {
    title: "1. Distance Sales Agreement (English)",
    content: [
      "This Distance Sales Agreement (“Agreement”) is entered into between Kavengo (“Seller”) and the customer (“Buyer”) for the purchase of products through the website.",
      "**1. Subject**\nThis Agreement regulates the rights and obligations of the parties regarding the sale and delivery of products ordered electronically.",
      "**2. Product Information**\nAll product features, prices, and delivery details are clearly stated on the product page. The Buyer confirms reviewing these details before purchase.",
      "**3. Order & Payment**\nOrders are processed after payment confirmation. Kavengo reserves the right to cancel orders in case of pricing errors or suspicious transactions.",
      "**4. Production Process**\nMost products are made-to-order. Production begins after order confirmation.",
      "**5. Delivery**\nOrders are shipped within the estimated production and delivery time stated on the website. Delays caused by logistics providers are beyond our control.",
      "**6. Right of Withdrawal**\n• Standard products: 14-day return right \n• Custom/personalized products: Non-refundable",
      "**7. Liability**\nKavengo is not responsible for damages caused by misuse of products.",
      "**8. Dispute Resolution**\nApplicable laws depend on the buyer’s country of residence."
    ],
  },
  {
    title: "2. Mesafeli Satış Sözleşmesi (Türkçe)",
    content: [
      "İşbu sözleşme, Kavengo ile alıcı arasında elektronik ortamda gerçekleştirilen satışlara ilişkin hak ve yükümlülükleri düzenler.",
      "**1. Konu**\nBu sözleşme, sipariş edilen ürünlerin satışı ve teslimine ilişkin şartları kapsar.",
      "**2. Ürün Bilgileri**\nÜrün özellikleri, fiyat ve teslimat bilgileri ürün sayfasında belirtilmiştir.",
      "**3. Sipariş & Ödeme**\nSiparişler ödeme onayından sonra işleme alınır.",
      "**4. Üretim**\nÜrünlerin büyük kısmı sipariş üzerine üretilmektedir.",
      "**5. Teslimat**\nTeslimat süreleri tahmini olup kargo kaynaklı gecikmelerden firma sorumlu değildir.",
      "**6. Cayma Hakkı**\n• Standart ürünlerde 14 gün \n• Kişiye özel ürünlerde iade yoktur"
    ],
  },
  {
    title: "3. Shipping & Return Policy (English)",
    content: [
      "**📦 Production & Shipping**\nAll products are produced in-house.\nProduction time: 2–5 business days\nDelivery time: 5–10 business days (varies by location)",
      "**🌍 International Shipping**\nWe ship worldwide. Customs duties may apply depending on your country.",
      "**🔄 Returns**\nWe accept returns within 14 days for standard products.\nConditions:\n• Product must be unused \n• Original packaging required",
      "**❌ Non-returnable Items**\n• Custom/personalized products \n• Made-to-order items",
      "**📦 Damaged Orders**\nIf your product arrives damaged, contact us within 48 hours with photos."
    ],
  },
  {
    title: "4. Kargo ve İade Politikası (Türkçe)",
    content: [
      "**📦 Üretim & Kargo**\nTüm ürünler sipariş üzerine üretilir.\nÜretim süresi: 2–5 iş günü\nTeslimat: 5–10 iş günü",
      "**🌍 Uluslararası Gönderim**\nDünya geneline gönderim yapılır.",
      "**🔄 İade**\nStandart ürünlerde 14 gün içinde iade kabul edilir.",
      "**❌ İade Edilemeyen Ürünler**\n• Kişiye özel ürünler \n• Siparişe özel üretimler",
      "**📦 Hasarlı Ürün**\nHasarlı ürünlerde 48 saat içinde bizimle iletişime geçiniz."
    ],
  }
];

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
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
            Customer Care
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Policies & Agreements
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            Distance Sales Agreement and Shipping & Return Policy
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="responsive-container">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sticky Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <TableOfContents sections={sections} />
            </aside>

            {/* Sections */}
            <div className="flex-1 min-w-0">
              <div className="space-y-10">
                {sections.map((section, i) => (
                  <div
                    key={i}
                    id={`section-${i}`}
                    className="pb-10 border-b border-gray-100 last:border-0"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.content.map((para, j) => {
                        // Simple parser for bold text (**text**) and newlines (\n)
                        return (
                          <div key={j} className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
                            {para.split("**").map((part, index) => 
                              index % 2 === 1 ? <strong key={index} className="text-gray-900 font-semibold">{part}</strong> : part
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="responsive-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            If you need further assistance with your order, shipping, or returns, our customer service team is here to help.
          </p>
          <a
            href="/support"
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            Contact Support →
          </a>
        </div>
      </section>
    </div>
  );
}
