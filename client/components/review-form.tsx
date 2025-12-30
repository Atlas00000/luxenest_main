"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createReview, type CreateReviewData } from "@/lib/api/reviews"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  productId: string
  onReviewSubmitted: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState<CreateReviewData>({
    rating: 0,
    title: "",
    comment: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast({
        title: "Fields required",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createReview(productId, {
        ...formData,
        rating,
      })
      
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      })
      
      // Reset form
      setRating(0)
      setFormData({
        rating: 0,
        title: "",
        comment: "",
      })
      
      onReviewSubmitted()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star)
                setFormData((prev) => ({ ...prev, rating: star }))
              }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-muted-foreground ml-2">({rating} star{rating !== 1 ? "s" : ""})</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          placeholder="Give your review a title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">Your Review</Label>
        <Textarea
          id="review-comment"
          placeholder="Share your experience with this product..."
          value={formData.comment}
          onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
          rows={5}
          maxLength={2000}
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.comment.length}/2000 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  )
}

