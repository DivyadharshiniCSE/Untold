// UNSAID Design Token System
// Controlled vocabulary for AI-generated themes — prevents arbitrary CSS.

export const ANIMATION_TYPES = [
  'fade', 'slowFade', 'slideUp', 'typeReveal', 'blurReveal',
  'parallax', 'softZoom', 'letterReveal',
] as const;

export const BACKGROUND_TYPES = [
  'gradient', 'image', 'paper', 'windowLight', 'night',
  'rain', 'sunset', 'abstract', 'film', 'minimal',
] as const;

export const PARTICLE_TYPES = [
  'dust', 'stars', 'rain', 'glow', 'none',
] as const;

export const MUSIC_MOODS = [
  'warm-piano', 'nostalgic', 'emotional', 'dreamy',
  'midnight', 'hopeful', 'melancholic', 'none',
] as const;

export const READING_WIDTHS = ['narrow', 'medium', 'wide'] as const;

export const TEXT_ANIMATIONS = ['fade', 'slideUp', 'blurReveal', 'letterReveal'] as const;

export const TRANSITION_STYLES = ['crossfade', 'fade', 'slide'] as const;

export type AnimationType = typeof ANIMATION_TYPES[number];
export type BackgroundType = typeof BACKGROUND_TYPES[number];
export type ParticleType = typeof PARTICLE_TYPES[number];
export type MusicMood = typeof MUSIC_MOODS[number];
export type ReadingWidth = typeof READING_WIDTHS[number];
export type TextAnimation = typeof TEXT_ANIMATIONS[number];
export type TransitionStyle = typeof TRANSITION_STYLES[number];

