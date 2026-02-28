import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getMenu } from '../services/api';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  dietary_tags: string[];
  is_special: boolean;
}

const categories = ['all', 'starter', 'main', 'dessert', 'wine'];
const categoryLabels: Record<string, string> = {
  all: 'All',
  starter: 'Starters',
  main: 'Mains',
  dessert: 'Desserts',
  wine: 'Wines',
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu', activeCategory],
    queryFn: () => getMenu(activeCategory === 'all' ? undefined : activeCategory),
  });

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
            alt="Beautiful food spread"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-wine-dark/80" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        >
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Curated For You</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Our Menu</h1>
          <p className="text-white/70 max-w-xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            Authentic Italian-Mediterranean cuisine, crafted with seasonal ingredients and love
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-wine text-white shadow-md shadow-wine/20'
                  : 'bg-white text-warm-gray hover:bg-wine/5 hover:text-wine'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="shimmer h-5 rounded w-2/3 mb-3" />
                <div className="shimmer h-4 rounded w-full mb-2" />
                <div className="shimmer h-4 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="card-hover bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-wine/10 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-wine-dark group-hover:text-wine transition-colors">
                      {item.name}
                      {item.is_special && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs bg-gold/15 text-gold px-2.5 py-0.5 rounded-full">
                          <Sparkles size={10} />
                          Special
                        </span>
                      )}
                    </h3>
                    <span className="text-wine font-bold text-lg">${item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-warm-gray mb-3 leading-relaxed">{item.description}</p>
                  )}
                  {item.dietary_tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {item.dietary_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-olive/10 text-olive px-2.5 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-warm-gray"
          >
            <p className="text-lg">No items found in this category.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-wine font-medium hover:text-wine-dark transition-colors"
            >
              View all items
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
