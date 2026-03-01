import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Wine, CalendarDays, Star, ArrowRight, Sparkles, MessageCircle, Bot } from 'lucide-react';

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
    desc: "Hand-selected natural wines from Europe's finest regions, each bottle telling its own terroir story.",
  },
  {
    icon: CalendarDays,
    title: 'Book in Seconds',
    desc: 'Reserve your table online instantly, or let Sofia our AI host handle the details for you.',
  },
  {
    icon: Bot,
    title: 'AI Concierge',
    desc: 'Get tailored dish recommendations, allergen info, and wine pairings — all powered by Sofia.',
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
      {/* ============ HERO — SPLIT LAYOUT ============ */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"
            alt="MaMi's restaurant interior with warm ambient lighting"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="text-accent tracking-[0.3em] uppercase text-xs font-semibold mb-4"
              >
                Italian-Mediterranean Bistro · Berlin
              </motion.p>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-3 leading-[0.95] text-white"
              >
                MaMi's
                <span className="block text-accent italic font-medium text-3xl sm:text-4xl mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Food & Wine
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-white/75 mb-8 max-w-lg leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem' }}
              >
                Where family traditions meet exceptional cuisine.
                Seasonal dishes, natural wines — and Sofia, your AI dining concierge.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/reserve"
                  className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-[--radius-md] font-semibold hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 text-base"
                >
                  <CalendarDays size={20} />
                  Reserve a Table
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => {
                    const chatBtn = document.querySelector('[aria-label="Open chat with Sofia"]') as HTMLButtonElement;
                    chatBtn?.click();
                  }}
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-[--radius-md] font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-200 text-base"
                >
                  <MessageCircle size={20} />
                  Ask the AI
                </button>
              </motion.div>
            </motion.div>

            {/* Right — Featured image */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-[--radius-xl] overflow-hidden shadow-2xl border-2 border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=500&fit=crop"
                    alt="Signature dish at MaMi's"
                    className="w-full h-[420px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-accent/25 rounded-[--radius-xl] -z-10" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/15 rounded-[--radius-xl] -z-10" />
              </div>
            </motion.div>
          </div>
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
      <section className="section-spacing bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative"
            >
              <div className="img-zoom rounded-[--radius-xl] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80"
                  alt="Handmade pasta being prepared by chef"
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-accent/25 rounded-[--radius-xl] -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-[--radius-xl] -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">Our Philosophy</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-text">
                Crafted with Passion,
                <span className="block text-primary">Served with Love</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                At MaMi's, we believe food is more than sustenance — it's a conversation between
                cultures, seasons, and generations. Our kitchen transforms the finest seasonal
                ingredients into dishes that honor Italian tradition while celebrating the
                Mediterranean's vibrant bounty.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                Every recipe carries the warmth of Mamma Maria's kitchen, where family gatherings
                inspired a lifetime of culinary passion.
              </p>
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors duration-200"
              >
                Discover Our Story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="section-spacing bg-bg">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">The Experience</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text">What Awaits You</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="card-hover bg-card text-center p-8 rounded-[--radius-lg] shadow-sm"
              >
                <div className="w-14 h-14 bg-primary/8 rounded-[--radius-md] flex items-center justify-center mx-auto mb-5">
                  <feat.icon className="text-primary" size={26} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-text">{feat.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AI SECTION — UNIQUE SELLING POINT ============ */}
      <section className="section-spacing bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-text to-primary-dark rounded-[--radius-xl] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="text-accent" size={22} />
                  <span className="text-accent text-sm font-semibold tracking-wider uppercase">AI-Powered</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Meet Sofia — Your Dining Concierge
                </h2>
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                  Get dish recommendations, allergen info, wine pairings, and reservation help — fast.
                  Sofia knows our menu inside and out.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      const chatBtn = document.querySelector('[aria-label="Open chat with Sofia"]') as HTMLButtonElement;
                      chatBtn?.click();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-accent text-text px-6 py-3 rounded-[--radius-md] font-semibold hover:bg-accent-light transition-all duration-200"
                  >
                    <MessageCircle size={18} />
                    Get Tailored Recommendations
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { emoji: '🍷', text: 'Recommend a wine for seafood pasta' },
                  { emoji: '🥗', text: 'What vegan options do you have?' },
                  { emoji: '📅', text: 'Book a table for Saturday evening' },
                  { emoji: '⚠️', text: 'I have a gluten allergy — what can I eat?' },
                ].map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => {
                      const chatBtn = document.querySelector('[aria-label="Open chat with Sofia"]') as HTMLButtonElement;
                      chatBtn?.click();
                    }}
                    className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-[--radius-md] px-4 py-3 text-left transition-all duration-200 group"
                  >
                    <span className="text-lg shrink-0">{prompt.emoji}</span>
                    <span className="text-sm text-white/80 group-hover:text-white">{prompt.text}</span>
                    <ArrowRight size={14} className="ml-auto text-white/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GALLERY SECTION ============ */}
      <section className="section-spacing bg-bg">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">A Glimpse Inside</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text">From Our Kitchen & Cellar</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <motion.div
                key={img.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group img-zoom rounded-[--radius-lg] overflow-hidden relative cursor-pointer"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-48 sm:h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-semibold text-sm">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              to="/menu"
              className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors duration-200"
            >
              See Full Menu
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="section-spacing bg-bg-alt">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">Guest Stories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text">What Our Guests Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="card-hover bg-card rounded-[--radius-lg] p-8 shadow-sm relative"
              >
                <span className="absolute top-4 right-6 text-6xl text-primary/5 font-serif leading-none">"</span>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-text-secondary leading-relaxed mb-6 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                  "{t.text}"
                </p>
                <p className="text-text font-semibold text-sm">— {t.author}</p>
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
            alt="Elegant dining table set for a special evening"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-text/85" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white"
        >
          <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-4">Join Us Tonight</p>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">Your Table is Waiting</h2>
          <p className="text-white/65 mb-10 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Experience the warmth of MaMi's — where every evening is a celebration
            of flavor, family, and the finest Mediterranean traditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reserve"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-10 py-4 rounded-[--radius-md] font-semibold text-lg hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
            >
              <Sparkles size={18} />
              Book Your Table in Seconds
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Mobile bottom spacer for sticky bar */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
