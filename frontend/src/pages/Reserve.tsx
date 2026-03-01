import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CalendarDays, Clock, User, PartyPopper, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
      setError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!form.guest_name.trim()) errors.guest_name = 'Name is required';
    if (form.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email)) {
      errors.guest_email = 'Please enter a valid email address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createReservation(form);
      setBookingRef(result.booking_ref);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation. Please try again.');
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
            alt="Elegant dining table set for guests"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-text/80" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white"
        >
          <p className="text-accent tracking-[0.2em] uppercase text-sm font-semibold mb-3">Secure Your Spot</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Book Your Table in Seconds</h1>
          <p className="text-white/65" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            Choose your date → Enter your details → Confirm. It's that simple.
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
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={4}
        >
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <div key={s.label} className="flex flex-col items-center gap-2 flex-1 relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-px">
                    <div
                      className={`h-full transition-colors duration-500 ${
                        isDone ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}

                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                        : 'bg-gray-100 text-text-muted'
                  }`}
                >
                  {isDone ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                <span className={`text-xs font-medium transition-colors hidden sm:block ${
                  isActive || isDone ? 'text-primary' : 'text-text-muted'
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
              className="bg-card rounded-[--radius-lg] p-8 shadow-sm border border-primary/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-text">When would you like to dine?</h3>
              <div>
                <label htmlFor="reserve-date" className="block text-sm font-semibold text-text mb-1.5">Date</label>
                <input
                  id="reserve-date"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="reserve-party" className="block text-sm font-semibold text-text mb-1.5">Party Size</label>
                <select
                  id="reserve-party"
                  value={form.party_size}
                  onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
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
                className="w-full bg-primary text-white py-3.5 rounded-[--radius-md] font-semibold hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
              >
                Select Time
                <ArrowRight size={16} />
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
              className="bg-card rounded-[--radius-lg] p-8 shadow-sm border border-primary/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-text">
                Pick a time for <span className="text-primary">{form.date}</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot, i) => (
                  <motion.button
                    key={slot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setForm({ ...form, time_slot: slot })}
                    className={`py-3 rounded-[--radius-md] text-sm font-medium transition-all duration-200 ${
                      form.time_slot === slot
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-bg text-text-secondary hover:bg-primary/8 hover:text-primary'
                    }`}
                  >
                    {slot}
                  </motion.button>
                ))}
              </div>
              {availability && !availability.available && (
                <div className="flex items-start gap-2 text-error text-sm bg-error/5 px-4 py-3 rounded-[--radius-md]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{availability.message}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-[--radius-md] font-medium text-text-secondary hover:bg-bg transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckAvailability}
                  disabled={!form.time_slot || loading}
                  className="flex-1 bg-primary text-white py-3 rounded-[--radius-md] font-semibold hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Checking...' : 'Check Availability'}
                  {!loading && <ArrowRight size={16} />}
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
              className="bg-card rounded-[--radius-lg] p-8 shadow-sm border border-primary/5 space-y-5"
            >
              <h3 className="text-lg font-bold text-text">Almost there — enter your details</h3>
              <div>
                <label htmlFor="guest-name" className="block text-sm font-semibold text-text mb-1.5">Name *</label>
                <input
                  id="guest-name"
                  type="text"
                  value={form.guest_name}
                  onChange={(e) => { setForm({ ...form, guest_name: e.target.value }); setFieldErrors(prev => ({ ...prev, guest_name: '' })); }}
                  placeholder="Your full name"
                  className={`w-full px-4 py-3 border rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    fieldErrors.guest_name ? 'border-error' : 'border-gray-200 focus:border-primary/30'
                  }`}
                  aria-describedby={fieldErrors.guest_name ? 'name-error' : undefined}
                />
                {fieldErrors.guest_name && (
                  <p id="name-error" className="mt-1 text-xs text-error flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.guest_name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="guest-email" className="block text-sm font-semibold text-text mb-1.5">Email</label>
                <input
                  id="guest-email"
                  type="email"
                  value={form.guest_email}
                  onChange={(e) => { setForm({ ...form, guest_email: e.target.value }); setFieldErrors(prev => ({ ...prev, guest_email: '' })); }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 border rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    fieldErrors.guest_email ? 'border-error' : 'border-gray-200 focus:border-primary/30'
                  }`}
                  aria-describedby={fieldErrors.guest_email ? 'email-error' : undefined}
                />
                {fieldErrors.guest_email && (
                  <p id="email-error" className="mt-1 text-xs text-error flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.guest_email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="guest-phone" className="block text-sm font-semibold text-text mb-1.5">Phone</label>
                <input
                  id="guest-phone"
                  type="tel"
                  value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                  placeholder="+49 (30) 000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="guest-requests" className="block text-sm font-semibold text-text mb-1.5">Special Requests</label>
                <textarea
                  id="guest-requests"
                  value={form.special_requests}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Allergies, celebrations, seating preferences..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-[--radius-md] bg-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 text-error text-sm bg-error/5 px-4 py-3 rounded-[--radius-md]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-[--radius-md] font-medium text-text-secondary hover:bg-bg transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.guest_name || loading}
                  className="flex-1 bg-primary text-white py-3.5 rounded-[--radius-md] font-semibold hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Booking...' : 'Confirm Reservation'}
                  {!loading && <Check size={16} />}
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
              className="bg-card rounded-[--radius-lg] p-10 shadow-sm border border-primary/5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="text-success" size={36} />
              </motion.div>
              <h3 className="text-2xl font-bold text-text mb-3">Reservation Confirmed!</h3>
              <p className="text-text-secondary mb-2 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your table has been booked for {form.party_size} guest{form.party_size > 1 ? 's' : ''}
              </p>
              <p className="text-text-secondary mb-6">
                <span className="font-semibold text-text">{form.date}</span> at{' '}
                <span className="font-semibold text-text">{form.time_slot}</span>
              </p>
              <div className="bg-bg rounded-[--radius-md] p-4 inline-block">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-primary text-lg">{bookingRef}</p>
              </div>
              <p className="text-text-secondary text-sm mt-6">
                We look forward to welcoming you at MaMi's!
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-text-muted text-xs">
                  Need to make changes? Contact us at +49 30 239 165 67 or ask Sofia.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
