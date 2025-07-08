import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PromotionDetails } from "@/types/domains/promotion";

interface PromotionCardProps {
  promotion: PromotionDetails;
  deletePromotionHandler: (id: number) => void;
  updatePromotion: {
    isLoading: boolean;
    request: (id: number, data: any) => { onSuccess: (callback: () => void) => any; onError: (callback: () => void) => any };
  };
  promotionData: { request: () => void };
  toast: { success: (message: string) => void; error: (message: string) => void };
  PromotionForm: React.ComponentType<any>;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  deletePromotionHandler,
  updatePromotion,
  promotionData,
  toast,
  PromotionForm
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-lg hover:shadow-xl transition-all duration-300 w-full cursor-pointer min-h-48 flex flex-col bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  promotion.promotionType === 'PERCENTAGE' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {promotion.promotionType === 'PERCENTAGE' ? 'Percentage' : 'Flat'}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-70 hover:opacity-100 cursor-pointer"
                      title="Delete promotion"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Promotion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this promotion? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" className="cursor-pointer" onClick={() => { }}>Cancel</Button>
                      <Button
                        variant="destructive"
                      onClick={(e) => {
                          e.stopPropagation();
                          deletePromotionHandler(promotion.promotionId);
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                {promotion.description}
              </h3>

              <div className="flex items-center gap-2 mb-1 p-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="text-base font-bold text-green-600">
                  {promotion.promotionType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `₹${promotion.discountValue}`}
                </div>
                <span className="text-[10px] text-green-700 font-medium">
                  {promotion.promotionType === 'PERCENTAGE' ? 'Discount' : 'Flat'}
                </span>
              </div>

              <div className="text-[10px] text-blue-800 font-semibold mb-1">
                Valid: {promotion.validFrom ? (promotion.validFrom instanceof Date ? promotion.validFrom.toLocaleDateString('en-IN') : new Date(promotion.validFrom).toLocaleDateString('en-IN')) : 'N/A'} - {promotion.validTill ? (promotion.validTill instanceof Date ? promotion.validTill.toLocaleDateString('en-IN') : new Date(promotion.validTill).toLocaleDateString('en-IN')) : 'N/A'}
              </div>

              <div className="text-[10px] text-gray-600 mb-0.5 font-medium">Categories:</div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {promotion.categories?.map((category) => (
                  <span
                    key={category.categoryId}
                    className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-[9px] font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                  >
                    {category.name}
                  </span>
                )) || <span className="text-[10px] text-gray-500">N/A</span>}
              </div>
            </div>

            {/* Right Section - Stats */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                <p className="text-[9px] text-orange-600 font-medium mb-0.5">Min Order</p>
                <p className="text-xs font-bold text-orange-800">₹{promotion.minimumOrderValue?.toLocaleString() || 'N/A'}</p>
              </div>
              
              <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                <p className="text-[9px] text-purple-600 font-medium mb-0.5">Max Uses</p>
                <p className="text-xs font-bold text-purple-800">{promotion.maxUses?.toLocaleString() || 'Unlimited'}</p>
              </div>

              <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
                <p className="text-[9px] text-indigo-600 font-medium mb-0.5">Per Customer</p>
                <p className="text-xs font-bold text-indigo-800">{promotion.usagePerCustomer || 'Unlimited'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <PromotionForm
          mode="edit"
          loading={updatePromotion.isLoading}
          onSubmit={(data: any) => {
            updatePromotion.request(promotion.promotionId, data).onSuccess(() => {
              toast.success("Promotion updated successfully");
              promotionData.request(); // Refresh the list
            }).onError(() => {
              toast.error("Update promotion failed");
            });
          }}
          promotion={promotion}
          showTrigger={false}
          useDialogContent={false}
        />
      </DialogContent>
    </Dialog>
  );
};
