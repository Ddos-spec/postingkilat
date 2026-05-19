import {
  Activity,
  Clock,
  Coins,
  Database,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Palette,
  PenTool,
  Settings,
} from 'lucide-react';

const CONTENT_TYPES = [
  'Landing Page Copy',
  'Caption Instagram',
  'Thread X / Twitter',
  'Email Launch',
  'Deskripsi Produk',
  'Script Video',
] as const;

const COPY_TONES = [
  'Tajam & meyakinkan',
  'Santai bergaya kreator',
  'Premium & elegan',
  'Hard-sell terukur',
] as const;

const ART_STYLES = [
  'Cinematic',
  'Photorealistic',
  'Editorial',
  'Cyberpunk',
  'Minimalist',
  'Luxury Product',
] as const;

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
const VIDEO_DURATIONS = ['15 detik', '30 detik', '45 detik', '60 detik'] as const;
const VIDEO_MOTIONS = [
  'Slow dolly in',
  'Crash zoom',
  'Orbit product',
  'Handheld UGC',
  'Reveal cinematic',
] as const;
const AUDIO_FORMATS = ['Voice-over Ad', 'Podcast Intro', 'Narration', 'SFX Sheet'] as const;
const CAMPAIGN_GOALS = ['Konversi', 'Awareness', 'Leads', 'Retargeting'] as const;
const PROVIDER_IDS = ['openrouter', 'openai', 'anthropic', 'gemini', 'compatible', 'demo'] as const;
const STORAGE_KEY = 'kontenkilat-ai-studio-v3';
const GENERATED_ART_BASE = `${import.meta.env.BASE_URL}generated/`;
const BRAND_ASSET_BASE = `${import.meta.env.BASE_URL}brand/`;
const HERO_ART_PRIMARY = `${GENERATED_ART_BASE}hero-campaign.webp`;
const HERO_ART_SECONDARY = `${GENERATED_ART_BASE}mobile-studio.webp`;
const BRAND_LOGO_MARK = `${BRAND_ASSET_BASE}logo-mark.png`;

type ContentType = (typeof CONTENT_TYPES)[number];
type AspectRatio = (typeof ASPECT_RATIOS)[number];
type ProviderId = (typeof PROVIDER_IDS)[number];
type StudioView =
  | 'explore'
  | 'copy'
  | 'image'
  | 'video'
  | 'audio'
  | 'campaigns'
  | 'canvas'
  | 'assistant'
  | 'apps'
  | 'settings';
type ChatRole = 'user' | 'assistant';
type NavIcon = typeof LayoutDashboard;

const ASPECT_RATIO_CLASSES: Record<AspectRatio, string> = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
};

interface NavItem {
  id: StudioView;
  label: string;
  icon: NavIcon;
  badge?: string;
}

interface FeatureCardData {
  title: string;
  description: string;
  tag: string;
  accent: string;
  view: StudioView;
  cta: string;
}

interface Preset {
  name: string;
  description: string;
  vibe: string;
  accent: string;
}

interface SavedItem {
  id: string;
  title: string;
  type: string;
  summary: string;
  section: StudioView;
  timestamp: string;
  accent: string;
}

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface WorkspaceDrafts {
  selectedType?: ContentType;
  copyTone?: (typeof COPY_TONES)[number];
  promptInput?: string;
  generatedCopy?: string;
  imagePrompt?: string;
  negativePrompt?: string;
  artStyle?: (typeof ART_STYLES)[number];
  aspectRatio?: AspectRatio;
  visualPreset?: string;
  imageOutput?: string;
  videoIdea?: string;
  videoMotion?: (typeof VIDEO_MOTIONS)[number];
  videoDuration?: (typeof VIDEO_DURATIONS)[number];
  videoPlatform?: string;
  videoOutput?: string;
  audioIdea?: string;
  audioVibe?: string;
  audioFormat?: (typeof AUDIO_FORMATS)[number];
  audioOutput?: string;
  campaignLink?: string;
  campaignOffer?: string;
  campaignAudience?: string;
  campaignGoal?: (typeof CAMPAIGN_GOALS)[number];
  campaignOutput?: string;
  viralityHook?: string;
  viralityCaption?: string;
  viralityCta?: string;
}

