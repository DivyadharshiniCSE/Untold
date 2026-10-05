import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Plus, Palette, Settings, LogOut, Eye, Trash2, Upload, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { fetchAllStories, fetchCategories, slugify, estimateReadingTime } from '@/lib/api';
import { analyzeStory, generateThemeVariations, themePresetToDbTheme } from '@/lib/aiEngine';
import { THEME_PRESETS, type ThemePreset } from '@/lib/designTokens';
import type { Story, Category } from '@/lib/supabase';

type Tab = 'dashboard' | 'stories' | 'create' | 'themes' | 'settings';

export default function StudioDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllStories(), fetchCategories()])
      .then(([s, c]) => {
        setStories(s || []);
        setCategories(c || []);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setStories([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const publishedCount = stories.filter((s) => s.published).length;
  const draftCount = stories.filter((s) => !s.published).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'create', label: 'Create Story', icon: Plus },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0908' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-ink-700/50 flex flex-col">
        <div className="p-8 border-b border-ink-700/50">
          <h1 className="font-serif text-2xl" style={{ color: '#e8e2d8' }}>Story Studio</h1>
          <p className="text-[9px] tracking-[0.25em] uppercase text-ivory-500 mt-1">UNSAID Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'create') setEditingStory(null);
                  setTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-body font-light transition-colors ${
                  tab === item.id
                    ? 'text-gold-500 bg-gold-500/5'
                    : 'text-ivory-400 hover:text-ivory-200'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-700/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body font-light text-ivory-500 hover:text-burgundy-500 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12">
          {tab === 'dashboard' && (
            <DashboardView
              stories={stories}
              publishedCount={publishedCount}
              draftCount={draftCount}
              categoriesCount={categories.length}
              setTab={(t) => {
                if (t === 'create') setEditingStory(null);
                setTab(t);
              }}
            />
          )}
          {tab === 'stories' && (
            <StoriesView 
              stories={stories} 
              loading={loading} 
              onEdit={(s) => {
                setEditingStory(s);
                setTab('create');
              }}
            />
          )}
          {tab === 'create' && (
            <CreateStoryView 
              key={editingStory?.id || 'new'}
              categories={categories} 
              editingStory={editingStory}
              onCreated={() => { 
                setEditingStory(null); 
                setTab('stories'); 
                fetchAllStories().then(setStories); 
              }} 
            />
          )}
          {tab === 'themes' && <ThemesView />}
          {tab === 'settings' && <SettingsView categories={categories} onRefresh={() => fetchCategories().then(setCategories)} />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ stories, publishedCount, draftCount, categoriesCount, setTab }: {
  stories: Story[];
  publishedCount: number;
  draftCount: number;
  categoriesCount: number;
  setTab: (t: Tab) => void;
}) {
  const stats = [
    { label: 'Total Stories', value: stories.length },
    { label: 'Published', value: publishedCount },
    { label: 'Drafts', value: draftCount },
    { label: 'Categories', value: categoriesCount },
  ];

  return (
    <div>
      <h2 className="font-serif text-3xl mb-2" style={{ color: '#e8e2d8' }}>Dashboard</h2>
      <p className="text-sm text-ivory-400 mb-12">Welcome back to your sanctuary.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-ink-700/50 p-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-ivory-500 mb-3">{stat.label}</p>
            <p className="font-serif text-4xl" style={{ color: '#e8e2d8' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setTab('create')}
          className="flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.25em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
        >
          <Plus className="w-3 h-3" strokeWidth={1} />
          New Story
        </button>
        <button
          onClick={() => setTab('stories')}
          className="flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.25em] uppercase border border-ink-600 text-ivory-400 hover:text-ivory-200 transition-colors"
        >
          <BookOpen className="w-3 h-3" strokeWidth={1} />
          All Stories
        </button>
      </div>

      {/* Recent stories */}
      <div className="mt-16">
        <h3 className="font-serif text-xl mb-6" style={{ color: '#e8e2d8' }}>Recent</h3>
        <div className="space-y-2">
          {stories.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3 border-b border-ink-700/30">
              <div>
                <p className="font-serif text-lg" style={{ color: '#e8e2d8' }}>{s.title}</p>
                <p className="text-xs text-ivory-500">{s.category?.name || 'Uncategorized'} · {s.published ? 'Published' : 'Draft'}</p>
              </div>
              <Link to={`/stories/${s.slug}`} className="text-[10px] tracking-[0.25em] uppercase text-gold-500 hover:underline">
                View
              </Link>
            </div>
          ))}
          {stories.length === 0 && (
            <p className="text-sm text-ivory-500 italic">No stories yet. Create your first.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StoriesView({ stories, loading, onEdit }: { stories: Story[]; loading: boolean; onEdit: (s: Story) => void }) {
  const [search, setSearch] = useState('');

  const filtered = stories.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story? This cannot be undone.')) return;
    await supabase.from('stories').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <p className="text-ivory-400">Loading stories...</p>;

  return (
    <div>
      <h2 className="font-serif text-3xl mb-2" style={{ color: '#e8e2d8' }}>Stories</h2>
      <p className="text-sm text-ivory-400 mb-8">{stories.length} total</p>

      <input
        type="text"
        placeholder="Search stories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-8 bg-transparent border-b border-ink-500 py-2 text-sm font-light text-ivory-100 focus:border-gold-500 focus:outline-none"
        style={{ color: '#e8e2d8' }}
      />

      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-4 border-b border-ink-700/30 group">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-serif text-xl" style={{ color: '#e8e2d8' }}>{s.title}</p>
                {s.featured && <span className="text-[9px] tracking-[0.2em] uppercase text-gold-500">Featured</span>}
                <span className={`text-[9px] tracking-[0.2em] uppercase ${s.published ? 'text-gold-500' : 'text-ivory-500'}`}>
                  {s.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-ivory-500 mt-1">
                {s.category?.name || 'Uncategorized'} · {s.reading_time_min || estimateReadingTime(s.content)} min read
              </p>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link to={`/stories/${s.slug}`} className="p-2 text-ivory-400 hover:text-gold-500 transition-colors">
                <Eye className="w-4 h-4" strokeWidth={1} />
              </Link>
              <button onClick={() => onEdit(s)} className="p-2 text-ivory-400 hover:text-gold-500 transition-colors">
                <Edit2 className="w-4 h-4" strokeWidth={1} />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-ivory-400 hover:text-burgundy-500 transition-colors">
                <Trash2 className="w-4 h-4" strokeWidth={1} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type CreateStep = 'write' | 'analyze' | 'atmosphere' | 'visual' | 'sound' | 'preview' | 'publish';

function CreateStoryView({ categories, onCreated, editingStory }: { categories: Category[]; onCreated: () => void; editingStory?: Story | null }) {
  const [step, setStep] = useState<CreateStep>('write');
  const [title, setTitle] = useState(editingStory?.title || '');
  const [subtitle, setSubtitle] = useState(editingStory?.subtitle || '');
  const [content, setContent] = useState(editingStory?.content || '');
  const [categoryId, setCategoryId] = useState(editingStory?.category_id || '');
  const [tags, setTags] = useState(editingStory?.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(editingStory?.cover_image || '');
  const [storyId, setStoryId] = useState<string | null>(editingStory?.id || null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeStory>> | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>(THEME_PRESETS[0]);
  const [variations, setVariations] = useState<ThemePreset[]>([]);
  const [manualThemeId, setManualThemeId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('story_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('story_media').getPublicUrl(filePath);
      setCoverImage(data.publicUrl);
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const steps: CreateStep[] = ['write', 'analyze', 'atmosphere', 'visual', 'sound', 'preview', 'publish'];
  const stepLabels: Record<CreateStep, string> = {
    write: 'Write',
    analyze: 'AI Analyze',
    atmosphere: 'Atmosphere',
    visual: 'Visual',
    sound: 'Sound',
    preview: 'Preview',
    publish: 'Publish',
  };

  const handleAnalyze = async () => {
    try {
      const result = await analyzeStory(title, content, subtitle);
      setAnalysis(result);
      setSelectedPreset(result.recommendedTheme);
      setStep('atmosphere');
    } catch (e) {
      console.error(e);
      alert("Failed to analyze story.");
    }
  };

  const handleGenerateVariations = () => {
    setVariations(generateThemeVariations(selectedPreset));
  };

  const handleSaveDraft = async (publish = false) => {
    setSaving(true);
    try {
      const slug = slugify(title);
      const readingTime = estimateReadingTime(content);

      let id = storyId;
      if (!id) {
        const { data, error } = await supabase.from('stories').insert({
          title,
          slug,
          subtitle,
          content,
          category_id: categoryId || null,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          cover_image: coverImage || null,
          published: publish,
          status: publish ? 'published' : 'draft',
          reading_time_min: readingTime,
        }).select().single();
        if (error) throw error;
        id = data.id;
        setStoryId(id);
      } else {
        await supabase.from('stories').update({
          title,
          slug,
          subtitle,
          content,
          category_id: categoryId || null,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          cover_image: coverImage || null,
          published: publish,
          status: publish ? 'published' : 'draft',
          reading_time_min: readingTime,
        }).eq('id', id);
      }

      // Save theme
      await supabase.from('story_themes').delete().eq('story_id', id);
      const themeData = themePresetToDbTheme(selectedPreset, id!);
      await supabase.from('story_themes').insert(themeData);

      // Generate embedding if published
      if (publish) {
        const { generateAndSaveEmbedding } = await import('@/lib/ai/embeddingService');
        await generateAndSaveEmbedding(id!, title, content);
      }

      onCreated();
    } catch (err: any) {
      alert(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-3xl mb-2" style={{ color: '#e8e2d8' }}>Create Story</h2>

      {/* Step indicator */}
      <div className="flex gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
        {steps.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors border-b ${
              step === s ? 'text-gold-500 border-gold-500' : 'text-ivory-500 border-transparent hover:text-ivory-300'
            }`}
          >
            {stepLabels[s]}
          </button>
        ))}
      </div>

      {/* Write */}
      {step === 'write' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400">Title</label>
              <button 
                onClick={async () => {
                  const { generateTitleAndSubtitle } = await import('@/lib/ai/llmService');
                  const { title: t, subtitle: s } = await generateTitleAndSubtitle(content);
                  if (t) setTitle(t);
                  if (s) setSubtitle(s);
                }}
                disabled={!content}
                className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 disabled:opacity-30"
              >
                Auto-generate with AI
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-ink-500 py-3 font-serif text-2xl focus:border-gold-500 focus:outline-none"
              style={{ color: '#e8e2d8' }}
              placeholder="The Things We Never Said"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-transparent border-b border-ink-500 py-3 font-body text-sm font-light focus:border-gold-500 focus:outline-none"
              style={{ color: '#e8e2d8' }}
              placeholder="A story about everything that remained between two hearts."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-ink-800 border border-ink-600 py-3 px-4 font-body text-sm text-ivory-100 focus:border-gold-500 focus:outline-none"
                style={{ color: '#e8e2d8' }}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Atmosphere Template (Optional)</label>
              <select
                value={manualThemeId}
                onChange={(e) => setManualThemeId(e.target.value)}
                className="w-full bg-ink-800 border border-ink-600 py-3 px-4 font-body text-sm text-ivory-100 focus:border-gold-500 focus:outline-none"
                style={{ color: '#e8e2d8' }}
              >
                <option value="">Auto-generate with AI</option>
                {THEME_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Story Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full bg-ink-800/50 border border-ink-600 p-4 font-body text-base font-light leading-relaxed focus:border-gold-500 focus:outline-none resize-y"
              style={{ color: '#e8e2d8' }}
              placeholder="Write your story here. Separate paragraphs with blank lines."
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent border-b border-ink-500 py-3 font-body text-sm font-light focus:border-gold-500 focus:outline-none"
              style={{ color: '#e8e2d8' }}
              placeholder="love, memory, silence"
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400">Cover Image</label>
              <div className="flex gap-4">
                <label className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 transition-colors cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <button 
                  onClick={async () => {
                    const { generateWallpaperUrl } = await import('@/lib/ai/imageService');
                    const kw = analysis?.keywords?.[0] || 'aesthetic dark cinematic';
                    const url = await generateWallpaperUrl(kw);
                    setCoverImage(url);
                  }}
                  className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 transition-colors"
                >
                  AI Generate Wallpaper
                </button>
              </div>
            </div>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-transparent border-b border-ink-500 py-3 font-body text-sm font-light focus:border-gold-500 focus:outline-none"
              style={{ color: '#e8e2d8' }}
              placeholder="Paste an image URL or use the buttons above..."
            />
          </div>
          <button
            onClick={() => {
              if (manualThemeId) {
                const preset = THEME_PRESETS.find(p => p.id === manualThemeId);
                if (preset) setSelectedPreset(preset);
                setStep('visual');
              } else {
                setStep('analyze');
              }
            }}
            disabled={!title || !content}
            className="w-full px-8 py-4 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors disabled:opacity-30 text-center"
          >
            {manualThemeId 
              ? 'Skip AI & Continue to Visuals' 
              : 'Continue to AI Analysis'}
          </button>
        </div>
      )}

      {/* Analyze */}
      {step === 'analyze' && (
        <div className="max-w-2xl">
          <p className="text-sm text-ivory-400 mb-8">AI will analyze your story's emotional tone, themes, and atmosphere.</p>
          <button
            onClick={handleAnalyze}
            className="px-8 py-4 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Analyze Story
          </button>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 space-y-4 border border-ink-700/50 p-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <AnalysisItem label="Primary Emotion" value={analysis.primaryEmotion} />
                <AnalysisItem label="Mood" value={analysis.mood} />
                <AnalysisItem label="Genre" value={analysis.genre} />
                <AnalysisItem label="Intensity" value={`${Math.round(analysis.intensity * 100)}%`} />
                <AnalysisItem label="Atmosphere" value={analysis.atmosphere} />
                <AnalysisItem label="Secondary Emotions" value={analysis.secondaryEmotions.join(', ') || '—'} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-ivory-500 mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 text-xs border border-ink-600 text-ivory-300">{kw}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep('atmosphere')}
                className="px-8 py-3 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
              >
                Continue to Atmosphere
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Atmosphere */}
      {step === 'atmosphere' && (
        <div className="max-w-3xl">
          <p className="text-sm text-ivory-400 mb-8">Choose an atmosphere for your story. AI recommends: <span className="text-gold-500">{selectedPreset.name}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-4 border text-left transition-all ${
                  selectedPreset.id === preset.id
                    ? 'border-gold-500 bg-gold-500/5'
                    : 'border-ink-700 hover:border-ink-500'
                }`}
              >
                <div
                  className="w-full h-16 mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${preset.palette.bg}, ${preset.palette.bgSecondary})`,
                  }}
                />
                <p className="font-serif text-lg" style={{ color: '#e8e2d8' }}>{preset.name}</p>
                <p className="text-xs text-ivory-500 mt-1">{preset.description}</p>
                <div className="flex gap-2 mt-3">
                  {Object.values(preset.palette).slice(0, 4).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateVariations}
            className="px-6 py-3 text-[10px] tracking-[0.3em] uppercase border border-ink-600 text-ivory-400 hover:text-ivory-200 transition-colors mb-8"
          >
            Regenerate Variations
          </button>

          {variations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {variations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedPreset(v)}
                  className={`p-4 border text-left transition-all ${
                    selectedPreset.id === v.id
                      ? 'border-gold-500'
                      : 'border-ink-700 hover:border-ink-500'
                  }`}
                >
                  <div
                    className="w-full h-12 mb-2"
                    style={{ background: `linear-gradient(135deg, ${v.palette.bg}, ${v.palette.bgSecondary})` }}
                  />
                  <p className="font-serif text-sm" style={{ color: '#e8e2d8' }}>{v.name}</p>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep('visual')}
            className="px-8 py-3 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Continue to Visual
          </button>
        </div>
      )}

      {/* Visual */}
      {step === 'visual' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-ivory-400 mb-3">Background Image URL (optional)</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-transparent border-b border-ink-500 py-3 font-body text-sm font-light focus:border-gold-500 focus:outline-none"
              style={{ color: '#e8e2d8' }}
              placeholder="https://..."
            />
            <p className="text-xs text-ivory-500 mt-2">Leave empty to use the theme's gradient background.</p>
          </div>

          <div
            className="w-full h-64 border border-ink-700"
            style={{
              background: coverImage
                ? `url(${coverImage}) center/cover`
                : `linear-gradient(135deg, ${selectedPreset.palette.bg}, ${selectedPreset.palette.bgSecondary})`,
            }}
          />

          <button
            onClick={() => setStep('sound')}
            className="px-8 py-3 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Continue to Sound
          </button>
        </div>
      )}

      {/* Sound */}
      {step === 'sound' && (
        <div className="max-w-2xl space-y-6">
          <p className="text-sm text-ivory-400">AI recommends: <span className="text-gold-500">{selectedPreset.musicMood}</span></p>

          <div className="space-y-2">
            {['warm-piano', 'nostalgic', 'emotional', 'dreamy', 'midnight', 'hopeful', 'melancholic', 'none'].map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedPreset({ ...selectedPreset, musicMood: mood as ThemePreset['musicMood'] })}
                className={`w-full text-left p-4 border transition-all ${
                  selectedPreset.musicMood === mood
                    ? 'border-gold-500 bg-gold-500/5 text-gold-500'
                    : 'border-ink-700 text-ivory-400 hover:border-ink-500'
                }`}
              >
                <span className="text-sm font-body">{mood}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('preview')}
            className="px-8 py-3 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Continue to Preview
          </button>
        </div>
      )}

      {/* Preview */}
      {step === 'preview' && (
        <div className="max-w-2xl">
          <p className="text-sm text-ivory-400 mb-8">This is how visitors will see your story.</p>
          <div
            className="border border-ink-700 p-12"
            style={{ background: selectedPreset.palette.bg, color: selectedPreset.palette.text }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: selectedPreset.accentColor }}>
              {categories.find((c) => c.id === categoryId)?.name || ''}
            </p>
            <h3 className="font-serif text-4xl mb-4" style={{ fontFamily: selectedPreset.typography.heading }}>
              {title || 'Untitled'}
            </h3>
            {subtitle && (
              <p className="font-body text-base font-light italic mb-8" style={{ color: selectedPreset.palette.textMuted }}>
                {subtitle}
              </p>
            )}
            <div className="space-y-4">
              {content.split('\n').filter((p) => p.trim()).slice(0, 3).map((para, i) => (
                <p key={i} className="font-body text-base font-light leading-relaxed">
                  {para}
                </p>
              ))}
              {content.split('\n').filter((p) => p.trim()).length > 3 && (
                <p className="text-ivory-500 italic text-sm">... continues</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setStep('publish')}
            className="mt-8 px-8 py-3 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Continue to Publish
          </button>
        </div>
      )}

      {/* Publish */}
      {step === 'publish' && (
        <div className="max-w-md space-y-6">
          <h3 className="font-serif text-2xl" style={{ color: '#e8e2d8' }}>Publish your story</h3>
          <p className="text-sm text-ivory-400">Choose how to save your story. You can change this later.</p>

          <div className="flex gap-4">
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={saving}
              className="flex-1 py-4 text-[10px] tracking-[0.3em] uppercase border border-ink-600 text-ivory-300 hover:text-ivory-100 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSaveDraft(true)}
              disabled={saving}
              className="flex-1 py-4 text-[10px] tracking-[0.3em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.25em] uppercase text-ivory-500 mb-1">{label}</p>
      <p className="text-sm font-body text-ivory-200 capitalize">{value}</p>
    </div>
  );
}

function ThemesView() {
  return (
    <div>
      <h2 className="font-serif text-3xl mb-2" style={{ color: '#e8e2d8' }}>Theme Library</h2>
      <p className="text-sm text-ivory-400 mb-8">Predefined atmosphere presets available for stories.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEME_PRESETS.map((preset) => (
          <div key={preset.id} className="border border-ink-700/50 overflow-hidden">
            <div
              className="h-32"
              style={{ background: `linear-gradient(135deg, ${preset.palette.bg}, ${preset.palette.bgSecondary})` }}
            />
            <div className="p-4">
              <p className="font-serif text-xl" style={{ color: '#e8e2d8' }}>{preset.name}</p>
              <p className="text-xs text-ivory-500 mt-1">{preset.description}</p>
              <div className="flex gap-2 mt-3">
                {Object.values(preset.palette).map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-ink-600" style={{ background: c }} />
                ))}
              </div>
              <div className="mt-3 text-[10px] tracking-[0.2em] uppercase text-ivory-500 space-y-1">
                <p>Animation: {preset.animationStyle}</p>
                <p>Particles: {preset.particleStyle}</p>
                <p>Music: {preset.musicMood}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await supabase.from('categories').insert({
      name: newCategory,
      slug: slugify(newCategory),
    });
    setNewCategory('');
    onRefresh();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-3xl mb-2" style={{ color: '#e8e2d8' }}>Settings</h2>
      <p className="text-sm text-ivory-400 mb-8">Manage categories and site settings.</p>

      <div className="mb-12">
        <h3 className="font-serif text-xl mb-4" style={{ color: '#e8e2d8' }}>Categories</h3>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="New category name..."
            className="flex-1 bg-transparent border-b border-ink-500 py-2 text-sm font-light focus:border-gold-500 focus:outline-none"
            style={{ color: '#e8e2d8' }}
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 text-[10px] tracking-[0.25em] uppercase border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-ink-700/30">
              <span className="text-sm font-body text-ivory-200">{c.name}</span>
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="text-ivory-500 hover:text-burgundy-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
