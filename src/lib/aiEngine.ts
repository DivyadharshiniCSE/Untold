import type { ThemePreset } from './designTokens';
import { THEME_PRESETS, getThemePreset } from './designTokens';
import type { StoryTheme } from './supabase';

// Simulated AI atmosphere analysis — in production this would call an edge function
// that sends the story to an LLM and returns validated design tokens.
// For now, we use keyword-based heuristic analysis to pick the best preset.

const MOOD_KEYWORDS: Record<string, string[]> = {
  warmLove: ['love', 'romantic', 'heart', 'tender', 'affection', 'embrace', 'warm', 'sunset', 'golden'],
  midnight: ['midnight', 'night', 'dark', 'quiet', 'alone', 'silence', 'moon', 'star', 'contemplat'],
  nostalgia: ['memory', 'remember', 'past', 'old', 'nostalgic', 'faded', 'yesterday', 'childhood'],
  herStory: ['woman', 'her', 'she', 'strength', 'identity', 'journey', 'sister', 'mother', 'daughter'],
  melancholy: ['loss', 'lost', 'gone', 'tears', 'sad', 'rain', 'goodbye', 'miss', 'absent', 'empty'],
  hope: ['hope', 'dawn', 'new', 'begin', 'light', 'forward', 'tomorrow', 'rise', 'open'],
  dream: ['dream', 'float', 'ethereal', 'soft', 'gentle', 'cloud', 'sky', 'beyond', 'whisper'],
  memory: ['remember', 'memory', 'carry', 'remained', 'trace', 'echo', 'linger', 'film', 'sepia'],
};

export type AnalysisResult = {
  primaryEmotion: string;
  secondaryEmotions: string[];
  mood: string;
  genre: string;
  intensity: number;
  atmosphere: string;
  keywords: string[];
  recommendedTheme: ThemePreset;
  alternatives: ThemePreset[];
};