interface PersistedState {
  selectedProvider: ProviderId;
  providerConfigs: ProviderConfigMap;
  savedItems: SavedItem[];
  chatMessages: ChatMessage[];
  activeView?: StudioView;
  workspaceDrafts?: WorkspaceDrafts;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ViralityReport {
  score: number;
  label: string;
  notes: string[];
}

interface ProviderMeta {
  label: string;
  description: string;
  envKey: string | null;
  defaultModel: string;
  recommendedModels: string[];
  capabilities: string[];
  baseUrl: string;
  supportsBaseUrl: boolean;
  accent: string;
  badge: string;
}

interface ProviderRuntimeConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

type ProviderConfigMap = Record<ProviderId, ProviderRuntimeConfig>;

const PROVIDER_META: Record<ProviderId, ProviderMeta> = {
  openrouter: {
    label: 'OpenRouter',
    description: 'Satu pintu ke banyak model seperti OpenAI, Claude, Gemini, dan lainnya.',
    envKey: 'VITE_OPENROUTER_API_KEY',
    defaultModel: 'google/gemini-2.5-flash',
    recommendedModels: [
      'google/gemini-2.5-flash',
      'openai/gpt-4.1-mini',
      'anthropic/claude-3.7-sonnet',
    ],
    capabilities: ['chat', 'routing', 'multi-model'],
    baseUrl: 'https://openrouter.ai/api/v1',
    supportsBaseUrl: false,
    accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    badge: 'Multi-model',
  },
  openai: {
    label: 'OpenAI',
    description: 'Provider native dengan endpoint Responses API untuk workflow teks modern.',
    envKey: 'VITE_OPENAI_API_KEY',
    defaultModel: 'gpt-4.1-mini',
    recommendedModels: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-5'],
    capabilities: ['chat', 'responses', 'structured'],
    baseUrl: 'https://api.openai.com/v1',
    supportsBaseUrl: false,
    accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badge: 'Responses',
  },
  anthropic: {
    label: 'Anthropic',
    description: 'Claude Messages API untuk reasoning, writing, dan ideasi mendalam.',
    envKey: 'VITE_ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-20250514',
    recommendedModels: ['claude-sonnet-4-20250514', 'claude-opus-4-1-20250805'],
    capabilities: ['chat', 'reasoning', 'long-form'],
    baseUrl: 'https://api.anthropic.com/v1',
    supportsBaseUrl: false,
    accent: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    badge: 'Claude',
  },
  gemini: {
    label: 'Google Gemini',
    description: 'Gemini API langsung untuk copy, assistant, dan workflow cepat.',
    envKey: 'VITE_GEMINI_API_KEY',
    defaultModel: 'gemini-2.0-flash',
    recommendedModels: ['gemini-2.0-flash', 'gemini-1.5-flash-001'],
    capabilities: ['chat', 'fast', 'google-ai'],
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    supportsBaseUrl: false,
    accent: 'from-lime-400/20 via-emerald-500/10 to-transparent',
    badge: 'Google AI',
  },
  compatible: {
    label: 'OpenAI-Compatible',
    description: 'Untuk Groq, Together, Fireworks, dan endpoint kompatibel chat completions lainnya.',
    envKey: 'VITE_COMPATIBLE_API_KEY',
    defaultModel: 'your-model-name',
    recommendedModels: ['llama-3.3-70b-versatile', 'deepseek-chat', 'qwen/qwen3-32b'],
    capabilities: ['chat', 'custom-endpoint', 'openai-compatible'],
    baseUrl: 'https://api.groq.com/openai/v1',
    supportsBaseUrl: true,
    accent: 'from-amber-400/20 via-orange-500/10 to-transparent',
    badge: 'Custom',
  },
  demo: {
    label: 'Demo Mode',
    description: 'Semua flow tetap hidup dengan fallback lokal, tanpa request live ke provider.',
    envKey: null,
    defaultModel: 'demo-local',
    recommendedModels: ['demo-local'],
    capabilities: ['offline', 'fallback', 'demo'],
    baseUrl: '',
    supportsBaseUrl: false,
    accent: 'from-slate-400/20 via-white/5 to-transparent',
    badge: 'Offline',
  },
};

function createDefaultProviderConfigs(): ProviderConfigMap {
  return {
    openrouter: {
      apiKey: '',
      model: PROVIDER_META.openrouter.defaultModel,
      baseUrl: PROVIDER_META.openrouter.baseUrl,
    },
    openai: {
      apiKey: '',
      model: PROVIDER_META.openai.defaultModel,
      baseUrl: PROVIDER_META.openai.baseUrl,
    },
    anthropic: {
      apiKey: '',
      model: PROVIDER_META.anthropic.defaultModel,
      baseUrl: PROVIDER_META.anthropic.baseUrl,
    },
    gemini: {
      apiKey: '',
      model: PROVIDER_META.gemini.defaultModel,
      baseUrl: PROVIDER_META.gemini.baseUrl,
    },
    compatible: {
      apiKey: '',
      model: PROVIDER_META.compatible.defaultModel,
      baseUrl: import.meta.env.VITE_COMPATIBLE_BASE_URL || PROVIDER_META.compatible.baseUrl,
    },
    demo: {
      apiKey: '',
      model: PROVIDER_META.demo.defaultModel,
      baseUrl: PROVIDER_META.demo.baseUrl,
    },
  };
}

function mergeProviderConfigs(
  source?: Partial<Record<ProviderId, Partial<ProviderRuntimeConfig>>> | null,
): ProviderConfigMap {
  const defaults = createDefaultProviderConfigs();

  if (!source) {
    return defaults;
  }

  return PROVIDER_IDS.reduce((accumulator, providerId) => {
    accumulator[providerId] = {
      ...defaults[providerId],
      ...(source[providerId] ?? {}),
    };

    return accumulator;
  }, {} as ProviderConfigMap);
}

const NAV_ITEMS: NavItem[] = [
  { id: 'explore', label: 'Explore', icon: LayoutDashboard },
  { id: 'copy', label: 'Copy', icon: PenTool },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Activity, badge: 'New' },
  { id: 'audio', label: 'Audio', icon: Clock },
  { id: 'campaigns', label: 'Campaign Studio', icon: Coins, badge: 'Hot' },
  { id: 'canvas', label: 'Canvas', icon: Palette },
  { id: 'assistant', label: 'Copilot', icon: MessageSquare },
  { id: 'apps', label: 'Apps', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MOBILE_DOCK_ITEMS: StudioView[] = [
  'explore',
  'copy',
  'image',
  'video',
  'assistant',
  'settings',
];

const FEATURED_FLOWS: FeatureCardData[] = [
  {
    title: 'Campaign Engine',
    description: 'Dari satu brief jadi hook, angle, CTA, dan distribusi lintas channel.',
    tag: 'Featured',
    accent: 'from-fuchsia-500/35 via-violet-500/15 to-cyan-400/10',
    view: 'campaigns',
    cta: 'Buka studio',
  },
  {
    title: 'Visual Prompt Lab',
    description: 'Bangun prompt image, negative prompt, framing, dan visual direction siap produksi.',
    tag: 'Image',
    accent: 'from-cyan-500/30 via-sky-500/15 to-indigo-500/10',
    view: 'image',
    cta: 'Generate visual brief',
  },
  {
    title: 'Motion Storyboard',
    description: 'Ubah ide jadi urutan shot, camera movement, beat, dan overlay text singkat.',
    tag: 'Video',
    accent: 'from-lime-400/25 via-emerald-500/10 to-cyan-500/10',
    view: 'video',
    cta: 'Buat storyboard',
  },
  {
    title: 'Copilot Room',
    description: 'Brainstorm, revisi copy, validasi angle, dan minta next-step tanpa pindah tab.',
    tag: 'Assistant',
    accent: 'from-amber-400/30 via-orange-500/15 to-pink-500/10',
    view: 'assistant',
    cta: 'Masuk copilot',
  },
];

const PRESETS: Preset[] = [
  {
    name: 'Neon Velocity',
    description: 'Visual cepat, kontras tinggi, cocok untuk tech dan lifestyle hype.',
    vibe: 'Cyber teaser dengan sorotan neon dan gerak agresif.',
    accent: 'from-fuchsia-500/30 via-violet-500/15 to-cyan-400/10',
  },
  {
    name: 'Luxe Editorial',
    description: 'Nuansa premium, kamera bersih, detail material dan pencahayaan elegan.',
    vibe: 'Fashion/editorial untuk brand berkelas.',
    accent: 'from-stone-300/20 via-zinc-400/10 to-white/5',
  },
  {
    name: 'UGC Proof',
    description: 'Tampilan creator-style yang natural untuk testimonial, review, dan before-after.',
    vibe: 'Relatable, handheld, dan conversational.',
    accent: 'from-emerald-400/25 via-teal-500/10 to-cyan-500/10',
  },
  {
    name: 'Macro Impact',
    description: 'Fokus tekstur dan detail mikro untuk hero product shot.',
    vibe: 'Tight close-up, tactile, premium performance.',
    accent: 'from-orange-400/25 via-amber-500/10 to-red-500/10',
  },
  {
    name: 'After Hours Launch',
    description: 'Feel gelap, dramatis, kuat untuk launch video atau teaser midnight drop.',
    vibe: 'Noir digital dengan energy cinematic.',
    accent: 'from-indigo-500/25 via-blue-500/10 to-slate-500/10',
  },
];

const DEFAULT_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'seed-1',
    title: 'Sprint brief · Mobile app teaser',
    type: 'Campaign',
    summary: 'Hook + funnel lintas Reels, Shorts, dan landing hero sudah siap dipoles.',
    section: 'campaigns',
    timestamp: 'Siap diedit',
    accent: 'from-fuchsia-500/20 via-violet-500/10 to-transparent',
  },
  {
    id: 'seed-2',
    title: 'Visual direction · Luxe skincare',
    type: 'Image',
    summary: 'Prompt editorial dan negative prompt aman untuk hero product shot.',
    section: 'image',
    timestamp: 'Preview tersimpan',
    accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
  },
  {
    id: 'seed-3',
    title: 'Storyboard · UGC direct-response',
    type: 'Video',
    summary: 'Struktur 6 beat dengan opening hook 2 detik untuk paid social.',
    section: 'video',
    timestamp: 'Ready for export',
    accent: 'from-lime-400/20 via-emerald-500/10 to-transparent',
  },
  {
    id: 'seed-4',
    title: 'Voice-over · Founder note',
    type: 'Audio',
    summary: 'VO ringkas 30 detik dengan ritme hangat dan CTA lembut.',
    section: 'audio',
    timestamp: 'Disimpan',
    accent: 'from-amber-400/20 via-orange-500/10 to-transparent',
  },
];

