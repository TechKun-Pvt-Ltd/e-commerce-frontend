import { ChevronDown } from "lucide-react";


const BannerSection = () => {
  return (
    <section className="relative bg-gray-400 h-80">
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-2 h-full">
          <div className="flex items-center justify-center">
            <div className="text-white">
              <h1 className="text-6xl font-light leading-tight">
                Simple
                <br />
                is More
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;