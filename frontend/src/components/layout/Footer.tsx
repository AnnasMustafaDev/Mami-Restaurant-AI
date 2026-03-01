import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-text text-white/80 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3 font-[Poppins]">
              MaMi's Food & Wine
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Where every meal is a conversation between cultures, seasons, and generations.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent rounded-full" />
              <span className="text-accent text-xs font-medium tracking-wider uppercase">Since 2019</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">Explore</h4>
            <div className="space-y-2.5">
              <Link to="/menu" className="block text-sm hover:text-accent transition-colors duration-200">
                Our Menu
              </Link>
              <Link to="/reserve" className="block text-sm hover:text-accent transition-colors duration-200">
                Book a Table
              </Link>
              <Link to="/about" className="block text-sm hover:text-accent transition-colors duration-200">
                Our Story
              </Link>
              <Link to="/contact" className="block text-sm hover:text-accent transition-colors duration-200">
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">Visit Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-accent shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p>Oderberger Straße 13</p>
                  <p>10435 Berlin</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-accent shrink-0" />
                <a href="tel:+493023916567" className="text-sm hover:text-accent transition-colors duration-200">
                  +49 30 239 165 67
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-accent shrink-0" />
                <a href="mailto:hello@mamis-berlin.de" className="text-sm hover:text-accent transition-colors duration-200">
                  hello@mamis-berlin.de
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">Hours</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Clock size={15} className="text-accent shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p>Mon: Closed</p>
                  <p>Tue — Thu: 18:00 — 00:00</p>
                  <p>Fri — Sat: 18:00 — 01:00</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <span>&copy; {new Date().getFullYear()} MaMi's Food & Wine. All rights reserved.</span>
          <span>Crafted with love in Berlin</span>
        </div>
      </div>
    </footer>
  );
}
