import { ChevronRight, Star, Sparkles } from "lucide-react";

export default function BannerSection() {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 h-96">
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 rounded-full">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
              <span className="text-sm text-black font-medium">New Collection 2025</span>
            </div>
            
      
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Style Meets
                <br />
                <span className="text-yellow-400">Simplicity</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Discover our curated collection of premium products designed for the modern lifestyle.
              </p>
            </div>
            
            
          
          </div>
         
        </div>
      </div>
    </section>
  );
}