export async function analyzeStory(title: string, content: string, subtitle?: string): Promise<AnalysisResult> {
  const fullText = `${title} ${subtitle || ''} ${content}`;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `
        You are an artistic storytelling AI for an immersive website.
        Analyze the following story and return a JSON object (WITHOUT ANY MARKDOWN WRAPPER OR BACKTICKS) containing the following fields:
        - "primaryEmotion": string
        - "secondaryEmotions": string[] (up to 4)
        - "mood": string
        - "genre": string
        - "intensity": number (between 0.0 and 1.0)
        - "atmosphere": string (short description)
        - "keywords": string[] (up to 8)
        - "recommendedThemeId": string (must be exactly one of: ${THEME_PRESETS.map(t => t.id).join(', ')})
        - "alternativeThemeIds": string[] (exactly 3 from the same list)

        Story:
        "${fullText}"
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('Failed to reach Gemini API');
      const data = await response.json();
      
      let resultText = data.candidates[0].content.parts[0].text;
      
      const parsed = JSON.parse(resultText);
      const recommended = getThemePreset(parsed.recommendedThemeId) || THEME_PRESETS[0];
      const alternatives = (parsed.alternativeThemeIds || [])
        .map((id: string) => getThemePreset(id))
        .filter((t: any): t is ThemePreset => t !== undefined);

      return {
        primaryEmotion: parsed.primaryEmotion || recommended.mood,
        secondaryEmotions: parsed.secondaryEmotions || [],
        mood: parsed.mood || recommended.mood,
        genre: parsed.genre || 'Personal Narrative',
        intensity: parsed.intensity || 0.5,
        atmosphere: parsed.atmosphere || recommended.description,
        keywords: parsed.keywords || [],
        recommendedTheme: recommended,
        alternatives: alternatives.length ? alternatives : generateThemeVariations(recommended),
      };
    } catch (e) {
      console.error("AI Analysis failed, falling back to heuristic:", e);
    }
  }

  // --- Fallback Heuristic Analysis ---
  const lowerText = fullText.toLowerCase();

  // Score each theme by keyword matches
  const scores: Record<string, number> = {};
  for (const [themeId, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[themeId] = keywords.reduce((acc, kw) => {
      const matches = (lowerText.match(new RegExp(kw, 'g')) || []).length;
      return acc + matches;
    }, 0);
  }

  // Pick top 3 themes
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topId = sorted[0]?.[0] || 'warmLove';
  const recommended = getThemePreset(topId) || THEME_PRESETS[0];

  const altIds = sorted.slice(1, 4).map((s) => s[0]);
  const alternatives = altIds
    .map((id) => getThemePreset(id))
    .filter((t): t is ThemePreset => t !== undefined);

  // Extract emotions
  const emotionWords = ['love', 'loss', 'hope', 'fear', 'joy', 'sadness', 'anger', 'peace', 'longing', 'regret', 'wonder', 'grief', 'tenderness'];
  const foundEmotions = emotionWords.filter((e) => lowerText.includes(e));

  // Calculate intensity (0-1) based on emotional density
  const emotionalMarkers = ['!', '?', '...', '—', 'never', 'always', 'everything', 'nothing', 'broken', 'whole'];
  const markerCount = emotionalMarkers.reduce((acc, m) => acc + (lowerText.match(new RegExp(m, 'g')) || []).length, 0);
  const intensity = Math.min(1, Math.max(0.3, markerCount / 20));

  // Extract keywords (simple: most frequent meaningful words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'his', 'her', 'its', 'our', 'their', 'my', 'your', 'me', 'him', 'us', 'as', 'if', 'then', 'than', 'so', 'not', 'no', 'yes', 'but', 'about', 'into', 'from', 'up', 'down', 'out', 'all', 'each', 'every', 'some', 'any', 'one', 'two', 'too', 'very', 'just', 'only', 'also', 'here', 'there', 'when', 'where', 'why', 'how', 'what', 'who', 'which']);
  const words = lowerText.match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    if (!stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  return {
    primaryEmotion: recommended.mood,
    secondaryEmotions: foundEmotions.slice(0, 4),
    mood: recommended.mood,
    genre: inferGenre(lowerText),
    intensity: Math.round(intensity * 100) / 100,
    atmosphere: recommended.description,
    keywords,
    recommendedTheme: recommended,
    alternatives,
  };
}

function inferGenre(text: string): string {
  if (/letter|dear|wrote|sent/.test(text)) return 'Epistolary';
  if (/memory|remember|past|childhood/.test(text)) return 'Memoir';
  if (/she|her|woman/.test(text) && !/he|his|him/.test(text)) return "Women's Story";
  if (/dream|sleep|wake|nightmare/.test(text)) return 'Dream Narrative';
  if (/love|heart|romance/.test(text)) return 'Romance';
  if (/loss|grief|death|gone/.test(text)) return 'Elegy';
  return 'Personal Narrative';
}

export function generateThemeVariations(base: ThemePreset): ThemePreset[] {
  // Create 3 variations: Warm, Dreamy, Deep
  const warm: ThemePreset = {
    ...base,
    id: `${base.id}-warm`,
    name: `${base.name} — Warm`,
    palette: {
      ...base.palette,
      bg: '#1a1410',
      bgSecondary: '#2a2018',
      accent: '#d4a574',
      text: '#f5ede0',
    },
    musicMood: 'warm-piano',
    particleStyle: 'dust',
  };

  const dreamy: ThemePreset = {
    ...base,
    id: `${base.id}-dreamy`,
    name: `${base.name} — Dreamy`,
    palette: {
      ...base.palette,
      bg: '#101218',
      bgSecondary: '#1a1e28',
      accent: '#a8b0c8',
      text: '#e0e4ec',
    },
    musicMood: 'dreamy',
    animationStyle: 'parallax',
    particleStyle: 'dust',
  };

  const deep: ThemePreset = {
    ...base,
    id: `${base.id}-deep`,
    name: `${base.name} — Deep`,
    palette: {
      ...base.palette,
      bg: '#080810',
      bgSecondary: '#12121e',
      accent: '#8888a0',
      text: '#d0d0e0',
    },
    musicMood: 'melancholic',
    animationStyle: 'fade',
    particleStyle: 'none',
  };

  return [warm, dreamy, deep];
}

export function themePresetToDbTheme(preset: ThemePreset, storyId: string): Omit<StoryTheme, 'id' | 'created_at'> {
  return {
    story_id: storyId,
    mood: preset.mood,
    secondary_mood: preset.secondaryMood,
    emotions: [preset.mood, preset.secondaryMood],
    intensity: 0.6,
    visual_style: preset.backgroundType,
    palette: preset.palette as unknown as Record<string, string>,
    typography: preset.typography as unknown as Record<string, string>,
    background_type: preset.backgroundType,
    background_url: null,
    background_opacity: 0.7,
    background_blur: 0,
    animation_style: preset.animationStyle,
    particle_style: preset.particleStyle,
    music_mood: preset.musicMood,
    reading_width: preset.readingWidth,
    text_animation: preset.textAnimation,
    transition_style: preset.transitionStyle,
    accent_color: preset.accentColor,
    theme_config: {},
    ai_generated: true,
  };
}
