import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Wine, CalendarDays, Star, ArrowRight, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: UtensilsCrossed,
    title: 'Seasonal Menu',
    desc: 'Fresh, seasonal ingredients crafted into authentic Italian-Mediterranean dishes that change with the harvest.',
  },
  {
    icon: Wine,
    title: 'Curated Wines',
    desc: "Hand-selected natural wines from Italy's finest regions, each bottle telling its own terroir story.",
  },
  {
    icon: CalendarDays,
    title: 'Easy Reservations',
    desc: 'Book your table online or chat with Sofia, our AI host, for personalized dining assistance.',
  },
];

const gallery = [
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    alt: 'Elegantly plated Italian dish',
    label: 'Seasonal Plates',
  },
  {
    src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop',
    alt: 'Fine wine selection',
    label: 'Wine Collection',
  },
  {
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    alt: 'Restaurant interior ambiance',
    label: 'Our Space',
  },
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    alt: 'Fresh Italian pizza from wood oven',
    label: 'Wood-Fired',
  },
];

const testimonials = [
  {
    text: "The most authentic Italian experience outside of Italy. Every dish is a love letter to the Mediterranean.",
    author: 'Elena R.',
    rating: 5,
  },
  {
    text: "Sofia recommended the perfect wine pairing for our anniversary dinner. The AI host is a game-changer!",
    author: 'James & Sarah T.',
    rating: 5,
  },
  {
    text: "MaMi's feels like coming home. The pasta is handmade, the service is warm, and the ambiance is magical.",
    author: 'Marco P.',
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"
            alt="Restaurant ambiance"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-gold tracking-[0.3em] uppercase text-sm font-medium mb-6"
            >
              Italian-Mediterranean Bistro
            </motion.p>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-[0.95]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              MaMi's
              <span className="block text-gold italic font-medium text-3xl sm:text-4xl lg:text-5xl mt-2">
                Food & Wine
              </span>
            </motion.h1>

            <motion.div variants={fadeUp} custom={2} className="divider-ornament text-white/40 mb-6">
              <Sparkles size={16} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem' }}
            >
              Where family traditions meet exceptional cuisine.
              Every dish tells a story, every glass holds a memory.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/reserve"
                className="group inline-flex items-center justify-center gap-2 bg-gold text-wine-dark px-8 py-4 rounded-full font-semibold hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
              >
                <CalendarDays size={20} />
                Reserve a Table
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                <UtensilsCrossed size={20} />
                Explore Our Menu
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ============ PHILOSOPHY SECTION ============ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative"
            >
              <div className="img-zoom rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80"
                  alt="Handmade pasta"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-gold/30 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-wine/5 rounded-2xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Our Philosophy</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-wine-dark">
                Crafted with Passion,
                <span className="block text-wine">Served with Love</span>
              </h2>
              <p className="text-warm-gray leading-relaxed mb-6 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                At MaMi's, we believe food is more than sustenance — it's a conversation between
                cultures, seasons, and generations. Our kitchen transforms the finest seasonal
                ingredients into dishes that honor Italian tradition while celebrating the
                Mediterranean's vibrant bounty.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                Every recipe carries the warmth of Mamma Maria's kitchen, where family gatherings
                inspired a lifetime of culinary passion.
              </p>
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-wine font-semibold hover:text-wine-dark transition-colors"
              >
                Discover Our Story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">The Experience</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark">What Awaits You</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="card-hover bg-white text-center p-8 rounded-2xl shadow-sm"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-wine/10 to-wine/5 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                  <feat.icon className="text-wine -rotate-3" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-wine-dark">{feat.title}</h3>
                <p className="text-warm-gray leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALLERY SECTION ============ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">A Glimpse Inside</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark">From Our Kitchen & Cellar</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <motion.div
                key={img.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group img-zoom rounded-xl overflow-hidden relative cursor-pointer"
              >
                <img src={img.src} alt={img.alt} className="w-full h-48 sm:h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-wine-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <p className="text-white font-semibold text-sm">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="py-20 sm:py-28 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Guest Stories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark">What Our Guests Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="card-hover bg-white rounded-2xl p-8 shadow-sm relative"
              >
                <span className="absolute top-4 right-6 text-6xl text-wine/5 font-serif leading-none">"</span>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-warm-gray leading-relaxed mb-6 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                  "{t.text}"
                </p>
                <p className="text-wine-dark font-semibold text-sm">— {t.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80"
            alt="Fine dining experience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-wine-dark/85" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white"
        >
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-4">Join Us Tonight</p>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">Your Table is Waiting</h2>
          <p className="text-white/70 mb-10 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Experience the warmth of MaMi's — where every evening is a celebration
            of flavor, family, and the finest Mediterranean traditions.
          </p>
          <Link
            to="/reserve"
            className="group inline-flex items-center gap-2 bg-gold text-wine-dark px-10 py-4 rounded-full font-semibold text-lg hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
          >
            Reserve Your Experience
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