const DEFAULT_CHAT: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Siap. Workspace studio sudah aktif. Lempar brief, lalu hamba bantu pecah jadi copy, visual, storyboard, atau blueprint campaign.',
  },
];

const VIEW_DESCRIPTIONS: Record<StudioView, { title: string; description: string }> = {
  explore: {
    title: 'Creative operating system untuk konten cepat',
    description:
      'Versi orisinal proyek ini kini memakai pola UI studio modern: kartu hero, shortcut tools, preset vault, canvas, dan copilot aktif.',
  },
  copy: {
    title: 'Lab Naskah',
    description:
      'Buat naskah, caption, landing copy, dan script singkat dengan struktur yang siap dipakai.',
  },
  image: {
    title: 'Lab Arah Visual',
    description:
      'Rancang visual brief, framing, negative prompt, dan preview moodboard untuk produksi asset gambar.',
  },
  video: {
    title: 'Lab Storyboard Gerak',
    description:
      'Bangun urutan scene, camera motion, hook, dan CTA untuk short-form video dan iklan.',
  },
  audio: {
    title: 'Audio Script Lab',
    description:
      'Buat voice-over, sound direction, dan pacing untuk ad, intro, atau narasi.',
  },
  campaigns: {
    title: 'Campaign Studio',
    description:
      'Satu input jadi angle campaign, hook, CTA, channel plan, dan repurposing map.',
  },
  canvas: {
    title: 'Canvas & Workflow',
    description:
      'Simpan hasil terbaik ke board produksi supaya tim bisa mengeksekusi tanpa pindah-pindah tool.',
  },
  assistant: {
    title: 'AI Copilot',
    description:
      'Tempat diskusi cepat untuk revisi, strategi, ide konten, dan next action.',
  },
  apps: {
    title: 'Utilitas & preset cepat',
    description:
      'Virality predictor, preset vault, quick launch, dan utilitas kecil untuk mempercepat workflow.',
  },
  settings: {
    title: 'Provider & integrasi',
    description:
      'Atur provider, model, API key, dan mode kerja live atau demo.',
  },
};

