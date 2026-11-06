import React, { useState, useMemo } from 'react';
import { Search, Flame, Plus, Check, Heart, Users } from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS, MenuItem } from '../data/restaurantData';

interface InteractiveMenuProps {
  onAddToCart: (item: MenuItem, notes?: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.urduName.includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddWithFeedback = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <section id="menu" className="py-16 sm:py-24 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-800">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Culinary Selections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 mt-1">
              The Mehmaan Menu
            </h2>
            <p className="text-stone-400 text-sm mt-2 max-w-xl">
              Freshly butchered halal meats, hand-ground masalas, unglazed terracotta pots, and natural babool charcoal grilling.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BBQ, Karahi, Naan..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-900 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs (Compliant Segmented Bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/30 rounded-xl border border-stone-800/80">
            <p className="text-stone-400 text-sm">No culinary items match your search "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-3 text-xs text-amber-400 hover:underline"
            >
              Reset filters and view all items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isFav = favorites.includes(item.id);
              const isAdded = !!addedItemIds[item.id];

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-800 bg-stone-900/50 hover:bg-stone-900/80 hover:border-stone-700 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image Preview & Bookmark */}
                  <div className="relative h-48 overflow-hidden bg-stone-950">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      aria-label={`Favorite ${item.name}`}
                      className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/70 backdrop-blur-sm text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Popular indicator */}
                    {item.popular && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-400 text-stone-950 shadow-sm">
                        House Specialty
                      </span>
                    )}

                    {/* Urdu Name overlay */}
                    <span className="absolute bottom-2 right-3 text-xs font-serif text-amber-200/90 font-medium">
                      {item.urduName}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Clean metadata strip */}
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-stone-500" />
                          <span>{item.serves}</span>
                        </span>
                        {item.spicyLevel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 text-amber-500/90">
                              <Flame className="w-3 h-3" />
                              <span>{item.spicyLevel === 1 ? 'Mild' : item.spicyLevel === 2 ? 'Medium Spicy' : 'Fiery Spiced'}</span>
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-stone-300 text-xs leading-relaxed mt-2.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Add to Order */}
                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500 block">Portion Price</span>
                        <span className="font-serif text-lg font-bold text-stone-100 tabular-nums">
                          Rs {item.price.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddWithFeedback(item)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-200'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
