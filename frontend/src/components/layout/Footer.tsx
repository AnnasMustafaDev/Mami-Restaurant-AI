import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-wine-dark text-white/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              MaMi's Food & Wine
            </h3>
            <p className="text-sm text-white/60">
              Where every meal is a conversation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/menu" className="block text-sm hover:text-gold transition-colors">Menu</Link>
              <Link to="/reserve" className="block text-sm hover:text-gold transition-colors">Reservations</Link>
              <Link to="/about" className="block text-sm hover:text-gold transition-colors">About</Link>
              <Link to="/contact" className="block text-sm hover:text-gold transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">Visit Us</h4>
            <p className="text-sm">Oderberger Straße 13</p>
            <p className="text-sm">10435 Berlin</p>
            <p className="text-sm mt-2">
              <a href="tel:+493023916567" className="hover:text-gold transition-colors">+49 30 239 165 67</a>
            </p>
            <p className="text-sm">
              <a href="mailto:hello@mamis-berlin.de" className="hover:text-gold transition-colors">hello@mamis-berlin.de</a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} MaMi's Food & Wine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
