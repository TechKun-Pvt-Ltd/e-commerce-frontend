"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// ✅ JSON data for carousel slides
const slides = [
  {
    id: 1,
    title: "LATEST ITEMS",
    subtitle: "Running Out Fast Items, Catch Them with Advantageous Prices!",
    image: "https://i.pinimg.com/736x/52/d5/d7/52d5d71d07a1d93cea79de873fcd8777.jpg",
    link: "/shop/latest",
  },
  {
    id: 2,
    title: "NEW ARRIVALS",
    subtitle: "Discover Trendy Collections Before They’re Gone!",
    image: "/images/product2.jpg",
    link: "/shop/new",
  },
  {
    id: 3,
    title: "MEGA SALE",
    subtitle: "Exclusive Discounts On Top Categories — Limited Time Only!",
    image: "/images/product3.jpg",
    link: "/shop/sale",
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const { title, subtitle, image, link } = slides[currentIndex];

  return (
    <section
      className="relative w-full h-[670px] flex items-center justify-center bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url('https://i.pinimg.com/1200x/26/81/20/2681206974358cd48f2327bc0665dc20.jpg')` }}
    >
      <div className="absolute inset-0 " /> {/* Dark overlay */}

      <div className="responsive-container">

        <div className="flex-1 max-w-2xl">
          <h2 className="text-6xl text-amber-700 font-bold mb-6">{title}</h2>
          <h3 className="text-3xl font-light mb-6 leading-tight">{subtitle}</h3>
          <Button variant='ghost'
            className=" hover:bg-white rounded-full  my-4 text-black border p-4 border-black cursor-pointer"
            asChild
          >
            <a href={link}>
              EXPLORE NOW <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
         
        </div>
      </div>

      <div className="responsive-container absolute bottom-8 left-0 right-0 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2 text-white">
          <span className="text-lg font-bold">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <div className="w-16 h-0.5 bg-white"></div>
          <span className="text-lg text-gray-300">
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="bg-white/20 hover:bg-white/40 text-white rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="bg-white/20 hover:bg-white/40 text-white rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
