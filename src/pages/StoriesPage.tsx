import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { fetchPublishedStories, fetchCategories } from '@/lib/api';
import type { Story, Category } from '@/lib/supabase';
import StoryCard from '@/components/StoryCard';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPublishedStories(), fetchCategories()])
      .then(([s, c]) => {
        setStories(s);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? stories.filter((s) => s.category?.slug === activeCategory)
    : stories;

  return (
    <div className="relative min-h-screen pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-ivory-400 hover:text-gold-500 transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3" strokeWidth={1} />
          Back
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-serif text-5xl md:text-7xl mb-4"
          style={{ color: '#e8e2d8' }}
        >
          The Stories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-body text-sm font-light tracking-widest uppercase text-ivory-400 mb-16"
        >
          Every story has its own atmosphere
        </motion.p>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-4 mb-16">
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-ink-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
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
    </div>
  );
}