// Predefined theme presets — each is a complete atmosphere
export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  mood: string;
  secondaryMood: string;
  palette: {
    bg: string;
    bgSecondary: string;
    text: string;
    textMuted: string;
    accent: string;
    overlay: string;
  };
  typography: {
    heading: string;
    body: string;
    headingWeight: string;
    bodyWeight: string;
  };
  backgroundType: BackgroundType;
  animationStyle: AnimationType;
  particleStyle: ParticleType;
  musicMood: MusicMood;
  readingWidth: ReadingWidth;
  textAnimation: TextAnimation;
  transitionStyle: TransitionStyle;
  accentColor: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'warmLove',
    name: 'Warm Love',
    description: 'Warm sunset glow, cream and amber tones',
    mood: 'romantic',
    secondaryMood: 'nostalgic',
    palette: {
      bg: '#1a1410',
      bgSecondary: '#2a1f18',
      text: '#f5ede0',
      textMuted: '#c4a886',
      accent: '#d4a574',
      overlay: 'rgba(26, 20, 16, 0.75)',
    },
    typography: {
      heading: "'Instrument Serif', serif",
      body: "'Inter', sans-serif",
      headingWeight: '400',
      bodyWeight: '300',
    },
    backgroundType: 'sunset',
    animationStyle: 'slowFade',
    particleStyle: 'dust',
    musicMood: 'warm-piano',
    readingWidth: 'medium',
    textAnimation: 'fade',
    transitionStyle: 'crossfade',
    accentColor: '#d4a574',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy, moonlight, tiny stars',
    mood: 'contemplative',
    secondaryMood: 'melancholic',
    palette: {
      bg: '#0a0e1a',
      bgSecondary: '#121829',
      text: '#e0e4f0',
      textMuted: '#8892a8',
      accent: '#7c8db5',
      overlay: 'rgba(10, 14, 26, 0.8)',
    },
    typography: {
      heading: "'Cormorant Garamond', serif",
      body: "'Inter', sans-serif",
      headingWeight: '300',
      bodyWeight: '300',
    },
    backgroundType: 'night',
    animationStyle: 'fade',
    particleStyle: 'stars',
    musicMood: 'midnight',
    readingWidth: 'medium',
    textAnimation: 'fade',
    transitionStyle: 'fade',
    accentColor: '#7c8db5',
  },
  {
    id: 'nostalgia',
    name: 'Nostalgia',
    description: 'Aged paper, warm beige, soft golden light',
    mood: 'nostalgic',
    secondaryMood: 'tender',
    palette: {
      bg: '#1c1814',
      bgSecondary: '#2a2420',
      text: '#e8dcc8',
      textMuted: '#b0a090',
      accent: '#c9a96e',
      overlay: 'rgba(28, 24, 20, 0.75)',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      headingWeight: '400',
      bodyWeight: '300',
    },
    backgroundType: 'paper',
    animationStyle: 'blurReveal',
    particleStyle: 'dust',
    musicMood: 'nostalgic',
    readingWidth: 'narrow',
    textAnimation: 'blurReveal',
    transitionStyle: 'crossfade',
    accentColor: '#c9a96e',
  },
  {
    id: 'herStory',
    name: 'Her Story',
    description: 'Deep burgundy, warm gold, strong serif',
    mood: 'empowered',
    secondaryMood: 'reflective',
    palette: {
      bg: '#1a0e10',
      bgSecondary: '#2a1418',
      text: '#f0e0e0',
      textMuted: '#c0a0a4',
      accent: '#c8857a',
      overlay: 'rgba(26, 14, 16, 0.8)',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      headingWeight: '500',
      bodyWeight: '300',
    },
    backgroundType: 'abstract',
    animationStyle: 'slowFade',
    particleStyle: 'glow',
    musicMood: 'emotional',
    readingWidth: 'medium',
    textAnimation: 'fade',
    transitionStyle: 'crossfade',
    accentColor: '#c8857a',
  },
  {
    id: 'melancholy',
    name: 'Lost Love',
    description: 'Rainy window, muted blue-black, distant warm light',
    mood: 'melancholic',
    secondaryMood: 'longing',
    palette: {
      bg: '#0c0e14',
      bgSecondary: '#161a24',
      text: '#d8dce8',
      textMuted: '#788098',
      accent: '#949eb8',
      overlay: 'rgba(12, 14, 20, 0.85)',
    },
    typography: {
      heading: "'Cormorant Garamond', serif",
      body: "'Inter', sans-serif",
      headingWeight: '300',
      bodyWeight: '300',
    },
    backgroundType: 'rain',
    animationStyle: 'fade',
    particleStyle: 'rain',
    musicMood: 'melancholic',
    readingWidth: 'medium',
    textAnimation: 'fade',
    transitionStyle: 'fade',
    accentColor: '#949eb8',
  },
  {
    id: 'hope',
    name: 'Hope',
    description: 'Soft dawn light, warm cream and pale gold',
    mood: 'hopeful',
    secondaryMood: 'tender',
    palette: {
      bg: '#181612',
      bgSecondary: '#242018',
      text: '#f0e8d8',
      textMuted: '#b8ac90',
      accent: '#d4c08a',
      overlay: 'rgba(24, 22, 18, 0.75)',
    },
    typography: {
      heading: "'Instrument Serif', serif",
      body: "'Inter', sans-serif",
      headingWeight: '400',
      bodyWeight: '300',
    },
    backgroundType: 'windowLight',
    animationStyle: 'softZoom',
    particleStyle: 'glow',
    musicMood: 'hopeful',
    readingWidth: 'medium',
    textAnimation: 'slideUp',
    transitionStyle: 'crossfade',
    accentColor: '#d4c08a',
  },
  {
    id: 'dream',
    name: 'Dream',
    description: 'Ethereal, soft diffusion, gentle floating',
    mood: 'dreamy',
    secondaryMood: 'serene',
    palette: {
      bg: '#101218',
      bgSecondary: '#1a1e28',
      text: '#e0e4ec',
      textMuted: '#9098ac',
      accent: '#a8b0c8',
      overlay: 'rgba(16, 18, 24, 0.8)',
    },
    typography: {
      heading: "'Cormorant Garamond', serif",
      body: "'Inter', sans-serif",
      headingWeight: '300',
      bodyWeight: '300',
    },
    backgroundType: 'abstract',
    animationStyle: 'parallax',
    particleStyle: 'dust',
    musicMood: 'dreamy',
    readingWidth: 'wide',
    textAnimation: 'blurReveal',
    transitionStyle: 'crossfade',
    accentColor: '#a8b0c8',
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Faded film grain, warm muted tones, sepia',
    mood: 'wistful',
    secondaryMood: 'tender',
    palette: {
      bg: '#161210',
      bgSecondary: '#221e18',
      text: '#e4dccc',
      textMuted: '#a89880',
      accent: '#bcab88',
      overlay: 'rgba(22, 18, 16, 0.8)',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      headingWeight: '400',
      bodyWeight: '300',
    },
    backgroundType: 'film',
    animationStyle: 'slowFade',
    particleStyle: 'dust',
    musicMood: 'nostalgic',
    readingWidth: 'narrow',
    textAnimation: 'fade',
    transitionStyle: 'fade',
    accentColor: '#bcab88',
  },
];

export function getThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.id === id);
}

export function isValidToken<T extends string>(value: string, tokens: readonly T[]): value is T {
  return tokens.includes(value as T);
}

export function validateThemeConfig(config: Record<string, unknown>): Record<string, unknown> {
  const validated: Record<string, unknown> = {};
  if (config.animationStyle && isValidToken(String(config.animationStyle), ANIMATION_TYPES)) {
    validated.animationStyle = config.animationStyle;
  }
  if (config.backgroundType && isValidToken(String(config.backgroundType), BACKGROUND_TYPES)) {
    validated.backgroundType = config.backgroundType;
  }
  if (config.particleStyle && isValidToken(String(config.particleStyle), PARTICLE_TYPES)) {
    validated.particleStyle = config.particleStyle;
  }
  if (config.musicMood && isValidToken(String(config.musicMood), MUSIC_MOODS)) {
    validated.musicMood = config.musicMood;
  }
  if (config.readingWidth && isValidToken(String(config.readingWidth), READING_WIDTHS)) {
    validated.readingWidth = config.readingWidth;
  }
  if (config.textAnimation && isValidToken(String(config.textAnimation), TEXT_ANIMATIONS)) {
    validated.textAnimation = config.textAnimation;
  }
  if (config.transitionStyle && isValidToken(String(config.transitionStyle), TRANSITION_STYLES)) {
    validated.transitionStyle = config.transitionStyle;
  }
  return validated;
}
