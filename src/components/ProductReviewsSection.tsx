import React, { useEffect, useState } from 'react';
import {
  Star,
  StarHalf,
  MessageSquare,
  ShieldCheck,
  Pencil,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  fetchProductReviews,
  submitProductReview,
  updateProductReview,
  deleteProductReview,
  ProductReview,
  ProductReviewAggregate,
} from '../service/api';

/*
 * Product Reviews & Ratings section.
 *
 * - Ipinapakita ang average rating, rating count, at listahan ng reviews
 *   (published lang mula sa backend).
 * - Tanging verified buyers (may naka-complete order na may ganitong product)
 *   ang makakapag-review — ang pag-update ay naka-guard din sa backend.
 * - Pwede i-edit/deletahan ang sariling review.
 * - Hindi binabago ang product card; ito ay hiwalay na module.
 */
export const ProductReviewsSection: React.FC<{ productId: string }> = ({ productId }) => {
  const { user, showToast } = useStore();

  const [data, setData] = useState<ProductReviewAggregate | null>(null);
  const [loading, setLoading] = useState(true);

  const [myRating, setMyRating] = useState(0);
  const [myHover, setMyHover] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const agg = await fetchProductReviews(productId);
      setData(agg);
    } catch (e: any) {
      console.warn('Reviews load failed:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async () => {
    if (myRating === 0) {
      showToast('Please select a star rating.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await submitProductReview({
        productId,
        rating: myRating,
        comment: myComment.trim(),
      });
      showToast('Thank you for your review!', 'success');
      setMyRating(0);
      setMyComment('');
      setHasReviewed(true);
      await load();
    } catch (e: any) {
      showToast(e?.message || 'Could not submit review.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (reviewId: string) => {
    setSubmitting(true);
    try {
      await updateProductReview(reviewId, { rating: editRating, comment: editComment.trim() });
      showToast('Review updated.', 'success');
      setEditingId(null);
      await load();
    } catch (e: any) {
      showToast(e?.message || 'Could not update review.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteProductReview(reviewId);
      showToast('Review deleted.', 'info');
      setHasReviewed(false);
      await load();
    } catch (e: any) {
      showToast(e?.message || 'Could not delete review.', 'warning');
    }
  };

  const renderStars = (rating: number, cls = 'w-4 h-4') =>
    [1, 2, 3, 4, 5].map((star) => {
      const full = rating >= star;
      return (
        <Star
          key={star}
          className={`${cls} ${full ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}`}
        />
      );
    });

  const isMyReview = (r: ProductReview) =>
    r.customerName.toLowerCase() === user.username.toLowerCase() ||
    r.customerName.toLowerCase() === (user.username || '').toLowerCase();

  const reviews = data?.reviews || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-6 border-t border-stone-100 dark:border-stone-800">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">
          Reviews & Ratings
        </h3>
      </div>

      {loading && !data ? (
        <div className="flex items-center gap-2 py-6 text-sm text-stone-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-stone-900 dark:text-white">
                {data?.averageRating ? data.averageRating.toFixed(1) : '0.0'}
              </span>
              <div>
                <div className="flex items-center gap-0.5">
                  {renderStars(data?.averageRating || 0, 'w-5 h-5')}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {data?.ratingCount || 0} review{(data?.ratingCount || 0) === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {/* Distribution */}
            {data && (data.ratingCount || 0) > 0 && (
              <div className="flex-1 space-y-1 min-w-0">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = data.distribution?.[star] || 0;
                  const pct = data.ratingCount ? Math.round((n / data.ratingCount) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-stone-500">{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-stone-400">{n}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Review form (only if not yet reviewed by this user) */}
            {user.isLoggedIn && !hasReviewed && (
              <div className="w-full sm:w-72 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200 mb-2">
                  {editingId ? 'Editing review' : 'Write a review'}
                </p>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setMyHover(star)}
                      onMouseLeave={() => setMyHover(0)}
                      onClick={() => setMyRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (myHover || myRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="Share your experience…"
                  rows={2}
                  maxLength={1500}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 dark:text-white resize-none"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || myRating === 0}
                  className="mt-2 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 dark:disabled:bg-stone-800 text-white disabled:text-stone-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Review
                </button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">
              {user.isLoggedIn && !hasReviewed
                ? 'No reviews yet. Be the first to rate this product (verified buyers only).'
                : 'No reviews yet.'}
            </p>
          ) : (
            <div className="space-y-3 pb-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs shrink-0">
                        {(r.customerName || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                          {r.customerName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400">
                            {r.date ? new Date(r.date).toLocaleDateString() : ''}
                          </span>
                          {r.verifiedPurchase && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-0.5">{renderStars(r.rating, 'w-3.5 h-3.5')}</div>
                      {isMyReview(r) && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(editingId === r.id ? null : r.id);
                              setEditRating(r.rating);
                              setEditComment('');
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            aria-label="Edit review"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{r.comment}</p>

                  {r.adminReply && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                        <MessageSquare className="w-3 h-3" /> C-HUB Official Response
                        <span className="text-stone-400 font-normal">
                          {r.adminReply.date ? new Date(r.adminReply.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">{r.adminReply.comment}</p>
                    </div>
                  )}

                  {/* Edit inline */}
                  {editingId === r.id && (
                    <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= editRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder={r.comment}
                        rows={2}
                        maxLength={1500}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white resize-none"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(r.id)}
                          disabled={submitting || editRating === 0}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};