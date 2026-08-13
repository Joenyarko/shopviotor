import React, { useState } from 'react';
import { Star, AlertCircle, Loader } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-toastify';

const ReviewForm = ({ productUuid, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(`/products/${productUuid}/reviews`, {
        rating,
        title,
        body
      });
      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setBody('');
      if (onSuccess) onSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-lg text-secondary-900 dark:text-white mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Review Title
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Summarize your experience..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
            Review Details <span className="text-red-500">*</span>
          </label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            placeholder="What did you like or dislike?"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0 || body.trim() === ''}
          className="premium-button w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" /> Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
