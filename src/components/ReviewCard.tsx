import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageCircle, Calendar } from "lucide-react";

interface ReviewCardProps {
  customerName: string;
  rating: number;
  reviewText?: string;
  photoUrls?: string[];
  adminReply?: string;
  createdAt: string;
  adminReplyAt?: string;
  /** Optional avatar image URL (e.g., Dicebear or user-uploaded). */
  avatarUrl?: string;
}

export const ReviewCard = ({
  customerName,
  rating,
  reviewText,
  photoUrls,
  adminReply,
  createdAt,
  adminReplyAt,
  avatarUrl,
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
    <Card className="bg-gray-800/50 border-cyan-500/30 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
      <CardContent className="p-4 md:p-5">
        {/* Customer Info & Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={customerName}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-cyan-500/30 object-cover shadow-lg"
              />
            ) : (
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm md:text-base">{customerName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Star Rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-4 w-4 md:h-5 md:w-5 ${ 
                  star <= rating 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-600" 
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Review Text */}
        {reviewText && (
          <p className="text-gray-300 text-sm md:text-base mb-3 leading-relaxed pl-0 md:pl-15">
            "{reviewText}"
          </p>
        )}

        {/* Photo Gallery */}
        {photoUrls && photoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photoUrls.map((url, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer overflow-hidden rounded-lg border border-cyan-500/30" 
                onClick={() => window.open(url, '_blank')} 
              > 
                <img 
                  src={url} 
                  alt={`Review photo ${index + 1}`} 
                  className="w-full h-24 md:h-32 object-cover group-hover:scale-110 transition-transform duration-300" 
                /> 
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /> 
              </div> 
            ))}
          </div>
        )}

        {/* Admin Reply */}
        {adminReply && (
          <div className="mt-4 pt-4 border-t border-gray-700 bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs border border-purple-500/30">
                    🏪 Restaurant Reply
                  </Badge>
                  {adminReplyAt && (
                    <span className="text-xs text-gray-400">
                      {formatDate(adminReplyAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-200 leading-relaxed">{adminReply}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};