function hashString(value: string): number {
  return value.split('').reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function escapeSvg(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPreviewSvg(title: string, subtitle: string, badge: string, seed: string): string {
  const hue = hashString(seed) % 360;
  const secondaryHue = (hue + 55) % 360;
  const glowHue = (hue + 120) % 360;
  const safeTitle = escapeSvg(title.toUpperCase());
  const safeSubtitle = escapeSvg(subtitle);
  const safeBadge = escapeSvg(badge.toUpperCase());
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" x2="1600" y1="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="hsl(${hue} 72% 10%)" />
          <stop offset="0.55" stop-color="hsl(${secondaryHue} 68% 12%)" />
          <stop offset="1" stop-color="hsl(${glowHue} 62% 8%)" />
        </linearGradient>
        <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 220) rotate(20) scale(520 340)">
          <stop stop-color="hsla(${hue} 100% 72% / 0.62)" />
          <stop offset="1" stop-color="hsla(${hue} 100% 52% / 0)" />
        </radialGradient>
        <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1240 660) rotate(-18) scale(560 360)">
          <stop stop-color="hsla(${glowHue} 100% 74% / 0.52)" />
          <stop offset="1" stop-color="hsla(${glowHue} 100% 52% / 0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" rx="44" fill="url(#bg)" />
      <rect width="1600" height="900" rx="44" fill="url(#glowA)" />
      <rect width="1600" height="900" rx="44" fill="url(#glowB)" />
      <g opacity="0.28">
        <path d="M0 120H1600" stroke="white" stroke-opacity="0.14" />
        <path d="M0 250H1600" stroke="white" stroke-opacity="0.10" />
        <path d="M0 380H1600" stroke="white" stroke-opacity="0.08" />
        <path d="M0 510H1600" stroke="white" stroke-opacity="0.08" />
        <path d="M0 640H1600" stroke="white" stroke-opacity="0.10" />
        <path d="M0 770H1600" stroke="white" stroke-opacity="0.14" />
        <path d="M180 0V900" stroke="white" stroke-opacity="0.08" />
        <path d="M560 0V900" stroke="white" stroke-opacity="0.08" />
        <path d="M940 0V900" stroke="white" stroke-opacity="0.08" />
        <path d="M1320 0V900" stroke="white" stroke-opacity="0.08" />
      </g>
      <rect x="52" y="52" width="1496" height="796" rx="38" stroke="rgba(255,255,255,0.12)" />
      <rect x="88" y="88" width="180" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" />
      <text x="118" y="118" fill="white" font-size="20" font-family="Inter, Arial" font-weight="700" letter-spacing="3">${safeBadge}</text>
      <text x="112" y="650" fill="white" font-size="88" font-family="Inter, Arial" font-weight="800" letter-spacing="-3">${safeTitle}</text>
      <text x="112" y="724" fill="rgba(255,255,255,0.82)" font-size="32" font-family="Inter, Arial" font-weight="500">${safeSubtitle}</text>
      <rect x="112" y="770" width="220" height="54" rx="27" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.16)" />
      <text x="148" y="804" fill="white" font-size="22" font-family="Inter, Arial" font-weight="700">Preview asset</text>
      <circle cx="1320" cy="198" r="88" fill="rgba(255,255,255,0.08)" />
      <circle cx="1176" cy="300" r="38" fill="rgba(255,255,255,0.14)" />
      <circle cx="1354" cy="410" r="24" fill="rgba(255,255,255,0.18)" />
      <path d="M1080 592C1154 522 1278 492 1386 538" stroke="rgba(255,255,255,0.34)" stroke-width="2" stroke-dasharray="8 12" />
      <path d="M1030 642C1132 700 1268 712 1418 660" stroke="rgba(255,255,255,0.18)" stroke-width="2" stroke-dasharray="10 14" />
      <rect x="1078" y="556" width="324" height="190" rx="32" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
      <text x="1120" y="616" fill="white" font-size="24" font-family="Inter, Arial" font-weight="700">Creative graph</text>
      <text x="1120" y="660" fill="rgba(255,255,255,0.72)" font-size="18" font-family="Inter, Arial">Prompt • Motion • CTA • Format</text>
      <text x="1120" y="704" fill="rgba(255,255,255,0.48)" font-size="18" font-family="Inter, Arial">Ready for export</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function nowStamp(): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kendala yang tidak diketahui.';
}

function extractMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (
          typeof part === 'object' &&
          part !== null &&
          'text' in part &&
          typeof part.text === 'string'
        ) {
          return part.text;
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function getEnvApiKey(providerId: ProviderId): string {
  if (providerId === 'demo') {
    return '';
  }

  const envMap: Record<Exclude<ProviderId, 'demo'>, string | undefined> = {
    openrouter: import.meta.env.VITE_OPENROUTER_API_KEY,
    openai: import.meta.env.VITE_OPENAI_API_KEY,
    anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
    gemini: import.meta.env.VITE_GEMINI_API_KEY,
    compatible: import.meta.env.VITE_COMPATIBLE_API_KEY,
  };

  return envMap[providerId] ?? '';
}

function splitSystemPrompt(messages: OpenRouterMessage[]): {
  systemPrompt: string;
  turns: Array<{ role: 'user' | 'assistant'; content: string }>;
} {
  return messages.reduce(
    (accumulator, message) => {
      if (message.role === 'system') {
        accumulator.systemPrompt = accumulator.systemPrompt
          ? `${accumulator.systemPrompt}\n\n${message.content}`
          : message.content;
      } else {
        accumulator.turns.push({
          role: message.role,
          content: message.content,
        });
      }

      return accumulator;
    },
    {
      systemPrompt: '',
      turns: [] as Array<{ role: 'user' | 'assistant'; content: string }>,
    },
  );
}

function extractChatCompletionText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Respons provider tidak valid.');
  }

  const completion = data as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const text = extractMessageContent(completion.choices?.[0]?.message?.content);
  if (!text) {
    throw new Error('Provider tidak mengembalikan konten teks yang bisa dipakai.');
  }

  return text;
}

function extractOpenAIResponseText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Respons OpenAI tidak valid.');
  }

  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const text = (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((part) => (part.type === 'output_text' && typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('OpenAI tidak mengembalikan teks yang bisa dipakai.');
  }

  return text;
}

function extractAnthropicText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Respons Anthropic tidak valid.');
  }

  const response = data as {
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  };

  const text = (response.content ?? [])
    .map((part) => (part.type === 'text' && typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Anthropic tidak mengembalikan teks yang bisa dipakai.');
  }

  return text;
}

function extractGeminiText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Respons Gemini tidak valid.');
  }

  const response = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const text = (response.candidates?.[0]?.content?.parts ?? [])
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini tidak mengembalikan teks yang bisa dipakai.');
  }

  return text;
}

