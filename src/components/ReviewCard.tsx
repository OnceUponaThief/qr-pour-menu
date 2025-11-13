import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageCircle } from "lucide-react";

interface ReviewCardProps {
  customerName: string;
  rating: number;
  reviewText?: string;
  photoUrls?: string[];
  adminReply?: string;
  createdAt: string;
  adminReplyAt?: string;
}

export const ReviewCard = ({
  customerName,
  rating,
  reviewText,
  photoUrls,
  adminReply,
  createdAt,
  adminReplyAt,
}: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gray-800/50 border-cyan-500/30 overflow-hidden">
      <CardContent className="p-4">
        {/* Customer Info & Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{customerName}</p>
              <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
            </div>
          </div>
          {/* Star Rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Text */}
        {reviewText && (
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
            {reviewText}
          </p>
        )}

        {/* Photo Gallery */}
        {photoUrls && photoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photoUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Review photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-cyan-500/30 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Admin Reply */}
        {adminReply && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-purple-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs">
                    Restaurant Reply
                  </Badge>
                  {adminReplyAt && (
                    <span className="text-xs text-gray-400">
                      {formatDate(adminReplyAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300">{adminReply}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};