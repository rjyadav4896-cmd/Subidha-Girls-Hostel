import { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';

interface NavigationProps {
  onLoginClick: () => void;
  onReadyToLiveClick: () => void;
}

export default function Navigation({ onLoginClick, onReadyToLiveClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Rooms', id: 'rooms' },
    { name: 'Facilities', id: 'facilities' },
    { name: 'Food', id: 'food' },
    { name: 'Events', id: 'events' },
    { name: 'Success', id: 'success' },
    { name: 'Guidelines', id: 'guidelines' },
    { name: 'Nearby', id: 'nearby' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => scrollToSection('home')} className="flex min-w-0 flex-shrink-0 items-center">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-sm sm:h-10 sm:w-10">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="ml-2 truncate text-base font-black text-blue-950 sm:text-xl">Subidha Girls Hostel</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={onReadyToLiveClick}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-blue-950 transition-colors hover:bg-sky-400"
            >
              Ready to Live
            </button>
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-blue-950 transition-colors hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <a href="tel:+9779706666497" className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 transition-colors">
              Call Now
            </a>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-2 flex-none rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              >
                {link.name}
              </button>
            ))}
            <a href="tel:+9779706666497" className="block mx-3 mt-2 rounded-lg bg-blue-950 px-4 py-2 text-center font-bold text-white">
              Call Now
            </a>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onReadyToLiveClick();
              }}
              className="mx-3 block w-[calc(100%-1.5rem)] rounded-lg bg-sky-500 px-4 py-2 text-center font-bold text-blue-950"
            >
              Ready to Live
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onLoginClick();
              }}
              className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-bold text-blue-950"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
