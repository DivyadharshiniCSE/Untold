import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import Particles from '@/components/Particles';
import { fetchStoryBySlug, fetchRelatedStories } from '@/lib/api';
import { getThemePreset, type ThemePreset } from '@/lib/designTokens';
import type { Story } from '@/lib/supabase';
import StoryCard from '@/components/StoryCard';

type Phase = 'title' | 'reading' | 'ending' | 'ended';

export default function StoryReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [related, setRelated] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('title');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setPhase('title');
    fetchStoryBySlug(slug)
      .then((s) => {
        setStory(s);
        if (s) {
          fetchRelatedStories(s.id, s.category_id, 3).then(setRelated);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Scroll to top on story change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Music control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicPlaying && story?.music?.url) {
      audio.volume = muted ? 0 : volume;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [musicPlaying, muted, volume, story]);

  // Fade out music on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Detect scroll for ending
  useEffect(() => {
    if (phase !== 'reading') return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollY / totalHeight > 0.95) {
        setPhase('ending');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase]);

  const themePreset: ThemePreset = story?.theme
    ? getThemePreset(story.theme.visual_style || story.theme.mood || 'warmLove') ||
      getThemePreset('warmLove')!
    : getThemePreset('warmLove')!;

  const palette = themePreset.palette;
  const accent = story?.theme?.accent_color || palette.accent;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bg }}>
        <div className="font-serif text-2xl animate-pulse" style={{ color: palette.textMuted }}>
          Opening the story...
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: palette.bg }}>
        <p className="font-serif text-3xl" style={{ color: palette.text }}>This story was never written.</p>
        <Link to="/stories" className="text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>
          Back to the stories
        </Link>
      </div>
    );
  }

  const paragraphs = story.content.split('\n').filter((p) => p.trim());
  const readingWidthClass =
    themePreset.readingWidth === 'narrow' ? 'reading-narrow'
    : themePreset.readingWidth === 'wide' ? 'reading-wide'
    : 'reading-medium';

  const startReading = () => {
    setPhase('reading');
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="relative min-h-screen" style={{ background: palette.bg, color: palette.text }}>
      {/* Hidden audio element */}
      {story.music?.url && (
        <audio ref={audioRef} src={story.music.url} loop preload="none" />
      )}

      {/* Background layer */}
      <div className="fixed inset-0 z-0">
        {story.theme?.background_url && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${story.theme.background_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: story.theme.background_opacity,
              filter: story.theme.background_blur > 0 ? `blur(${story.theme.background_blur}px)` : 'none',
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${palette.bg}cc, ${palette.bgSecondary}cc)`,
          }}
        />
        <Particles type={themePreset.particleStyle} color={accent} count={20} />
      </div>

      {/* Back link */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate('/stories')}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: palette.text }}
        >
          <ArrowLeft className="w-3 h-3" strokeWidth={1} />
          Stories
        </button>
      </div>

      {/* Music control */}
      {story.music?.url && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => setMusicPlaying(!musicPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-all"
            style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}
            aria-label={musicPlaying ? 'Pause music' : 'Play music'}
          >
            {musicPlaying ? <Pause className="w-4 h-4" strokeWidth={1} /> : <Play className="w-4 h-4" strokeWidth={1} />}
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: palette.text }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={1} /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={1} />}
          </button>
          <span className="text-[9px] tracking-[0.2em] uppercase hidden md:block" style={{ color: palette.textMuted }}>
            {story.music.title || story.music.mood || 'Ambient'}
          </span>
        </div>
      )}

      {/* Title Phase */}
      <AnimatePresence mode="wait">
        {phase === 'title' && (
          <motion.section
            key="title"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="text-center"
            >
              {story.category && (
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-8"
                  style={{ color: accent }}
                >
                  {story.category.name}
                </p>
              )}
              <h1
                className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-6"
                style={{ color: palette.text, fontFamily: themePreset.typography.heading }}
              >
                {story.title}
              </h1>
              {story.subtitle && (
                <p
                  className="font-body text-lg font-light italic mb-12 max-w-xl mx-auto"
                  style={{ color: palette.textMuted }}
                >
                  {story.subtitle}
                </p>
              )}
              <button
                onClick={startReading}
                className="inline-flex flex-col items-center gap-4 group"
              >
                <span
                  className="text-[10px] tracking-[0.3em] uppercase transition-colors"
                  style={{ color: palette.textMuted }}
                >
                  Begin reading
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-px h-12"
                  style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}
                />
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Reading Phase */}
      {phase !== 'title' && (
        <div ref={contentRef} className="relative z-10">
          {/* Content */}
          <article className={`mx-auto px-6 pt-32 pb-20 ${readingWidthClass}`}>
            {paragraphs.map((para, i) => {
              // Check if this paragraph is a quote moment
              const isQuote = story.quotes?.some(
                (q) => q.quote_text.trim() === para.trim()
              );

              if (isQuote) {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 2 }}
                    className="quote-moment"
                    style={{ color: accent }}
                  >
                    {para}
                  </motion.div>
                );
              }

              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1, delay: 0.1 }}
                  className="font-body text-lg md:text-xl font-light leading-[1.8] mb-8"
                  style={{ color: palette.text }}
                >
                  {para}
                </motion.p>
              );
            })}

            {/* Chapters */}
            {story.chapters?.map((chapter) => (
              <div key={chapter.id} className="mt-20">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                  className="text-center mb-12"
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: accent }}>
                    Chapter {romanNumeral(chapter.chapter_number)}
                  </p>
                  {chapter.title && (
                    <h2 className="font-serif text-3xl md:text-4xl" style={{ color: palette.text, fontFamily: themePreset.typography.heading }}>
                      {chapter.title}
                    </h2>
                  )}
                </motion.div>
                {chapter.image_url && (
                  <div className="my-12">
                    <img
                      src={chapter.image_url}
                      alt={chapter.title || ''}
                      className="w-full max-h-[60vh] object-cover"
                      style={{ filter: 'brightness(0.85)' }}
                    />
                  </div>
                )}
                {chapter.content.split('\n').filter((p) => p.trim()).map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="font-body text-lg md:text-xl font-light leading-[1.8] mb-8"
                    style={{ color: palette.text }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            ))}
          </article>

          {/* Ending */}
          <AnimatePresence>
            {phase === 'ending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 3 }}
                className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
                style={{ background: `${palette.bg}f0` }}
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 2, delay: 1 }}
                  className="font-serif text-4xl md:text-6xl mb-12"
                  style={{ color: palette.text, fontFamily: themePreset.typography.heading }}
                >
                  The End
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 3 }}
                  className="font-body text-base font-light italic text-center mb-16 max-w-md"
                  style={{ color: palette.textMuted }}
                >
                  Some stories end.
                  <br />
                  Some simply become memories.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 5 }}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <Link
                    to="/stories"
                    className="text-[10px] tracking-[0.3em] uppercase border-b pb-1 transition-colors"
                    style={{ color: accent, borderColor: accent }}
                  >
                    Back to the stories
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Related stories */}
          {phase === 'ending' && related.length > 0 && (
            <section className="relative z-10 py-20 px-6" style={{ background: palette.bg }}>
              <div className="max-w-5xl mx-auto">
                <h3 className="font-serif text-2xl md:text-3xl text-center mb-12" style={{ color: palette.text }}>
                  If this story stayed with you...
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((s, i) => (
                    <StoryCard key={s.id} story={s} index={i} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function romanNumeral(num: number): string {
  const romans: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [value, symbol] of romans) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}
