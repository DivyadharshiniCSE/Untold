import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Particles from '@/components/Particles';
import { fetchPublishedStories, fetchFeaturedStory, fetchCategories } from '@/lib/api';
import type { Story, Category } from '@/lib/supabase';
import StoryCard from '@/components/StoryCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [featured, setFeatured] = useState<Story | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showEgg, setShowEgg] = useState(false);
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPublishedStories(), fetchFeaturedStory(), fetchCategories()])
      .then(([s, f, c]) => {
        setStories(s);
        setFeatured(f);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (logoClicks >= 5) {
      setShowEgg(true);
      setTimeout(() => setShowEgg(false), 4000);
      setLogoClicks(0);
    }
  }, [logoClicks]);

  const filteredStories = activeCategory
    ? stories.filter((s) => s.category?.slug === activeCategory)
    : stories;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("Your message disappeared into the darkness. I'll find it.");
  };

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, #1a1612 0%, #0a0908 70%)',
          }}
        />

        {/* Slow light movement */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(201, 169, 110, 0.08), transparent 50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 70% 60%, rgba(201, 169, 110, 0.06), transparent 50%)',
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Particles */}
        <Particles type="dust" color="#c9a96e" count={20} />

        {/* Content */}
        <div className="relative z-10 text-center px-6 mt-10">
          <motion.h1
            custom={0.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight"
            style={{ color: '#e8e2d8' }}
            onClick={() => setLogoClicks((c) => c + 1)}
          >
            UNSAID
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-body text-sm md:text-base font-light tracking-[0.2em] uppercase mt-6"
            style={{ color: '#8a8278' }}
          >
            Some stories were never meant to be spoken.
          </motion.p>
          


          <motion.div
            custom={2.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-16"
          >
            <a
              href="#discovery"
              className="inline-flex flex-col items-center gap-3 group"
            >
              <span className="font-body text-xs tracking-[0.3em] uppercase text-ivory-300 group-hover:text-gold-500 transition-colors duration-500">
                Enter the stories
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowDown className="w-4 h-4 text-gold-500" strokeWidth={1} />
              </motion.div>
            </a>
          </motion.div>
        </div>

        {/* Easter egg */}
        {showEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 font-serif text-lg italic text-gold-500/70"
          >
            Some things are better left unsaid.
          </motion.div>
        )}
      </section>

      {/* Emotional Discovery */}
      <section id="discovery" className="relative py-32 md:py-48 px-6 overflow-hidden bg-ink-900 border-t border-ink-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="font-serif text-3xl md:text-5xl mb-16"
            style={{ color: '#e8e2d8' }}
          >
            WHAT BROUGHT YOU HERE TONIGHT?
          </motion.h2>
          
          <div className="flex flex-col gap-6 items-center">
            {[
              'I miss someone',
              'I can\'t sleep',
              'I have something unsaid',
              'I want to remember',
              'I just want to read',
              'I need a new beginning'
            ].map((option, i) => (
              <motion.a
                key={option}
                href="#stories"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="font-body text-sm md:text-base font-light tracking-[0.2em] uppercase text-ivory-400 hover:text-gold-500 transition-colors duration-500 border-b border-transparent hover:border-gold-500/30 pb-1"
              >
                {option}
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Unsaid Section */}
      <section className="relative py-32 md:py-48 px-6 overflow-hidden bg-ink-950">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="font-body text-[10px] tracking-[0.4em] uppercase mb-8"
            style={{ color: '#c9a96e' }}
          >
            WHY UNSAID?
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.5 }}
            className="font-serif text-2xl md:text-4xl leading-relaxed italic"
            style={{ color: '#e8e2d8' }}
          >
            “Because some stories don't disappear simply because we never tell them.”
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 1.5 }}
            className="font-body text-xs tracking-[0.3em] uppercase mt-8 text-ivory-500"
          >
            — DD
          </motion.p>
        </div>
      </section>

      {/* Featured Story */}
      {featured && (
        <section className="relative py-20 px-6 bg-ink-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <Link
                to={`/stories/${featured.slug}`}
                data-cursor="open"
                className="group block relative overflow-hidden"
                style={{ aspectRatio: '21/9' }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-[2s] group-hover:scale-105"
                  style={{
                    background: featured.cover_image
                      ? `url(${featured.cover_image}) center/cover`
                      : 'linear-gradient(135deg, #1a1410, #2a1f18)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-4">
                    Featured
                  </span>
                  <h3 className="font-serif text-4xl md:text-6xl mb-3" style={{ color: '#e8e2d8' }}>
                    {featured.title}
                  </h3>
                  {featured.subtitle && (
                    <p className="font-body text-base font-light text-ivory-300 max-w-xl mb-6">
                      {featured.subtitle}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-gold-500 group-hover:gap-5 transition-all duration-500">
                    Read the story
                    <span className="w-12 h-px bg-gold-500" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* The Stories */}
      <section id="stories" className="relative py-20 px-6 bg-ink-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: '#e8e2d8' }}>
              The Stories
            </h2>
            <p className="font-body text-sm font-light tracking-widest uppercase text-ivory-400">
              Every story has its own atmosphere
            </p>
          </motion.div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 border-b ${
                  !activeCategory
                    ? 'text-gold-500 border-gold-500'
                    : 'text-ivory-400 border-transparent hover:text-ivory-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase transition-all duration-300 border-b ${
                    activeCategory === cat.slug
                      ? 'text-gold-500 border-gold-500'
                      : 'text-ivory-400 border-transparent hover:text-ivory-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Story Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-ink-800 animate-pulse" />
              ))}
            </div>
          ) : filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                >
                  <StoryCard story={story} index={i} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-ivory-400 italic">
                The stories are still being written...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Selected Quote */}
      <section className="relative py-32 px-6 overflow-hidden bg-ink-950">
        <Particles type="glow" color="#c9a96e" count={5} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="font-serif text-3xl md:text-4xl italic leading-relaxed"
            style={{ color: '#e8e2d8' }}
          >
            "Maybe some people enter our lives only to become memories."
          </motion.blockquote>
        </div>
      </section>

      {/* About DD Section */}
      <section id="about" className="relative py-32 px-6 bg-ink-900 border-t border-ink-800/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="w-56 h-80 shrink-0 overflow-hidden relative group"
            style={{ 
              borderRadius: '12rem 12rem 0.5rem 0.5rem',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' 
            }}
          >
            <div className="absolute inset-0 border border-gold-500/20 rounded-[12rem_12rem_0.5rem_0.5rem] z-10 pointer-events-none group-hover:border-gold-500/40 transition-colors duration-700" />
            <img 
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" 
              alt="DD Editorial Portrait" 
              className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6" style={{ color: '#e8e2d8' }}>
              ABOUT THE PERSON BEHIND UNSAID
            </h2>
            <p className="font-body text-base font-light leading-relaxed text-ivory-300 mb-6 italic">
              "I write down the things that are easier to feel than to say."
            </p>
            <p className="font-body text-sm font-light leading-relaxed text-ivory-400">
              Welcome to my digital sanctuary. This space was not created to be a traditional blog or portfolio. It is an emotional archive—a quiet room where thoughts, letters, and unspoken memories reside. I believe the written word should remain the hero, surrounded by atmospheres that let you truly feel what was unsaid.
            </p>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase mt-8 text-gold-500">
              — DD_PARANTHAMAN
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-6 bg-ink-950">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl mb-4" style={{ color: '#e8e2d8' }}>
              IF YOU FOUND SOMETHING HERE...
            </h2>
            <p className="font-body text-sm font-light tracking-widest uppercase text-ivory-400 mb-16">
              Leave a signal.
            </p>
            
            {!contactStatus ? (
              <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto space-y-12 text-left mt-24">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Who is leaving this signal?"
                    required
                    className="w-full bg-transparent border-b border-ink-800 py-4 font-serif text-2xl md:text-3xl text-ivory-200 placeholder:text-ink-600 focus:border-transparent focus:outline-none transition-all duration-700 peer"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-500 peer-focus:w-full transition-all duration-700 ease-out" />
                </div>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Where should I reply?"
                    required
                    className="w-full bg-transparent border-b border-ink-800 py-4 font-serif text-2xl md:text-3xl text-ivory-200 placeholder:text-ink-600 focus:border-transparent focus:outline-none transition-all duration-700 peer"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-500 peer-focus:w-full transition-all duration-700 ease-out" />
                </div>
                <div className="relative group">
                  <textarea
                    placeholder="What did you want to say?"
                    required
                    rows={3}
                    className="w-full bg-transparent border-b border-ink-800 py-4 font-serif text-2xl md:text-3xl text-ivory-200 placeholder:text-ink-600 focus:border-transparent focus:outline-none transition-all duration-700 peer resize-none"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-500 peer-focus:w-full transition-all duration-700 ease-out" />
                </div>
                <div className="text-center pt-12">
                  <button
                    type="submit"
                    className="group relative inline-flex flex-col items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-gold-500/70 hover:text-gold-500 transition-colors duration-500"
                  >
                    <span className="relative z-10">Send into the void</span>
                    <span className="w-px h-12 bg-gold-500/30 group-hover:bg-gold-500 group-hover:h-20 transition-all duration-700" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12"
              >
                <p className="font-serif text-2xl italic text-ivory-400 leading-relaxed">
                  {contactStatus}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer / Final Screen */}
      <footer className="relative py-48 px-6 bg-[#030303] flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="space-y-6 font-serif text-2xl md:text-3xl italic leading-relaxed"
            style={{ color: '#8a8278' }}
          >
            <p>You reached the end.</p>
            <p>Maybe you found a story.</p>
            <p>Maybe you found something<br/>that reminded you of yourself.</p>
            <p>Either way—</p>
            <p>thank you for staying.</p>
            <p className="inline-block text-gold-500 mt-8 not-italic font-body text-[10px] tracking-[0.3em] uppercase">
              — DD
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.5 }}
            className="mt-24 pt-8 border-t border-ink-800/50 flex justify-center gap-8 text-[10px] tracking-[0.25em] uppercase text-ivory-500"
          >
            <Link to="/stories" className="hover:text-gold-500 transition-colors">Stories</Link>
            <Link to="/story-studio" className="hover:text-gold-500 transition-colors">Studio</Link>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
