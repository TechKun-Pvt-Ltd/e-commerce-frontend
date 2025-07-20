import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Rating, RatingButton } from "@/components/ui/rating";
import { MessageCircle, Star, TrendingUp, Shield, Users, Send, Pencil } from "lucide-react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as reviewServices from "@/services/review";
import { ReviewDTO } from "@/types/domains/review";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/domains/user";
import { toast } from "sonner";

interface Review {
  reviewId: number;
  reviewText: string;
  customer: {
    customerId: number;
    customerName: string;
  };
  productId: number;
  rating: number;
  dateOfSubmission: Date;
}

interface ProductReviewsProps {
  productId: number;
  currentCustomerId?: number;
}

export const ProductReviews = ({
  productId,
  currentCustomerId: propCustomerId = undefined,
}: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Get user information from Redux store
  const { user } = useAppSelector(state => state.auth);

  // Debug user data
  console.log("Full user object:", user);
  console.log("User ID:", user?.userId);
  console.log("User role:", user?.roleName);

  // Role checking logic
  const isAdmin = user?.roleName === UserRole.ADMIN;
  const isPlatformAdmin = user?.roleName === UserRole.PLATFORM_ADMIN;
  const canDeleteAnyReview = isAdmin || isPlatformAdmin;

  // Try different ways to get current user ID
  const currentUserId = user?.userId;
  const currentCustomerId = currentUserId || propCustomerId; // Use userId directly or fallback to prop

  // Data fetch hooks
  const getReviews = useDataFetch(reviewServices.getReviews);
  const postReview = useDataFetch(reviewServices.postReview);
  const editReview = useDataFetch(reviewServices.editReview);
  const deleteReview = useDataFetch(reviewServices.deleteReview);

  // Load data on component mount
  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    getReviews.request(productId, undefined, 0, 10)
      .onSuccess((data: Review[]) => {
        setReviews(data);
        console.log("Reviews loaded:", data);
      })
      .onError((error) => {
        console.error("Failed to load reviews:", error);
      });
  };

  // Handle new review submission
  const handleSubmitReview = (reviewData: {
    productId: number;
    rating: number;
    reviewText: string;
  }) => {
    postReview.request(reviewData)
      .onSuccess((newReview) => {
        const newReviewForList: Review = {
          reviewId: newReview.reviewId,
          reviewText: newReview.reviewText,
          customer: {
            customerId: newReview.user.userId,
            customerName: newReview.user.fullName || newReview.user.email,
          },
          productId: newReview.product.productId,
          rating: newReview.rating,
          dateOfSubmission: new Date(newReview.dateOfSubmission),
        };

        setReviews(prev => [newReviewForList, ...prev]);
        setShowForm(false);
      })
      .onError((error) => {
        toast.error("Failed to submit review: " + error);
      });
  };

  // Handle edit review
  const handleEditReview = (reviewId: number) => {
    const reviewToEdit = reviews.find(r => r.reviewId === reviewId);
    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
      setShowForm(true);
    }
  };

  // Handle update review
  const handleUpdateReview = (reviewData: {
    productId: number;
    rating: number;
    reviewText: string;
  }) => {
    if (!editingReview) return;

    const editDTO: ReviewDTO = {
      productId: reviewData.productId,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
    };

    editReview.request(editingReview.reviewId, editDTO)
      .onSuccess((updatedReview) => {
        console.log("Updated review response:", updatedReview);

        setReviews(prev => prev.map(review =>
          review.reviewId === editingReview.reviewId
            ? {
              ...review,
              reviewText: updatedReview.reviewText,
              rating: updatedReview.rating,
              dateOfSubmission: new Date(updatedReview.dateOfSubmission),
            }
            : review
        ));

        setEditingReview(null);
        setShowForm(false);
        console.log("Review updated successfully");
      })
      .onError((error) => {
        console.error("Failed to update review:", error);
      });
  };

  // Handle delete review
  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReview.request(reviewId)
        .onSuccess(() => {
          setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
          console.log("Review deleted successfully");
        })
        .onError((error) => {
          console.error("Failed to delete review:", error);
        });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowForm(false);
  };

  // Permission checking functions
  const canEditReview = useCallback((review: Review): boolean => {
    return review.customer.customerId === currentCustomerId;
  }, [currentCustomerId]);

  const canDeleteReview = useCallback((review: Review): boolean => {
    return review.customer.customerId === currentCustomerId || isAdmin || isPlatformAdmin;
  }, [currentCustomerId, isAdmin, isPlatformAdmin]);

  // Calculate statistics
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  const isLoading = getReviews.isLoading || postReview.isLoading || editReview.isLoading || deleteReview.isLoading;

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card className="bg-gradient-to-br from-card to-product-bg border-0 shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Customer Reviews
            {isLoading && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
            )}
            {canDeleteAnyReview && (
              <Badge variant="outline" className="ml-auto">
                Admin View
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <Rating readOnly value={Math.round(averageRating)} className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingButton key={index} />
                    ))}
                  </Rating>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {reviews.length} reviews
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setEditingReview(null);
                  setShowForm(!showForm);
                }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-elegant)] transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {editingReview ? "Cancel Edit" : "Write a Review"}
              </Button>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{rating}</span>
                  <Star className="h-4 w-4 fill-star-filled text-star-filled" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingReview ? (
                <>
                  <Pencil className="w-5 h-5" />
                  Edit Your Review
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Write a Review
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              productId={productId}
              mode={editingReview ? "edit" : "create"}
              onSubmit={editingReview ? handleUpdateReview : handleSubmitReview}
              isSubmitting={postReview.isLoading || editReview.isLoading}
              initialData={editingReview ? {
                rating: editingReview.rating,
                reviewText: editingReview.reviewText
              } : undefined}
              onCancel={handleCancelEdit}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          All Reviews
          <Badge variant="secondary" className="ml-2">
            {reviews.length}
          </Badge>
        </h3>

        {getReviews.isLoading && reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">Loading reviews...</h4>
              <p>Please wait while we fetch the reviews.</p>
            </div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No reviews yet</h4>
              <p>Be the first to share your experience with this product!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onEdit={canEditReview(review) ? handleEditReview : undefined}
                onDelete={canDeleteReview(review) ? handleDeleteReview : undefined}
                isOwner={review.customer.customerId === currentCustomerId}
                canModerate={canDeleteAnyReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination (if needed) */}
      {reviews.length >= pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};