import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquarePlus, ThumbsUp } from 'lucide-react';
import { REVIEWS_DATA, RESTAURANT_INFO, ReviewItem } from '../data/restaurantData';

export const ReviewsSection: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(REVIEWS_DATA);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newCategory, setNewCategory] = useState<'BBQ' | 'Karahi' | 'Family Dining' | 'Hospitality'>('BBQ');
  const [newComment, setNewComment] = useState<string>('');
  const [userLikes, setUserLikes] = useState<Record<string, number>>({});

  const filterTags = ['All', 'BBQ', 'Karahi', 'Family Dining', 'Hospitality'];

  const displayedReviews = reviewsList.filter((r) => {
    if (selectedTag === 'All') return true;
    return r.category === selectedTag;
  });

  const handleToggleLike = (id: string) => {
    setUserLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !newComment) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: newRating,
      date: 'Just now',
      category: newCategory,
      comment: newComment,
      highlight: newComment.slice(0, 40) + '...',
      verified: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setAuthorName('');
    setNewComment('');
    setShowReviewForm(false);
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 border-t border-stone-800 bg-stone-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Google Maps Proof */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Customer Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 mt-1">
              Trusted by Karachi Diners
            </h2>
            <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm tabular-nums">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{RESTAURANT_INFO.rating}</span>
              </div>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-medium">({RESTAURANT_INFO.reviewCount} Google reviews)</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">Rs 1,000–7,000 / person (130 reported)</span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer self-start md:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Aggregate Ratings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-stone-900/50 border border-stone-800 mb-8">
          <div>
            <div className="text-xs text-stone-400">Charcoal BBQ Taste</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-amber-400 tabular-nums">4.9</span>
              <span className="text-[11px] text-stone-500">/ 5.0</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Shinwari Karahi & Desi Ghee</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-stone-200 tabular-nums">4.8</span>
              <span className="text-[11px] text-stone-500">/ 5.0</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Hospitality & Service</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-stone-200 tabular-nums">4.7</span>
              <span className="text-[11px] text-stone-500">/ 5.0</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Family Atmosphere</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-stone-200 tabular-nums">4.6</span>
              <span className="text-[11px] text-stone-500">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Review Form Drawer / Collapsible */}
        {showReviewForm && (
          <form
            onSubmit={handleAddReview}
            className="mb-8 p-6 rounded-xl bg-stone-900 border border-stone-700/80 space-y-4"
          >
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Share Your Dining Experience at Mehmaan
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-stone-300 font-medium block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Hashmi"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-stone-300 font-medium block mb-1">Rating</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-300 font-medium block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="BBQ">Charcoal BBQ</option>
                  <option value="Karahi">Shinwari Karahi</option>
                  <option value="Family Dining">Family Dining</option>
                  <option value="Hospitality">Service & Hospitality</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-300 font-medium block mb-1">Your Feedback</label>
              <textarea
                required
                rows={3}
                placeholder="How was the food, temperature of naans, hospitality, and ambiance?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                Post Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pb-4 mb-6 overflow-x-auto no-scrollbar">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === tag
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl border border-stone-800 bg-stone-900/40 flex flex-col justify-between space-y-4 hover:border-stone-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-500">{rev.date}</span>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-200">{rev.author}</span>
                    {rev.verified && (
                      <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]" title="Verified Diner">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified Diner</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-amber-500/80">{rev.category}</span>
                </div>

                <button
                  onClick={() => handleToggleLike(rev.id)}
                  className="flex items-center gap-1 text-stone-500 hover:text-amber-400 transition-colors text-[11px]"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{(userLikes[rev.id] || 0) > 0 ? userLikes[rev.id] : 'Helpful'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
