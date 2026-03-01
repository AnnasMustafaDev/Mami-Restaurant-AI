import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reserve', label: 'Reservations' },
  { to: '/about', label: 'About' },
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Top accent bar */}
      <div className="bg-text text-white/70 text-xs py-1.5 hidden sm:block">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="tracking-wide">
            Willkommen bei Marcel &amp; Miriam — Oderberger Straße 13, 10435 Berlin
          </span>
          <a
            href="tel:+493023916567"
            className="flex items-center gap-1.5 hover:text-accent transition-colors duration-200"
          >
            <Phone size={11} />
            <span>+49 30 239 165 67</span>
          </a>
        </div>
      </div>

      {/* Main header — sticky */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        {/* Accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="MaMi's Food & Wine — Home">
              <div className="w-10 h-10 rounded-[--radius-md] border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-200">
                <span className="text-primary text-lg font-bold group-hover:text-white transition-colors font-[Poppins]">
                  M
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary leading-tight tracking-wide font-[Poppins]">
                  MaMi's
                </span>
                <span className="text-[10px] text-accent uppercase tracking-[0.2em] font-semibold leading-tight">
                  Food & Wine
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 text-sm font-medium rounded-[--radius-sm] transition-all duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}

              <Link
                to="/reserve"
                className="ml-4 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-[--radius-md] hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
              >
                <Sparkles size={14} />
                Book Your Table
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-[--radius-sm] hover:bg-primary/5 transition-colors text-text-secondary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
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
          <nav className="px-4 pb-5 pt-1 space-y-1 border-t border-primary/5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[--radius-md] text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/8 text-primary'
                      : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 px-1">
              <Link
                to="/reserve"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-sm font-semibold rounded-[--radius-md] hover:bg-primary-dark transition-colors"
              >
                <Sparkles size={14} />
                Book Your Table
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
