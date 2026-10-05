import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function DDOrb() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: 'ABOUT', href: '/#about' },
    { label: 'STORIES', href: '/stories' },
    { label: 'ATMOSPHERE', href: '/stories' },
    { label: 'MUSIC', href: '/stories' },
    { label: 'MEMORIES', href: '/#memories' },
    { label: 'CONTACT', href: '/#contact' },
  ];

  return (
    <>
      {/* The Floating Orb */}
      <motion.button
        className="fixed top-8 right-8 z-50 rounded-full bg-ivory-100 mix-blend-difference outline-none"
        style={{ width: '8px', height: '8px' }}
        whileHover={{ scale: 2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      />

      {/* The Fullscreen Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/95 backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-4 font-body text-[10px] tracking-[0.3em] uppercase text-ivory-500 hover:text-gold-500 transition-colors"
            >
              Close
            </button>

            <nav className="flex flex-col items-center gap-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="font-serif text-3xl md:text-5xl text-ivory-300 hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </nav>
            
            {/* Signature at bottom */}
            <div className="absolute bottom-12 font-body text-[10px] tracking-[0.3em] text-ivory-500 hover:text-gold-500 transition-colors">
              <Link to="/story-studio" onClick={() => setIsOpen(false)}>
                — DD
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
