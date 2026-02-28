import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CalendarDays, Clock, User, PartyPopper } from 'lucide-react';
import { createReservation, checkAvailability } from '../services/api';

const steps = [
  { label: 'Date & Size', icon: CalendarDays },
  { label: 'Time', icon: Clock },
  { label: 'Details', icon: User },
  { label: 'Confirmed', icon: PartyPopper },
];

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Reserve() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    party_size: 2,
    date: '',
    time_slot: '',
    special_requests: '',
  });
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
  ];

  const handleCheckAvailability = async () => {
    if (!form.date || !form.time_slot) return;
    setLoading(true);
    try {
      const result = await checkAvailability(form.date, form.time_slot, form.party_size);
      setAvailability(result);
      if (result.available) setStep(3);
    } catch {
      setError('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createReservation(form);
      setBookingRef(result.booking_ref);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80"
            alt="Fine dining table setup"
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
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-medium mb-3">Book Your Visit</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Reserve a Table</h1>
          <p className="text-white/70" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            Choose your preferred date and time for an unforgettable evening
          </p>
        </motion.div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between items-center mb-10 px-4"
        >
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <div key={s.label} className="flex flex-col items-center gap-2 flex-1 relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-px">
                    <div
                      className={`h-full transition-colors duration-500 ${
                        isDone ? 'bg-wine' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}

                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isDone
                      ? 'bg-wine text-white shadow-md shadow-wine/20'
                      : isActive
                        ? 'bg-wine text-white shadow-lg shadow-wine/30 scale-110'
                        : 'bg-gray-100 text-warm-gray'
                  }`}
                >
                  {isDone ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                <span className={`text-xs font-medium transition-colors hidden sm:block ${
                  isActive || isDone ? 'text-wine' : 'text-warm-gray'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Date & Party Size */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-wine/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-wine-dark">When would you like to dine?</h3>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Party Size</label>
                <select
                  value={form.party_size}
                  onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => form.date && setStep(2)}
                disabled={!form.date}
                className="w-full bg-wine text-white py-3 rounded-xl font-semibold hover:bg-wine-dark transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-wine/20"
              >
                Select Time
              </button>
            </motion.div>
          )}

          {/* Step 2: Time Slot */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-wine/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-wine-dark">
                Select a time for <span className="text-wine">{form.date}</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot, i) => (
                  <motion.button
                    key={slot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setForm({ ...form, time_slot: slot })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      form.time_slot === slot
                        ? 'bg-wine text-white shadow-md shadow-wine/20 scale-[1.02]'
                        : 'bg-cream text-warm-gray hover:bg-wine/10 hover:text-wine'
                    }`}
                  >
                    {slot}
                  </motion.button>
                ))}
              </div>
              {availability && !availability.available && (
                <p className="text-error text-sm bg-error/5 px-4 py-2 rounded-lg">{availability.message}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-medium text-warm-gray hover:bg-cream transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckAvailability}
                  disabled={!form.time_slot || loading}
                  className="flex-1 bg-wine text-white py-3 rounded-xl font-semibold hover:bg-wine-dark transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-wine/20"
                >
                  {loading ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Guest Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-wine/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-wine-dark">Your Details</h3>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wine-dark mb-1.5">Special Requests</label>
                <textarea
                  value={form.special_requests}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Allergies, celebrations, seating preferences..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-cream/50 focus:outline-none focus:ring-2 focus:ring-wine/30 transition-all resize-none"
                />
              </div>
              {error && <p className="text-error text-sm bg-error/5 px-4 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-medium text-warm-gray hover:bg-cream transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.guest_name || loading}
                  className="flex-1 bg-wine text-white py-3 rounded-xl font-semibold hover:bg-wine-dark transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-wine/20"
                >
                  {loading ? 'Booking...' : 'Confirm Reservation'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && bookingRef && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              className="bg-white rounded-2xl p-10 shadow-sm border border-wine/5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="text-olive" size={36} />
              </motion.div>
              <h3 className="text-2xl font-bold text-wine-dark mb-3">Reservation Confirmed!</h3>
              <p className="text-warm-gray mb-2 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your table has been booked for {form.party_size} guest{form.party_size > 1 ? 's' : ''}
              </p>
              <p className="text-warm-gray mb-6">
                <span className="font-semibold text-wine-dark">{form.date}</span> at{' '}
                <span className="font-semibold text-wine-dark">{form.time_slot}</span>
              </p>
              <div className="bg-cream rounded-xl p-4 inline-block">
                <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-wine text-lg">{bookingRef}</p>
              </div>
              <p className="text-warm-gray text-sm mt-6">
                A confirmation email will be sent to {form.guest_email || 'you'}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
