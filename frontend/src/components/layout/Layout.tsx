import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CalendarDays, MessageCircle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../chat/ChatWidget';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-sticky-bar md:hidden flex items-center gap-3">
        <Link
          to="/reserve"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-[--radius-md] font-semibold text-sm hover:bg-primary-dark transition-colors duration-200"
        >
          <CalendarDays size={16} />
          Reserve a Table
        </Link>
        <button
          onClick={() => {
            const chatBtn = document.querySelector('[aria-label="Open chat with Sofia"]') as HTMLButtonElement;
            chatBtn?.click();
          }}
          className="flex items-center justify-center gap-2 bg-card border-2 border-primary/20 text-primary py-3 px-4 rounded-[--radius-md] font-semibold text-sm hover:bg-primary/5 transition-colors duration-200"
          aria-label="Open AI chat"
        >
          <MessageCircle size={16} />
          Ask AI
        </button>
      </div>
    </div>
  );
}
