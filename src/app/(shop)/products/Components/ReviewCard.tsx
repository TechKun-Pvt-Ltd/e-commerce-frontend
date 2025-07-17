import { Edit2, Trash2, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rating, RatingButton } from "@/components/ui/rating";

interface ReviewCardProps {
  review: {
    reviewId: number;
    reviewText: string;
    customer: {
      customerId: number;
      customerName: string;
    };
    productId: number;
    rating: number;
    dateOfSubmission: Date;
  };
  onEdit?: (reviewId: number) => void;
  onDelete?: (reviewId: number) => void;
  isOwner?: boolean;
  isModerator?: boolean;
  canModerate?: boolean;
}


export const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  isOwner = false,
  canModerate = false
}: ReviewCardProps) => {
  const customerInitials = review.customer.customerName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  const showEditButton = onEdit && (isOwner || canModerate);
  const showDeleteButton = onDelete && (isOwner || canModerate);

  
  const reviewDate = typeof review.dateOfSubmission === 'string' 
    ? new Date(review.dateOfSubmission) 
    : review.dateOfSubmission;

  return (
    <Card className="bg-review-bg border-0 shadow-[var(--shadow-review)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80">
              <AvatarFallback className="bg-transparent text-primary-foreground font-semibold">
                {customerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground">
                  {review.customer.customerName}
                </h4>
                
                {/* User badges */}
                {isOwner && (
                  <Badge variant="default" className="text-xs">
                    You
                  </Badge>
                )}
                
                {canModerate && !isOwner && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Can Moderate
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {reviewDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Rating readOnly value={review.rating} className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton key={index} />
              ))}
            </Rating>
            
            {/* Action buttons */}
            {(showEditButton || showDeleteButton) && (
              <div className="flex gap-1 ml-2">
                {showEditButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit!(review.reviewId)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    title={isOwner ? "Edit your review" : "Moderate review"}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
                
                {showDeleteButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete!(review.reviewId)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title={isOwner ? "Delete your review" : "Delete review (Admin)"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-foreground leading-relaxed">{review.reviewText}</p>
      </CardContent>
    </Card>
  );
};