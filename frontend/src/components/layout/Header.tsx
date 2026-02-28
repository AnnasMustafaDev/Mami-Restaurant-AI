import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reserve', label: 'Reservations' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Top accent bar */}
      <div className="bg-wine-dark text-white/70 text-xs py-1.5 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.05em' }}>
            Willkommen bei Marcel &amp; Miriam — Oderberger Straße 13, 10435 Berlin
          </span>
          <a href="tel:+493023916567" className="flex items-center gap-1.5 hover:text-gold transition-colors">
            <Phone size={11} />
            <span>+49 30 239 165 67</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {/* Gold accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border-2 border-wine flex items-center justify-center group-hover:bg-wine transition-all duration-300">
                <span
                  className="text-wine text-lg font-bold group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  M
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className="text-xl font-bold text-wine leading-tight tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  MaMi's
                </span>
                <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-medium leading-tight">
                  Food & Wine
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-wine' : 'text-warm-gray hover:text-wine'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-gold rounded-full" />
                    )}
                  </Link>
                );
              })}

              <Link
                to="/reserve"
                className="ml-4 px-5 py-2 bg-wine text-white text-sm font-medium rounded-full hover:bg-wine-dark transition-all hover:shadow-lg hover:shadow-wine/20"
              >
                Reserve a Table
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-wine/5 transition-colors text-warm-gray"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="px-4 pb-5 pt-1 space-y-1 border-t border-wine/5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-wine/10 text-wine'
                      : 'text-warm-gray hover:bg-wine/5 hover:text-wine'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 px-1">
              <Link
                to="/reserve"
                className="block text-center px-5 py-2.5 bg-wine text-white text-sm font-medium rounded-xl hover:bg-wine-dark transition-colors"
              >
                Reserve a Table
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