async function requestProviderText(params: {
  providerId: ProviderId;
  config: ProviderRuntimeConfig;
  messages: OpenRouterMessage[];
}): Promise<string> {
  const { providerId, config, messages } = params;
  const providerMeta = PROVIDER_META[providerId];

  if (providerId === 'demo') {
    throw new Error('Mode demo tidak mengirim permintaan live ke provider.');
  }

  const apiKey = config.apiKey.trim() || getEnvApiKey(providerId);
  const model = config.model.trim() || providerMeta.defaultModel;
  const baseUrl = normalizeBaseUrl(config.baseUrl || providerMeta.baseUrl);
  const referer = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  if (!apiKey) {
    throw new Error(`API key untuk ${providerMeta.label} belum diisi.`);
  }

  if (providerId === 'compatible' && !baseUrl) {
    throw new Error('Base URL untuk provider kompatibel belum diisi.');
  }

  switch (providerId) {
    case 'openrouter': {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': referer,
          'X-Title': 'KontenKilat AI Studio',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Permintaan ke OpenRouter gagal. Cek API key, model, atau batas akun.');
      }

      return extractChatCompletionText(await response.json());
    }

    case 'openai': {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Permintaan ke OpenAI gagal. Periksa API key atau model yang dipakai.');
      }

      return extractOpenAIResponseText(await response.json());
    }

    case 'anthropic': {
      const { systemPrompt, turns } = splitSystemPrompt(messages);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1800,
          ...(systemPrompt ? { system: systemPrompt } : {}),
          messages: turns,
        }),
      });

      if (!response.ok) {
        throw new Error('Permintaan ke Anthropic gagal. Periksa API key atau model Claude yang digunakan.');
      }

      return extractAnthropicText(await response.json());
    }

    case 'gemini': {
      const { systemPrompt, turns } = splitSystemPrompt(messages);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(systemPrompt
              ? {
                  system_instruction: {
                    parts: [{ text: systemPrompt }],
                  },
                }
              : {}),
            contents: turns.map((turn) => ({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content }],
            })),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Permintaan ke Gemini gagal. Periksa API key Google AI atau model yang dipakai.');
      }

      return extractGeminiText(await response.json());
    }

    case 'compatible': {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Permintaan ke provider kompatibel gagal. Cek base URL, API key, atau model.');
      }

      return extractChatCompletionText(await response.json());
    }

    default:
      throw new Error('Provider belum dikenali oleh studio.');
  }
}

function createCopyFallback(type: ContentType, tone: string, brief: string): string {
  const trimmedBrief = brief.trim();
  return [
    `# ${type}`,
    '',
    '## Big Idea',
    `${trimmedBrief} dibungkus dengan tone “${tone}” dan pembukaan yang langsung menekan rasa penasaran audiens.`,
    '',
    '## Draft Utama',
    `Masih jualan biasa? Saat brand lain sibuk bikin konten ramai, kamu bisa meluncur lebih cepat dengan konsep ${trimmedBrief.toLowerCase()}.`,
    'Bangun perhatian sejak detik pertama, tunjukkan manfaat nyata, lalu dorong aksi dengan CTA yang jelas dan nggak bertele-tele.',
    '',
    '## Hook Alternatif',
    '1. Kontenmu sepi bukan karena produk jelek — angle-nya belum nancep.',
    '2. Satu brief yang tepat bisa pecah jadi banyak aset yang tetap konsisten.',
    '3. Kalau 3 detik pertama gagal, sisa kontenmu hampir pasti ikut tenggelam.',
    '',
    '## CTA',
    'Simpan konsep ini, pakai untuk produksi berikutnya, lalu tes 2 versi hook dalam 24 jam.',
  ].join('\n');
}

function createImageFallback(
  prompt: string,
  preset: string,
  style: string,
  ratio: AspectRatio,
  negative: string,
): string {
  return [
    `# Visual Brief · ${preset}`,
    '',
    '## Hero Prompt',
    `${prompt.trim()}, ${style.toLowerCase()} style, ${ratio} composition, ${preset.toLowerCase()} mood, premium lighting, sharp focal detail, production-ready art direction.`,
    '',
    '## Negative Prompt',
    negative.trim() || 'blur, low contrast, muddy colors, awkward anatomy, cluttered frame',
    '',
    '## Camera & Lighting',
    '- Angle: 3/4 hero shot dengan fokus subjek utama di foreground.',
    '- Light: rim light tipis + key light lembut untuk depth dan separasi.',
    '- Background: bersih, ada depth, tidak mencuri perhatian dari subjek.',
    '',
    '## Production Notes',
    '- Sisakan area kosong untuk headline dan CTA.',
    '- Pastikan warna utama brand tetap dominan di frame.',
    '- Output cocok dijadikan still hero, thumbnail, atau key visual campaign.',
  ].join('\n');
}

