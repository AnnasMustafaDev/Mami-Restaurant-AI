import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantInfo } from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: info } = useQuery({
    queryKey: ['restaurant-info'],
    queryFn: getRestaurantInfo,
  });

  const contact = info?.contact;

  const contactItems = [
    {
      icon: MapPin,
      title: 'Address',
      lines: contact?.address_lines ?? ['Oderberger Straße 13', '10435 Berlin'],
    },
    {
      icon: Phone,
      title: 'Phone',
      lines: [contact?.phone ?? '+49 30 239 165 67'],
    },
    {
      icon: Mail,
      title: 'Email',
      lines: [contact?.email ?? 'hello@mamis-berlin.de'],
    },
    {
      icon: Clock,
      title: 'Hours',
      lines: contact?.hours ?? [
        'Montag: Geschlossen',
        'Di — Do: 18:00 — 00:00',
        'Freitag: 18:00 — 01:00',
        'Samstag: 18:00 — 01:00',
        'Sonntag: Geschlossen',
      ],
    },
  ];

  const mapAddress = contact?.map_address ?? 'Oderberger Straße 13, 10435 Berlin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 sm:py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"
            alt="Restaurant exterior"
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
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/70 max-w-xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            We'd love to hear from you. Reach out for reservations, events, or just to say hello.
          </p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-wine-dark mb-6">Visit MaMi's</h2>
              <p className="text-warm-gray mb-8">
                Whether it's a question about our menu, a private event, or a special occasion — we're here for you.
              </p>
            </div>

            <div className="space-y-6">
              {contactItems.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-wine/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="text-wine" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wine-dark text-sm">{item.title}</h3>
                    {item.lines.map((line: string, j: number) => (
                      <p key={j} className="text-warm-gray text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-wine/5">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-olive" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-wine-dark mb-2">Message Sent!</h3>
                  <p className="text-warm-gray">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                    className="mt-4 text-wine font-medium text-sm hover:text-wine-dark transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-wine-dark mb-6">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-wine-dark mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wine-dark mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wine-dark mb-1.5">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/30 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-wine text-white py-3 rounded-xl font-semibold hover:bg-wine-dark transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-wine/20"
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden border border-wine/5"
        >
          <div className="h-64 sm:h-80 bg-gradient-to-br from-cream to-cream-dark flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin size={24} className="text-wine" />
              </div>
              <p className="text-wine-dark font-semibold">{mapAddress}</p>
              <p className="text-warm-gray text-sm mt-1">Interactive map coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
