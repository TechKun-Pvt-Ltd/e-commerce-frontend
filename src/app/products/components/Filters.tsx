"use client";
import React from 'react';


const Filters: React.FC<{
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  selectedColors: string[];
  onColorsSelected: (value: string[]) => void;
  selectedSizes: string[];
  onSizesSelected: (value: string[]) => void;
}> = ({
  priceRange,
  onPriceRangeChange,
  selectedColors,
  onColorsSelected,
  selectedSizes,
  onSizesSelected
}) => {
    const colors = [
      { name: 'Black', count: 4, hex: '#000000' },
      { name: 'Brown', count: 5, hex: '#964B00' },
      { name: 'Teal', count: 3, hex: '#008080' },
      { name: 'White', count: 3, hex: '#FFFFFF' }
    ];

    const sizes = [
      { id: '30x40', label: '11 ¾ x 15 ¾ in (30×40 cm)', count: 2 },
      { id: '40x50', label: '15 ¾ x 19 ¾ in (40×50 cm)', count: 2 },
      { id: '50x70', label: '19 ¾ x 27 ½ in (50×70 cm)', count: 1 },
      { id: '21x30', label: '8 ¼ x 11 ¾ in (21×30 cm)', count: 1 }
    ];

    const handleColorChange = (color: string) => {
      selectedColors.includes(color)?
        onColorsSelected(selectedColors.filter(c => c!== color)) :
        onColorsSelected([...selectedColors, color]);
    };

    const handleSizeChange = (size: string) => {
      selectedSizes.includes(size)?
        onSizesSelected(selectedSizes.filter(s => s!== size)) :
        onSizesSelected([...selectedSizes, size]);
    };

    const minPrice = 50; // Assuming your min price is $50
    const maxPrice = 300; // Assuming your max price is $300
    const range = maxPrice - minPrice;

    const leftPosition = ((priceRange[0] - minPrice) / range) * 100;
    const rightPosition = ((priceRange[1] - minPrice) / range) * 100;

    const handlePriceChange = (newMin: number, newMax: number) => {
      // Ensure min doesn't exceed max and vice versa
      newMin = Math.min(newMin, priceRange[1]);
      newMax = Math.max(newMax, priceRange[0]);

      onPriceRangeChange([newMin, newMax]);
    };

    return (
      <div className="bg-white rounded-lg p-6 sticky top-4 mb-6">
        <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">Filters</h2>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Price Range</h3>
          <div className="relative h-2 mt-4 mb-6">
            <div className="absolute h-2 bg-gray-200 rounded-full w-full"></div>
            <div
              className="absolute h-2 bg-black rounded-full"
              style={{ left: `${leftPosition}%`, width: `${rightPosition - leftPosition}%` }}
            ></div>
            <div
              className="absolute w-6 h-6 bg-white border-2 border-black rounded-full cursor-pointer transform -translate-y-1/2 top-1/2"
              style={{ left: `${leftPosition}%` }}
              onMouseDown={() => {
                const handleMouseMove = (e: MouseEvent) => {
                  const container = e.currentTarget as HTMLElement;
                  const rect = container.getBoundingClientRect();
                  const percentage = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width * 100), rightPosition);
                  const newMin = Math.round((percentage / 100) * range + minPrice);
                  handlePriceChange(newMin, priceRange[1]);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            ></div>
            <div
              className="absolute w-6 h-6 bg-white border-2 border-black rounded-full cursor-pointer transform -translate-y-1/2 top-1/2"
              style={{ left: `${rightPosition}%` }}
              onMouseDown={() => {
                const handleMouseMove = (e: MouseEvent) => {
                  const container = e.currentTarget as HTMLElement;
                  const rect = container.getBoundingClientRect();
                  const percentage = Math.min(Math.max(leftPosition, (e.clientX - rect.left) / rect.width * 100), 100);
                  const newMax = Math.round((percentage / 100) * range + minPrice);
                  handlePriceChange(priceRange[0], newMax);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-md font-medium">
                ${priceRange[0]}
              </div>
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-md font-medium">
                ${priceRange[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Color Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Color</h3>
          <div className="grid grid-cols-2 gap-2">
            {colors.map(color => (
              <div
                key={color.name}
                className={`flex items-center p-2 rounded-md transition-colors duration-200 cursor-pointer ${selectedColors.includes(color.name) ? 'bg-gray-100' : ''
                  }`}
                onClick={() => handleColorChange(color.name)}
              >
                <div
                  className="w-6 h-6 rounded-full mr-3 flex-shrink-0 border border-gray-300"
                  style={{ backgroundColor: color.hex, boxShadow: color.name === 'White' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none' }}
                >
                  {selectedColors.includes(color.name) && (
                    <svg className={`w-6 h-6 ${color.name === 'White' || color.name === 'Teal' ? 'text-black' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{color.name}</span>
                  <span className="text-xs text-gray-500">({color.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Size</h3>
          <div className="space-y-3">
            {sizes.map(size => (
              <div
                key={size.id}
                className={`p-3 border rounded-md cursor-pointer transition-all ${selectedSizes.includes(size.id)
                  ? 'border-black bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onClick={() => handleSizeChange(size.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded mr-3 border flex items-center justify-center ${selectedSizes.includes(size.id) ? 'border-black bg-black text-white' : 'border-gray-400'
                      }`}>
                      {selectedSizes.includes(size.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{size.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">({size.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          onClick={() => {
            onPriceRangeChange([minPrice, maxPrice]);
            onColorsSelected([]);
            onSizesSelected([]);
          }}
        >
          Reset All Filters
        </button>
      </div>
    );
  };

export default Filters;