function createVideoFallback(
  idea: string,
  motion: string,
  duration: string,
  platform: string,
): string {
  return [
    `# Storyboard · ${platform}`,
    '',
    '## Opening Hook (0-3 dtk)',
    `Mulai dengan visual paling mengejutkan dari ide “${idea.trim()}”, lalu dorong curiosity gap lewat teks overlay singkat.`,
    '',
    '## Motion Signature',
    `${motion} untuk memberi rasa premium dan mempertegas momen reveal.`,
    '',
    '## Beat Sheet',
    '1. Masalah / rasa penasaran muncul secepat mungkin.',
    '2. Reveal solusi atau produk inti.',
    '3. Tunjukkan benefit paling konkret dalam visual singkat.',
    '4. Social proof atau before-after cepat.',
    '5. CTA kuat dengan urgency ringan.',
    '',
    '## Durasi Final',
    `${duration} dengan ritme cepat, setiap beat maksimal 2-4 detik.`,
    '',
    '## Overlay Text',
    '- “Stop scroll.”',
    '- “Ini alasan kenapa angle biasa gagal.”',
    '- “Tes versi ini sekarang.”',
  ].join('\n');
}

function createAudioFallback(idea: string, vibe: string, format: string): string {
  return [
    `# ${format}`,
    '',
    '## Direction',
    `${idea.trim()} dibawakan dengan vibe ${vibe.toLowerCase()}, tempo jelas, dan jeda singkat di kalimat penjualan utama.`,
    '',
    '## Voice Script',
    `Kalau kamu ingin hasil yang lebih rapi tanpa proses yang ribet, mulai dari angle yang tepat. ${idea.trim()} bukan cuma soal tampil keren, tapi soal bikin orang langsung paham kenapa mereka harus peduli.`,
    '',
    '## Sound Bed',
    '- Tekstur ambient tipis di intro',
    '- Pulse halus saat CTA muncul',
    '- Tail pendek agar mudah dipotong ke format vertikal',
    '',
    '## Delivery Notes',
    '- Tekan kata kunci benefit utama.',
    '- Sisakan 0.5 detik jeda sebelum CTA final.',
  ].join('\n');
}

function createCampaignFallback(
  linkOrProduct: string,
  offer: string,
  audience: string,
  goal: string,
): string {
  const resolvedAudience = audience.trim() || 'audience inti';
  const resolvedOffer = offer.trim() || 'hasil yang cepat dan jelas';

  return [
    `# Campaign Blueprint · ${goal}`,
    '',
    '## Offer Frame',
    `${linkOrProduct.trim()} diposisikan sebagai solusi paling relevan untuk ${resolvedAudience} dengan pengait utama: ${resolvedOffer}.`,
    '',
    '## 3 Winning Angles',
    '1. Pain-led: tonjolkan masalah yang selama ini dibiarkan terlalu lama.',
    '2. Transformation-led: tunjukkan perubahan yang bisa dirasakan dalam waktu singkat.',
    '3. Proof-led: tampilkan bukti, testimonial, atau indikator hasil yang konkret.',
    '',
    '## Asset Stack',
    '- 1 hero ad untuk top of funnel',
    '- 2 UGC cuts untuk retargeting',
    '- 1 landing hero copy + CTA',
    '- 3 caption pendek untuk distribusi organik',
    '',
    '## CTA Tree',
    '- CTA 1: lihat demo / hasil',
    '- CTA 2: klaim penawaran / daftar trial',
    '- CTA 3: simpan dan bandingkan dengan angle lama',
  ].join('\n');
}

function createChatFallback(message: string, context: string): string {
  return [
    `Untuk konteks ${context.toLowerCase()}, hamba sarankan kita pecah jadi 3 lapisan:`,
    '1. Hook yang bikin orang berhenti scroll.',
    '2. Benefit yang langsung terasa dan gampang divisualkan.',
    '3. CTA yang spesifik, bukan ajakan generik.',
    '',
    `Kalau mau, brief “${truncate(message, 80)}” bisa langsung aku ubah jadi copy, prompt visual, atau storyboard di tab terkait.`,
  ].join('\n');
}

