import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { getMenu } from '../services/api';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  dietary_tags: string[];
  is_special: boolean;
}

const categories = ['all', 'nebenbei', 'kalt', 'warm', 'suess', 'wine'];
const categoryLabels: Record<string, string> = {
  all: 'Alle',
  nebenbei: 'Nebenbei',
  kalt: 'Kalt',
  warm: 'Warm',
  suess: 'Süß',
  wine: 'Weine',
};
const categoryDescriptions: Record<string, string> = {
  all: 'Our full seasonal menu',
  nebenbei: 'Small bites & sides',
  kalt: 'Cold starters & salads',
  warm: 'Warm mains & hearty dishes',
  suess: 'Sweet finishes & desserts',
  wine: 'Natural wines & selected bottles',
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
            alt="Beautiful selection of Mediterranean dishes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-text/80" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        >
          <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">Curated For You</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Our Menu</h1>
          <p className="text-white/65 max-w-xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            Seasonal cuisine crafted with passion and the finest ingredients
          </p>
        </motion.div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-2 mb-4 flex-wrap"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2.5 rounded-[--radius-md] text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-card text-text-secondary hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10'
              }`}
              aria-pressed={activeCategory === cat}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        {/* Category Description */}
        <p className="text-center text-text-secondary text-sm mb-10">
          {categoryDescriptions[activeCategory]}
        </p>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-[--radius-lg] p-6 shadow-sm">
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
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="card-hover bg-card rounded-[--radius-lg] p-6 shadow-sm border border-transparent hover:border-primary/10 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors duration-200">
                      {item.name}
                      {item.is_special && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-medium">
                          <Sparkles size={10} />
                          Special
                        </span>
                      )}
                    </h3>
                    <span className="text-primary font-bold text-lg tabular-nums">€{item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-text-secondary mb-3 leading-relaxed">{item.description}</p>
                  )}
                  {item.dietary_tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {item.dietary_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-medium"
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
            className="text-center py-16 text-text-secondary"
          >
            <p className="text-lg">No items found in this category.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-primary font-medium hover:text-primary-dark transition-colors duration-200"
            >
              View all items
            </button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-bg-alt rounded-[--radius-xl] p-8 sm:p-10 text-center"
        >
          <h3 className="text-xl font-bold text-text mb-2">Not sure what to order?</h3>
          <p className="text-text-secondary mb-6">
            Ask Sofia for personalized recommendations based on your taste, allergies, or mood.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                const chatBtn = document.querySelector('[aria-label="Open chat with Sofia"]') as HTMLButtonElement;
                chatBtn?.click();
              }}
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-[--radius-md] font-semibold hover:bg-primary-dark transition-all duration-200"
            >
              <MessageCircle size={18} />
              Get Tailored Recommendations
            </button>
            <Link
              to="/reserve"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary/20 text-primary px-6 py-3 rounded-[--radius-md] font-semibold hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
            >
              Book Your Table
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
