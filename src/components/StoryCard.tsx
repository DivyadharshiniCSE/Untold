import { Link } from 'react-router-dom';
import type { Story } from '@/lib/supabase';
import { getThemePreset } from '@/lib/designTokens';

type Props = {
  story: Story;
  index?: number;
};

export default function StoryCard({ story, index = 0 }: Props) {
  const themePreset = story.theme
    ? getThemePreset(story.theme.visual_style || story.theme.mood || 'warmLove') ||
      getThemePreset('warmLove')!
    : getThemePreset('warmLove')!;

  const accent = story.theme?.accent_color || themePreset.accentColor;

  return (
    <Link
      to={`/stories/${story.slug}`}
      data-cursor="open"
      className="story-card group block relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {/* Background */}
        <div
          className="story-card-image absolute inset-0"
          style={{
            background: story.cover_image
              ? `url(${story.cover_image}) center/cover`
              : `linear-gradient(135deg, ${themePreset.palette.bg}, ${themePreset.palette.bgSecondary})`,
          }}
        />

        {/* Overlay gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `linear-gradient(to top, ${themePreset.palette.bg}ee, ${themePreset.palette.bg}40 50%, transparent)`,
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to top, ${accent}22, transparent)`,
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {story.category && (
            <span
              className="text-[10px] tracking-[0.3em] uppercase mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{ color: accent, transform: 'translateY(8px)', }}
            >
              <span className="group-hover:translate-y-0 transition-transform duration-500 inline-block">
                {story.category.name}
              </span>
            </span>
          )}

          <h3
            className="font-serif text-2xl md:text-3xl leading-tight mb-2"
            style={{ color: themePreset.palette.text }}
          >
            {story.title}
          </h3>

          {story.subtitle && (
            <p
              className="font-body text-sm font-light leading-relaxed mb-4 opacity-80"
              style={{ color: themePreset.palette.textMuted }}
            >
              {story.subtitle}
            </p>
          )}

          {/* Open indicator */}
          <div
            className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500"
            style={{ color: accent, transform: 'translateY(8px)' }}
          >
            <span className="group-hover:translate-y-0 transition-transform duration-500 inline-block">
              Open Story
            </span>
            <span className="w-8 h-px" style={{ background: accent }} />
          </div>
        </div>

        {/* Mood indicator */}
        {story.theme?.mood && (
          <div
            className="absolute top-5 right-5 text-[9px] tracking-[0.25em] uppercase opacity-50"
            style={{ color: themePreset.palette.textMuted }}
          >
            {story.theme.mood}
          </div>
        )}
      </div>
    </Link>
  );
}