function computeViralityReport(hook: string, caption: string, cta: string): ViralityReport {
  let score = 42;
  const notes: string[] = [];
  const hookLength = hook.trim().length;
  const captionLength = caption.trim().length;

  if (hookLength >= 24 && hookLength <= 78) {
    score += 18;
    notes.push('Hook berada di rentang ideal untuk short-form attention span.');
  } else {
    notes.push('Hook terlalu pendek atau terlalu panjang; coba padatkan 1 ide utama.');
  }

  if (/\d/.test(hook) || /\b(rahasia|salah|stop|kenapa|cara)\b/i.test(hook)) {
    score += 12;
    notes.push('Ada pemicu curiosity / pattern interrupt di hook.');
  } else {
    notes.push('Tambahkan kontras, angka, atau pattern interrupt agar hook lebih kuat.');
  }

  if (captionLength >= 60 && captionLength <= 220) {
    score += 10;
    notes.push('Caption cukup panjang untuk konteks tanpa terasa berat.');
  } else {
    notes.push('Caption bisa dibuat lebih fokus: 1 insight, 1 proof, 1 CTA.');
  }

  if (cta.trim().length >= 8) {
    score += 8;
    notes.push('CTA sudah spesifik dan dapat diukur.');
  } else {
    notes.push('CTA terlalu umum; coba arahkan ke aksi yang benar-benar jelas.');
  }

  if (/\b(kamu|anda|lo|lu)\b/i.test(caption)) {
    score += 6;
    notes.push('Bahasa terasa personal dan langsung menyapa audiens.');
  }

  if (caption.includes('\n') || caption.includes('•') || caption.includes('-')) {
    score += 4;
    notes.push('Struktur caption mudah dipindai mata.');
  }

  score = Math.max(0, Math.min(100, score));

  let label = 'Perlu polesan';
  if (score >= 80) {
    label = 'Siap dites';
  } else if (score >= 65) {
    label = 'Lumayan kuat';
  }

  return { score, label, notes };
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getInitialPersistedState(): PersistedState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState> & {
      apiKey?: string;
      provider?: string;
      textModel?: string;
    };

    if (
      typeof parsed.selectedProvider === 'string' &&
      PROVIDER_IDS.includes(parsed.selectedProvider as ProviderId) &&
      parsed.providerConfigs &&
      Array.isArray(parsed.savedItems) &&
      Array.isArray(parsed.chatMessages)
    ) {
      const restoredActiveView =
        typeof parsed.activeView === 'string' &&
        NAV_ITEMS.some((item) => item.id === parsed.activeView)
          ? (parsed.activeView as StudioView)
          : undefined;

      return {
        selectedProvider: parsed.selectedProvider as ProviderId,
        providerConfigs: mergeProviderConfigs(parsed.providerConfigs),
        savedItems: parsed.savedItems as SavedItem[],
        chatMessages: parsed.chatMessages as ChatMessage[],
        activeView: restoredActiveView,
        workspaceDrafts:
          typeof parsed.workspaceDrafts === 'object' && parsed.workspaceDrafts !== null
            ? (parsed.workspaceDrafts as WorkspaceDrafts)
            : undefined,
      };
    }

    if (
      typeof parsed.apiKey === 'string' &&
      typeof parsed.provider === 'string' &&
      typeof parsed.textModel === 'string' &&
      Array.isArray(parsed.savedItems) &&
      Array.isArray(parsed.chatMessages)
    ) {
      const migratedConfigs = createDefaultProviderConfigs();
      migratedConfigs.openrouter.apiKey = parsed.apiKey;
      migratedConfigs.openrouter.model = parsed.textModel;

      return {
        selectedProvider: 'openrouter',
        providerConfigs: migratedConfigs,
        savedItems: parsed.savedItems as SavedItem[],
        chatMessages: parsed.chatMessages as ChatMessage[],
        activeView: 'explore',
      };
    }
  } catch {
    return null;
  }

  return null;
}

export {
  ART_STYLES,
  ASPECT_RATIO_CLASSES,
  ASPECT_RATIOS,
  AUDIO_FORMATS,
  BRAND_LOGO_MARK,
  CAMPAIGN_GOALS,
  CONTENT_TYPES,
  COPY_TONES,
  DEFAULT_CHAT,
  DEFAULT_SAVED_ITEMS,
  FEATURED_FLOWS,
  HERO_ART_PRIMARY,
  HERO_ART_SECONDARY,
  MOBILE_DOCK_ITEMS,
  NAV_ITEMS,
  PRESETS,
  PROVIDER_IDS,
  PROVIDER_META,
  STORAGE_KEY,
  VIEW_DESCRIPTIONS,
  VIDEO_DURATIONS,
  VIDEO_MOTIONS,
  buildPreviewSvg,
  computeViralityReport,
  countWords,
  createAudioFallback,
  createCampaignFallback,
  createChatFallback,
  createCopyFallback,
  createDefaultProviderConfigs,
  createImageFallback,
  createVideoFallback,
  downloadTextFile,
  getEnvApiKey,
  getInitialPersistedState,
  mergeProviderConfigs,
  normalizeBaseUrl,
  nowStamp,
  requestProviderText,
  toErrorMessage,
  truncate,
};

export type {
  AspectRatio,
  ChatMessage,
  ChatRole,
  ContentType,
  FeatureCardData,
  NavItem,
  OpenRouterMessage,
  PersistedState,
  Preset,
  ProviderConfigMap,
  ProviderId,
  ProviderMeta,
  ProviderRuntimeConfig,
  SavedItem,
  StudioView,
  ViralityReport,
  WorkspaceDrafts,
};
