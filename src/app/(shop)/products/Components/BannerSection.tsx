/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars */
import { ChevronRight, Star, Sparkles } from "lucide-react";

export default function BannerSection() {
  return (
    <section className="relative bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 py-10 sm:py-0 sm:min-h-[320px] lg:min-h-[384px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 sm:gap-12">
          {/* Left Content */}
          <div className="text-white space-y-3 sm:space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 rounded-full">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
              <span className="text-xs sm:text-sm text-black font-medium">New Arrivals 2025</span>
            </div>
            
      
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-2 sm:mb-3">
                Built for Business.
                <br />
                {/* <span className="text-yellow-400">Simplicity</span> */}
              </h1>
              <p className="text-sm sm:text-xl text-gray-200 max-w-lg">
                Stock up on best-selling essentials with reliable quality, competitive pricing, and fast delivery—made for growing teams and modern stores.
              </p>
            </div>
            
          
          </div>
            <div className="hidden sm:block">
              <img src="banner-image\\ArtDrawing-removebg-preview.png" alt="" className="h-80 md:h-96 object-contain" />
            </div>
         
        </div>
      </div>
    </section>
  );
}