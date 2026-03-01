import { motion } from 'framer-motion';
import { Heart, Leaf, Users, Award, Star, Wine, ChefHat, Flame, Globe, Music } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantInfo } from '../services/api';
import type { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string; size?: number }>> = {
  Heart, Leaf, Users, Award, Star, Wine, ChefHat, Flame, Globe, Music,
};

// Fallback data used while API is loading or if config is missing
const fallbackValues = [
  { icon: 'Heart', title: 'Passion', desc: 'Every dish is made with love and generations of Italian culinary wisdom.' },
  { icon: 'Leaf', title: 'Seasonal', desc: 'We source the freshest local ingredients, changing our menu with the seasons.' },
  { icon: 'Users', title: 'Family', desc: 'Our bistro is an extension of our family table — everyone is welcome.' },
  { icon: 'Award', title: 'Excellence', desc: 'We hold ourselves to the highest standards in every plate we serve.' },
];

const fallbackMilestones = [
  { year: '2018', title: 'Die Idee', desc: 'Marcel und Miriam träumen von einem Ort, wo gutes Essen und guter Wein die Menschen zusammenbringen.' },
  { year: '2019', title: 'Die Eröffnung', desc: 'MaMi\'s Food & Wine öffnet seine Türen in der Oderberger Straße 13, Prenzlauer Berg, Berlin.' },
  { year: '2021', title: 'Das Weinprogramm', desc: 'Wir starten unser kuratiertes Naturweinprogramm mit handverlesenen Weinen aus Deutschland und Europa.' },
  { year: '2024', title: 'Sofia tritt dem Team bei', desc: 'Unsere KI-Gastgeberin Sofia begleitet euch durch Menü und Reservierungen — auf Deutsch und Englisch.' },
];

export default function About() {
  const { data: info } = useQuery({
    queryKey: ['restaurant-info'],
    queryFn: getRestaurantInfo,
  });

  const about = info?.about;

  const heroSubtitle = about?.hero_subtitle ?? 'Seit 2019 — Berlin Prenzlauer Berg';
  const heroTitle = about?.hero_title ?? 'Our Story';
  const heroDescription = about?.hero_description ?? 'A family-run bistro where warm hospitality meets exceptional cuisine';
  const storyLabel = about?.story_label ?? 'Das Herz von MaMi\'s';
  const storyTitle = about?.story_title ?? 'Willkommen bei Marcel & Miriam';
  const storyParagraphs = about?.story_paragraphs ?? [
    'MaMi\'s Food & Wine ist ein Restaurant in Berlin Prenzlauer Berg, das warme Gastlichkeit mit außergewöhnlicher Küche verbindet. Gegründet von Marcel und Miriam, erzählt jedes Gericht eine Geschichte von Tradition, Leidenschaft und den feinsten saisonalen Zutaten.',
    'Mitten im Prenzlauer Berg, an der Oderberger Straße 13, heißen wir euch seit 2019 willkommen. Unsere Küche verbindet saisonale Rezepte mit mediterranem Flair — ehrlich, kreativ und immer mit Herz zubereitet.',
    'Unser Weinprogramm feiert Europas vielfältige Weinlandschaften — von deutschen Rieslingen bis zu toskanischen Klassikern. Jede Flasche ist handverlesen und perfekt auf unsere Gerichte abgestimmt.',
  ];
  const storyImageUrl = about?.story_image_url ?? 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80';
  const values = about?.values ?? fallbackValues;
  const milestones = about?.milestones ?? fallbackMilestones;
  const chef = about?.chef ?? {
    label: 'Unsere Gastgeber',
    name: 'Marcel & Miriam',
    paragraph1: 'MaMi\'s steht für Marcel und Miriam — zwei Menschen mit einer tiefen Leidenschaft für gutes Essen, natürliche Weine und echte Gastfreundschaft.',
    paragraph2: 'Ihre Philosophie ist einfach: qualitativ hochwertige, saisonale Zutaten, mit Liebe zubereitet und in entspannter Atmosphäre serviert. Jeder Abend bei MaMi\'s soll sich anfühlen wie ein Abend bei Freunden.',
    image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-wine-dark/80" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white"
        >
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">{heroSubtitle}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-white/70 max-w-2xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            {heroDescription}
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">{storyLabel}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark mb-6">
                {storyTitle}
              </h2>
              {storyParagraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-warm-gray leading-relaxed ${i < storyParagraphs.length - 1 ? 'mb-6' : ''} ${
                    i === 0 ? 'text-lg' : ''
                  }`}
                  style={i === 0 ? { fontFamily: "'Cormorant Garamond', serif" } : undefined}
                >
                  {p}
                </p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="img-zoom rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={storyImageUrl}
                  alt="Chef preparing a dish"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-gold/30 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">What Drives Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark">Our Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v: { icon: string; title: string; desc: string }, i: number) => {
              const Icon = iconMap[v.icon] || Heart;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card-hover bg-white rounded-2xl p-6 text-center shadow-sm"
                >
                  <div className="w-14 h-14 bg-wine/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-wine" size={24} />
                  </div>
                  <h3 className="font-semibold text-wine-dark mb-2">{v.title}</h3>
                  <p className="text-warm-gray text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Our Journey</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-wine-dark">Milestones</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-wine/15" />

            <div className="space-y-10">
              {milestones.map((m: { year: string; title: string; desc: string }, i: number) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-1 w-5 h-5 bg-wine rounded-full border-4 border-cream" />
                  <span className="text-gold font-bold text-sm tracking-wider">{m.year}</span>
                  <h3 className="text-lg font-semibold text-wine-dark mt-1">{m.title}</h3>
                  <p className="text-warm-gray mt-1 leading-relaxed">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-20 bg-wine-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="img-zoom rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1"
            >
              <img
                src={chef.image_url}
                alt={chef.name}
                className="w-full h-[400px] object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">{chef.label}</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">{chef.name}</h2>
              <p className="text-white/80 leading-relaxed mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}>
                {chef.paragraph1}
              </p>
              <p className="text-white/60 leading-relaxed">
                {chef.paragraph2}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
