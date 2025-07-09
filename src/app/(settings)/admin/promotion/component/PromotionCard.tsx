import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PromotionDetails } from "@/types/domains/promotion";
import { cn } from "@/lib/utils";

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
  index?: number;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  deletePromotionHandler,
  updatePromotion,
  promotionData,
  toast,
  PromotionForm,
  index
}) => {
 const cardColors = [
  "bg-purple-200/60",
  "bg-orange-200/60", 
  "bg-emerald-200/60",
  "bg-red-200/60",
  "bg-blue-200/60"
];
  const bgGradient = index !== undefined ? cardColors[index % cardColors.length] : (promotion.promotionType === 'PERCENTAGE' ? 'from-emerald-600 to-emerald-800' : 'from-blue-600 to-blue-800');

  const formatDiscount = () => {
    return promotion.promotionType === 'PERCENTAGE' 
      ? `${promotion.discountValue}% OFF` 
      : `₹${promotion.discountValue} OFF`;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group transition-all duration-300 w-full cursor-pointer">
          {/* Main Card */}
          <div className={cn(
            "relative rounded-t-md p-6 bg-gradient-to-br  overflow-hidden text-black",
            bgGradient
          )}>
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 opacity-15">
              <div className="absolute top-4 right-4 text-6xl font-bold transform rotate-12">
                %
              </div>
              <div className="absolute bottom-4 left-4 text-4xl font-bold transform -rotate-12">
                %
              </div>
            </div> */}

            {/* Header */}
            <div className="relative flex justify-between items-start">
              {/* <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/50 backdrop-blur-sm">
                {promotion.promotionType === 'PERCENTAGE' ? 'Percentage' : 'Flat Discount'}
              </span> */}
               <div className="relative mb-3">
              <h2 className="text-4xl font-bold">
                {formatDiscount()}
              </h2>
              <span className="text-sm font-medium bg-white/50 backdrop-blur-sm  px-2 py-1 rounded mt-5 inline-block">
                Min Order: ₹{promotion.minimumOrderValue}
              </span>
            </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="p-2  rounded-full text-sm font-medium bg-white/50 backdrop-blur-sm cursor-pointer"
                    title="Delete promotion"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={20} />
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
           
          </div>

          {/* Bottom Section */}
          <div className="bg-white rounded-b-md p-4 border-x border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{promotion.description}</h3>
                <p className="text-xs text-gray-500">Valid till {formatDate(promotion.validTill)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{promotion.maxUses} max uses</p>
                <p className="text-xs text-gray-500">{promotion.usagePerCustomer} per customer</p>
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
