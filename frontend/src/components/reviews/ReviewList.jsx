import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';
import DotPagination from '../DotPagination';

const ReviewList = ({ productUuid }) => {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${productUuid}/reviews?page=${page}`);
      setReviews(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productUuid) {
      fetchReviews(page);
    }
  }, [productUuid, page]);

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 h-24 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-secondary-900/50 rounded-xl border border-dashed border-gray-200 dark:border-secondary-800">
        <MessageSquare className="w-10 h-10 text-gray-400 mx-auto mb-3 opacity-50" />
        <p className="text-secondary-500 font-medium">No reviews yet.</p>
        <p className="text-xs text-secondary-400">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.uuid} className="bg-white dark:bg-secondary-900 p-5 rounded-xl border border-secondary-200 dark:border-secondary-800 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm overflow-hidden flex-shrink-0">
                  {review.user?.avatar ? (
                    <img src={review.user.avatar} alt={review.user.first_name} className="w-full h-full object-cover" />
                  ) : (
                    review.user?.first_name?.charAt(0) || 'A'
                  )}
                </div>
                <div>
                  <p className="font-bold text-secondary-900 dark:text-white text-sm">
                    {review.user?.first_name} {review.user?.last_name}
                  </p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-secondary-400">
                {new Date(review.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="mt-3 pl-13">
              {review.title && <h4 className="font-bold text-secondary-900 dark:text-white text-sm mb-1">{review.title}</h4>}
              <p className="text-secondary-600 dark:text-secondary-400 text-sm whitespace-pre-wrap">{review.body}</p>
            </div>
          </div>
        ))}
      </div>

      {meta && meta.last_page > 1 && (
        <DotPagination 
          currentPage={page} 
          totalPages={meta.last_page} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
};

export default ReviewList;
