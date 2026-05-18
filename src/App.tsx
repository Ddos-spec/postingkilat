import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Database,
  Download,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageSquare,
  Palette,
  PenTool,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
  Zap,
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
  'Santai creator-style',
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
const HERO_ART_PRIMARY = `${GENERATED_ART_BASE}hero-campaign.webp`;
const HERO_ART_SECONDARY = `${GENERATED_ART_BASE}mobile-studio.webp`;

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

interface PersistedState {
  selectedProvider: ProviderId;
  providerConfigs: ProviderConfigMap;
  savedItems: SavedItem[];
  chatMessages: ChatMessage[];
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
      'Siap, Bos. Aku sudah set workspace versi kreator-performance. Lempar brief, aku bantu pecah jadi copy, visual, storyboard, atau campaign.',
  },
];

const VIEW_DESCRIPTIONS: Record<StudioView, { title: string; description: string }> = {
  explore: {
    title: 'Creative operating system untuk konten cepat',
    description:
      'Versi orisinal proyek ini kini memakai pola UI studio modern: kartu hero, shortcut tools, preset vault, canvas, dan copilot aktif.',
  },
  copy: {
    title: 'Copy Lab',
    description:
      'Generate naskah, caption, landing copy, dan script singkat dengan struktur yang siap dipakai.',
  },
  image: {
    title: 'Image Direction Lab',
    description:
      'Rancang visual brief, framing, negative prompt, dan preview moodboard untuk produksi asset gambar.',
  },
  video: {
    title: 'Motion Storyboard Lab',
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
    title: 'Micro Apps & Presets',
    description:
      'Virality predictor, preset vault, quick launch, dan utilitas kecil untuk mempercepat workflow.',
  },
  settings: {
    title: 'Runtime & Integrations',
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
    `Oke Bos, untuk konteks ${context.toLowerCase()}, aku sarankan kita pecah jadi 3 lapisan:`,
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
      return {
        selectedProvider: parsed.selectedProvider as ProviderId,
        providerConfigs: mergeProviderConfigs(parsed.providerConfigs),
        savedItems: parsed.savedItems as SavedItem[],
        chatMessages: parsed.chatMessages as ChatMessage[],
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
      };
    }
  } catch {
    return null;
  }

  return null;
}

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`ui-card-hover ui-fade-up rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(5,8,20,0.45)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-300">
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassPanel className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </GlassPanel>
  );
}

function App() {
  const persistedState = useMemo(() => getInitialPersistedState(), []);
  const [activeView, setActiveView] = useState<StudioView>('explore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<ContentType>('Caption Instagram');
  const [copyTone, setCopyTone] = useState<(typeof COPY_TONES)[number]>('Tajam & meyakinkan');
  const [promptInput, setPromptInput] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copyError, setCopyError] = useState('');

  const [imagePrompt, setImagePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blur, noisy texture, weak contrast, cluttered frame');
  const [artStyle, setArtStyle] = useState<(typeof ART_STYLES)[number]>('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [visualPreset, setVisualPreset] = useState<string>(PRESETS[0].name);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageOutput, setImageOutput] = useState('');
  const [imageError, setImageError] = useState('');

  const [videoIdea, setVideoIdea] = useState('');
  const [videoMotion, setVideoMotion] = useState<(typeof VIDEO_MOTIONS)[number]>('Slow dolly in');
  const [videoDuration, setVideoDuration] = useState<(typeof VIDEO_DURATIONS)[number]>('30 detik');
  const [videoPlatform, setVideoPlatform] = useState('Instagram Reels');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoOutput, setVideoOutput] = useState('');
  const [videoError, setVideoError] = useState('');

  const [audioIdea, setAudioIdea] = useState('');
  const [audioVibe, setAudioVibe] = useState('Cinematic pulse');
  const [audioFormat, setAudioFormat] = useState<(typeof AUDIO_FORMATS)[number]>('Voice-over Ad');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioOutput, setAudioOutput] = useState('');
  const [audioError, setAudioError] = useState('');

  const [campaignLink, setCampaignLink] = useState('');
  const [campaignOffer, setCampaignOffer] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('');
  const [campaignGoal, setCampaignGoal] = useState<(typeof CAMPAIGN_GOALS)[number]>('Konversi');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [campaignOutput, setCampaignOutput] = useState('');
  const [campaignError, setCampaignError] = useState('');

  const [viralityHook, setViralityHook] = useState('');
  const [viralityCaption, setViralityCaption] = useState('');
  const [viralityCta, setViralityCta] = useState('');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    persistedState?.chatMessages.length ? persistedState.chatMessages : DEFAULT_CHAT,
  );
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState<ProviderId>(
    persistedState?.selectedProvider ?? 'demo',
  );
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfigMap>(
    persistedState?.providerConfigs ?? createDefaultProviderConfigs(),
  );
  const [settingsNotice, setSettingsNotice] = useState('');
  const [savedItems, setSavedItems] = useState<SavedItem[]>(
    persistedState?.savedItems.length ? persistedState.savedItems : DEFAULT_SAVED_ITEMS,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeProviderMeta = PROVIDER_META[selectedProvider];
  const activeProviderConfig = providerConfigs[selectedProvider];
  const resolvedApiKey =
    selectedProvider === 'demo'
      ? ''
      : activeProviderConfig.apiKey.trim() || getEnvApiKey(selectedProvider);
  const resolvedModel =
    activeProviderConfig.model.trim() || activeProviderMeta.defaultModel;
  const resolvedBaseUrl = normalizeBaseUrl(
    activeProviderConfig.baseUrl || activeProviderMeta.baseUrl,
  );
  const runtimeProviderConfig: ProviderRuntimeConfig = {
    apiKey: resolvedApiKey,
    model: resolvedModel,
    baseUrl: resolvedBaseUrl,
  };
  const providerStatus =
    selectedProvider === 'demo'
      ? 'demo'
      : selectedProvider === 'compatible'
        ? resolvedApiKey && resolvedBaseUrl && resolvedModel
          ? 'live'
          : 'setup'
        : resolvedApiKey && resolvedModel
          ? 'live'
          : 'setup';
  const liveAiEnabled = providerStatus === 'live';
  const activeViewMeta = VIEW_DESCRIPTIONS[activeView];
  const currentPreset = PRESETS.find((preset) => preset.name === visualPreset) ?? PRESETS[0];

  const imagePreview = useMemo(
    () =>
      buildPreviewSvg(
        imagePrompt.trim() || 'Visual Prompt Lab',
        `${currentPreset.name} · ${artStyle} · ${aspectRatio}`,
        'Image',
        `${imagePrompt}-${currentPreset.name}-${artStyle}-${aspectRatio}`,
      ),
    [imagePrompt, currentPreset.name, artStyle, aspectRatio],
  );

  const videoPreview = useMemo(
    () =>
      buildPreviewSvg(
        videoIdea.trim() || 'Motion Storyboard',
        `${videoPlatform} · ${videoMotion} · ${videoDuration}`,
        'Video',
        `${videoIdea}-${videoPlatform}-${videoMotion}-${videoDuration}`,
      ),
    [videoIdea, videoPlatform, videoMotion, videoDuration],
  );

  const wordsGenerated = useMemo(
    () =>
      [generatedCopy, imageOutput, videoOutput, audioOutput, campaignOutput]
        .map(countWords)
        .reduce((sum, count) => sum + count, 0),
    [generatedCopy, imageOutput, videoOutput, audioOutput, campaignOutput],
  );

  const viralityReport = useMemo(
    () => computeViralityReport(viralityHook, viralityCaption, viralityCta),
    [viralityHook, viralityCaption, viralityCta],
  );

  const workflowColumns = useMemo(() => {
    const research = savedItems
      .filter((item) => ['campaigns', 'copy', 'apps'].includes(item.section))
      .slice(0, 4);
    const build = savedItems
      .filter((item) => ['image', 'video', 'audio'].includes(item.section))
      .slice(0, 4);
    const publish = savedItems
      .filter((item) => ['assistant', 'canvas', 'explore', 'settings'].includes(item.section))
      .slice(0, 4);

    return [
      { title: 'Research', detail: 'Brief, angle, offer', items: research },
      { title: 'Build', detail: 'Visual, motion, audio', items: build },
      { title: 'Publish', detail: 'CTA, approval, handoff', items: publish },
    ];
  }, [savedItems]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload: PersistedState = {
      selectedProvider,
      providerConfigs,
      savedItems,
      chatMessages,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [selectedProvider, providerConfigs, savedItems, chatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatting]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const updateProviderConfig = (
    providerId: ProviderId,
    patch: Partial<ProviderRuntimeConfig>,
  ) => {
    setProviderConfigs((previous) => ({
      ...previous,
      [providerId]: {
        ...previous[providerId],
        ...patch,
      },
    }));
  };

  const saveProject = (payload: Omit<SavedItem, 'id' | 'timestamp'>) => {
    setSavedItems((previous) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          timestamp: nowStamp(),
          ...payload,
        },
        ...previous,
      ].slice(0, 12),
    );
  };

  const handleCopyToClipboard = async (key: string, content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  const applyPreset = (preset: Preset) => {
    setVisualPreset(preset.name);
    setArtStyle(
      preset.name === 'UGC Proof'
        ? 'Photorealistic'
        : preset.name === 'Neon Velocity'
          ? 'Cyberpunk'
          : 'Editorial',
    );
    setImagePrompt((current) => current || `${preset.description} untuk produk / campaign hero shot`);
    setVideoIdea((current) => current || `${preset.vibe} untuk launch 30 detik`);
    setAudioIdea((current) => current || `${preset.description} dibacakan seperti creator-performance ad`);
    setActiveView('image');
    closeMobileMenu();
  };

  const handleGenerateCopy = async () => {
    if (!promptInput.trim()) {
      setCopyError('Isi brief atau topik dulu, Bos.');
      return;
    }

    setCopyError('');
    setIsGeneratingCopy(true);
    setGeneratedCopy('');

    try {
      const result = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah AI creative strategist. Balas dalam bahasa Indonesia, format markdown, dan hasilkan copy yang ringkas, persuasif, siap pakai dengan bagian Hook, Draft Utama, Angle Alternatif, dan CTA.',
              },
              {
                role: 'user',
                content: `Tipe konten: ${selectedType}\nTone: ${copyTone}\nBrief: ${promptInput.trim()}`,
              },
            ],
          })
        : createCopyFallback(selectedType, copyTone, promptInput);

      setGeneratedCopy(result);
      saveProject({
        title: `${selectedType} · ${truncate(promptInput.trim(), 34)}`,
        type: 'Copy',
        summary: truncate(result.replace(/[#*`>-]/g, '').replace(/\s+/g, ' ').trim(), 108),
        section: 'copy',
        accent: 'from-fuchsia-500/20 via-violet-500/10 to-transparent',
      });
    } catch (error) {
      setCopyError(toErrorMessage(error));
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError('Tulis deskripsi visual dulu, Bos.');
      return;
    }

    setImageError('');
    setIsGeneratingImage(true);
    setImageOutput('');

    try {
      const result = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah creative director untuk performance marketing. Balas dalam bahasa Indonesia, format markdown, dengan bagian Hero Prompt, Negative Prompt, Camera & Lighting, dan Production Notes.',
              },
              {
                role: 'user',
                content: `Preset: ${visualPreset}\nStyle: ${artStyle}\nAspect ratio: ${aspectRatio}\nPrompt: ${imagePrompt.trim()}\nNegative prompt: ${negativePrompt.trim()}`,
              },
            ],
          })
        : createImageFallback(imagePrompt, visualPreset, artStyle, aspectRatio, negativePrompt);

      setImageOutput(result);
      saveProject({
        title: `Visual · ${truncate(imagePrompt.trim(), 34)}`,
        type: 'Image',
        summary: truncate(result.replace(/[#*`>-]/g, '').replace(/\s+/g, ' ').trim(), 108),
        section: 'image',
        accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
      });
    } catch (error) {
      setImageError(toErrorMessage(error));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoIdea.trim()) {
      setVideoError('Isi ide video atau campaign moment dulu, Bos.');
      return;
    }

    setVideoError('');
    setIsGeneratingVideo(true);
    setVideoOutput('');

    try {
      const result = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah storyboard director untuk short-form ads. Balas dalam bahasa Indonesia, format markdown, dengan bagian Opening Hook, Motion Signature, Beat Sheet, Overlay Text, dan CTA.',
              },
              {
                role: 'user',
                content: `Platform: ${videoPlatform}\nDurasi: ${videoDuration}\nMotion: ${videoMotion}\nIde video: ${videoIdea.trim()}`,
              },
            ],
          })
        : createVideoFallback(videoIdea, videoMotion, videoDuration, videoPlatform);

      setVideoOutput(result);
      saveProject({
        title: `Video · ${truncate(videoIdea.trim(), 34)}`,
        type: 'Video',
        summary: truncate(result.replace(/[#*`>-]/g, '').replace(/\s+/g, ' ').trim(), 108),
        section: 'video',
        accent: 'from-lime-400/20 via-emerald-500/10 to-transparent',
      });
    } catch (error) {
      setVideoError(toErrorMessage(error));
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioIdea.trim()) {
      setAudioError('Kasih topik atau konteks audio dulu, Bos.');
      return;
    }

    setAudioError('');
    setIsGeneratingAudio(true);
    setAudioOutput('');

    try {
      const result = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah audio director untuk iklan dan konten kreator. Balas dalam bahasa Indonesia, format markdown, dengan bagian Direction, Voice Script, Sound Bed, dan Delivery Notes.',
              },
              {
                role: 'user',
                content: `Format: ${audioFormat}\nVibe: ${audioVibe}\nTopik audio: ${audioIdea.trim()}`,
              },
            ],
          })
        : createAudioFallback(audioIdea, audioVibe, audioFormat);

      setAudioOutput(result);
      saveProject({
        title: `Audio · ${truncate(audioIdea.trim(), 34)}`,
        type: 'Audio',
        summary: truncate(result.replace(/[#*`>-]/g, '').replace(/\s+/g, ' ').trim(), 108),
        section: 'audio',
        accent: 'from-amber-400/20 via-orange-500/10 to-transparent',
      });
    } catch (error) {
      setAudioError(toErrorMessage(error));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!campaignLink.trim()) {
      setCampaignError('Masukkan nama produk, link, atau brief campaign dulu, Bos.');
      return;
    }

    setCampaignError('');
    setIsGeneratingCampaign(true);
    setCampaignOutput('');

    try {
      const result = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah campaign strategist untuk brand digital. Balas dalam bahasa Indonesia, format markdown, dengan bagian Offer Frame, 3 Winning Angles, Asset Stack, CTA Tree, dan Distribution Notes.',
              },
              {
                role: 'user',
                content: `Produk / link: ${campaignLink.trim()}\nOffer: ${campaignOffer.trim()}\nAudience: ${campaignAudience.trim()}\nGoal: ${campaignGoal}`,
              },
            ],
          })
        : createCampaignFallback(campaignLink, campaignOffer, campaignAudience, campaignGoal);

      setCampaignOutput(result);
      saveProject({
        title: `Campaign · ${truncate(campaignLink.trim(), 34)}`,
        type: 'Campaign',
        summary: truncate(result.replace(/[#*`>-]/g, '').replace(/\s+/g, ' ').trim(), 108),
        section: 'campaigns',
        accent: 'from-fuchsia-500/20 via-violet-500/10 to-transparent',
      });
    } catch (error) {
      setCampaignError(toErrorMessage(error));
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsChatting(true);

    try {
      const copilotMessages: OpenRouterMessage[] = [
        {
          role: 'system',
          content:
            'Kamu adalah AI copilot untuk studio konten. Balas dalam bahasa Indonesia, tajam, to-the-point, dan beri next-step yang bisa langsung dieksekusi.',
        },
        ...nextMessages.map((message): OpenRouterMessage => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
        })),
      ];

      const responseText = liveAiEnabled
        ? await requestProviderText({
            providerId: selectedProvider,
            config: runtimeProviderConfig,
            messages: copilotMessages,
          })
        : createChatFallback(userMessage.content, activeViewMeta.title);

      setChatMessages((previous) => {
        const updatedMessages: ChatMessage[] = [
          ...previous,
          { role: 'assistant', content: responseText },
        ];

        return updatedMessages.slice(-24);
      });
    } catch (error) {
      setChatMessages((previous) => {
        const updatedMessages: ChatMessage[] = [
          ...previous,
          { role: 'assistant', content: `Ada error: ${toErrorMessage(error)}` },
        ];

        return updatedMessages;
      });
    } finally {
      setIsChatting(false);
    }
  };

  const handleSaveSettings = () => {
    setSettingsNotice(
      providerStatus === 'live'
        ? `Pengaturan tersimpan. ${activeProviderMeta.label} siap dipakai.`
        : providerStatus === 'setup'
          ? `Pengaturan tersimpan. Lengkapi API key ${activeProviderMeta.label} agar mode live aktif.`
          : 'Pengaturan tersimpan. Studio tetap siap dipakai dalam mode demo lokal.',
    );

    saveProject({
      title: 'Runtime settings updated',
      type: 'System',
      summary:
        providerStatus === 'live'
          ? `${activeProviderMeta.label} aktif dengan model ${resolvedModel}.`
          : providerStatus === 'setup'
            ? `${activeProviderMeta.label} dipilih, namun kredensial live belum lengkap.`
            : 'Demo mode aktif dengan fallback lokal.',
      section: 'settings',
      accent: 'from-slate-400/20 via-white/5 to-transparent',
    });

    window.setTimeout(() => setSettingsNotice(''), 2200);
  };

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-black/40';
  const textareaClass = `${inputClass} min-h-[130px] resize-none`;
  const primaryButtonClass =
    'inline-flex w-full items-center justify-center rounded-2xl bg-lime-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60';
  const secondaryButtonClass =
    'inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07] sm:w-auto';

  return (
    <div className="min-h-screen bg-[#06070b] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ui-orb-drift absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="ui-orb-drift-delayed absolute right-[-8rem] top-24 h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div className="ui-orb-drift-slow absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-lime-400/10 blur-[160px]" />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06070b]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1580px] items-center gap-4 px-4 py-4 md:px-8">
          <div className="flex min-w-fit items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_12px_30px_rgba(76,201,240,0.14)]">
              <Zap className="h-5 w-5 text-cyan-300" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">KontenKilat AI</p>
              <p className="text-xs text-slate-400">Studio konten cepat untuk naskah, visual, video, dan audio</p>
            </div>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto xl:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeView;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`group inline-flex min-w-fit items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        isActive ? 'bg-black/10 text-black' : 'bg-lime-300 text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 md:flex md:items-center md:gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  providerStatus === 'live'
                    ? 'bg-emerald-400'
                    : providerStatus === 'setup'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                }`}
              />
              {providerStatus === 'live'
                ? `${activeProviderMeta.label} live`
                : providerStatus === 'setup'
                  ? `${activeProviderMeta.label} setup`
                  : 'Demo Mode'}
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 lg:block">
              {savedItems.length} asset tersimpan
            </div>
            <button
              onClick={() => setActiveView('settings')}
              className="hidden rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white md:inline-flex"
              aria-label="Buka settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 xl:hidden"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-[84vw] max-w-sm overflow-y-auto border-l border-white/10 bg-[#0b0d12] p-5 shadow-2xl xl:hidden">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Studio Menu</p>
              <p className="text-xs text-slate-400">Pilih ruang kerja</p>
            </div>
            <button onClick={closeMobileMenu} className="rounded-xl border border-white/10 p-2 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    closeMobileMenu();
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    activeView === item.id
                      ? 'border border-white/10 bg-white text-black'
                      : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <main className="relative z-10 mx-auto max-w-[1580px] px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-10">
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <SectionEyebrow>{activeViewMeta.title}</SectionEyebrow>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                KontenKilat AI Studio
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                {activeViewMeta.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-2">
            <StatCard
              label="Mode"
              value={providerStatus === 'live' ? 'Live AI' : providerStatus === 'setup' ? 'Setup' : 'Demo'}
              detail={
                providerStatus === 'live'
                  ? `${activeProviderMeta.label} · ${resolvedModel}`
                  : providerStatus === 'setup'
                    ? `Lengkapi API key ${activeProviderMeta.label} untuk menyalakan mode live.`
                    : 'Semua modul tetap bisa dicoba tanpa API key.'
              }
            />
            <StatCard
              label="Output"
              value={`${wordsGenerated.toLocaleString('id-ID')} kata`}
              detail="Akumulasi brief, copy, storyboard, audio, dan campaign blueprint."
            />
          </div>
        </div>

        {activeView === 'explore' && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <GlassPanel className="overflow-hidden p-4 md:p-6">
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <button
                    onClick={() => setActiveView('campaigns')}
                    className="ui-sheen group relative min-h-[340px] overflow-hidden rounded-[28px] border border-white/10 bg-black/30 text-left"
                  >
                    <img
                      src={HERO_ART_PRIMARY}
                      alt="Campaign Engine preview"
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/35 to-black/70" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_28%)]" />
                    <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                          Creative OS
                        </span>
                        <span className="rounded-full bg-lime-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-black">
                          New
                        </span>
                      </div>
                      <div className="max-w-xl">
                        <h2 className="text-3xl font-semibold text-white md:text-5xl">Campaign Engine</h2>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 md:text-base">
                          Transform satu brief produk jadi struktur campaign modern: hook, angle, landing copy,
                          visual prompt, storyboard, dan CTA tree.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                          {['UGC hooks', 'Prompt stack', 'Storyboard', 'CTA map'].map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/15 bg-black/20 px-3 py-2"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white">
                          Buka studio
                          <Sparkles className="h-4 w-4 text-cyan-300" />
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {FEATURED_FLOWS.slice(1).map((card) => (
                      <button
                        key={card.title}
                        onClick={() => setActiveView(card.view)}
                        className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${card.accent} p-5 text-left`}
                      >
                        <div className="absolute inset-0 bg-black/55" />
                        <div className="relative">
                          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-200">
                            {card.tag}
                          </span>
                          <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                          <div className="mt-5 flex items-center gap-2 text-sm font-medium text-cyan-200">
                            {card.cta}
                            <Sparkles className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </GlassPanel>

              <div className="space-y-6">
                <GlassPanel className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick launch</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Masuk modul inti</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">
                      <LayoutDashboard className="h-4 w-4 text-cyan-300" />
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {NAV_ITEMS.filter((item) => !['explore', 'settings'].includes(item.id)).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id)}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-cyan-400/20 hover:bg-black/40"
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="h-4 w-4 text-cyan-300" />
                            {item.badge && (
                              <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Runtime stack</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Status studio</h3>
                    </div>
                    <CreditCard className="h-5 w-5 text-lime-300" />
                  </div>
                  <div className="mt-5 space-y-4 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Provider</p>
                      <p className="mt-2 font-medium text-white">{activeProviderMeta.label}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Model</p>
                      <p className="mt-2 font-medium text-white">{resolvedModel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode kerja</p>
                      <p className="mt-2 font-medium text-white">
                        {providerStatus === 'live'
                          ? 'Live AI generation active'
                          : providerStatus === 'setup'
                            ? 'Ready after provider setup'
                            : 'Demo mode active'}
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <GlassPanel className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Preset vault</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Template rasa sinematik</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                      Hamba membangun preset orisinal untuk menggantikan aset pihak ketiga: cukup klik,
                      prompt image dan video akan terisi otomatis sebagai dasar produksi.
                    </p>
                  </div>
                  <button onClick={() => setActiveView('apps')} className={secondaryButtonClass}>
                    Buka apps
                  </button>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`group relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br ${preset.accent} p-[1px] text-left`}
                    >
                      <div className="rounded-[25px] bg-[#0a0c11]/90 p-5 transition group-hover:bg-[#0a0c11]">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                          {preset.name}
                        </span>
                        <p className="mt-4 text-lg font-semibold text-white">{preset.description}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{preset.vibe}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-cyan-200">
                          <span>Apply preset</span>
                          <Sparkles className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recent assets</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Hasil terbaru di board</h3>
                  </div>
                  <button onClick={() => setActiveView('canvas')} className={secondaryButtonClass}>
                    Buka canvas
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {savedItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-[24px] border border-white/10 bg-gradient-to-r ${item.accent} p-[1px]`}
                    >
                      <div className="rounded-[23px] bg-[#090b10]/92 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{item.type}</p>
                          </div>
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-400">{item.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {activeView === 'copy' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Copy Lab</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Generate copy siap pakai</h2>
                </div>
                <PenTool className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Tipe konten</label>
                    <select
                      value={selectedType}
                      onChange={(event) => setSelectedType(event.target.value as ContentType)}
                      className={inputClass}
                    >
                      {CONTENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Tone</label>
                    <select
                      value={copyTone}
                      onChange={(event) => setCopyTone(event.target.value as (typeof COPY_TONES)[number])}
                      className={inputClass}
                    >
                      {COPY_TONES.map((tone) => (
                        <option key={tone} value={tone}>
                          {tone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Brief</label>
                  <textarea
                    value={promptInput}
                    onChange={(event) => setPromptInput(event.target.value)}
                    placeholder="Contoh: bikin landing copy untuk AI tool yang membantu seller membuat 10 konten promosi per hari dengan tone cepat, cerdas, dan meyakinkan."
                    className={textareaClass}
                  />
                </div>
                {copyError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {copyError}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} className={primaryButtonClass}>
                    {isGeneratingCopy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate copy
                  </button>
                  <button
                    onClick={() => {
                      setPromptInput('');
                      setGeneratedCopy('');
                      setCopyError('');
                    }}
                    className={secondaryButtonClass}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="overflow-hidden p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Output</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Draft & angle</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyToClipboard('copy-output', generatedCopy)}
                    disabled={!generatedCopy}
                    className={secondaryButtonClass}
                  >
                    {copiedKey === 'copy-output' ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-lime-300" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={() => downloadTextFile('copy-lab-output.txt', generatedCopy)}
                    disabled={!generatedCopy}
                    className={secondaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick checks</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="font-medium text-white">Hook</p>
                        <p className="mt-2 leading-6 text-slate-400">Pastikan baris pertama mengandung kejutan, rasa rugi, atau kontras jelas.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="font-medium text-white">Body</p>
                        <p className="mt-2 leading-6 text-slate-400">Jangan jelaskan semua hal. Tekan 1 benefit, 1 bukti, 1 CTA.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="font-medium text-white">CTA</p>
                        <p className="mt-2 leading-6 text-slate-400">CTA spesifik selalu menang atas ajakan generik.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                    {generatedCopy ||
                      'Output copy akan muncul di sini. Jika API key belum diisi, studio akan menggunakan fallback generator agar alur kerja tetap hidup.'}
                  </pre>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'image' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Image Direction</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Bangun visual brief</h2>
                </div>
                <ImageIcon className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-3 text-sm text-slate-300">Preset</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          visualPreset === preset.name
                            ? 'bg-white text-black'
                            : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Prompt visual</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(event) => setImagePrompt(event.target.value)}
                    placeholder="Contoh: hero shot smartwatch hitam matte di atas surface metal basah dengan lighting premium dan ruang headline di kiri atas."
                    className={textareaClass}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Style</label>
                    <select
                      value={artStyle}
                      onChange={(event) => setArtStyle(event.target.value as (typeof ART_STYLES)[number])}
                      className={inputClass}
                    >
                      {ART_STYLES.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Aspect ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(event) => setAspectRatio(event.target.value as AspectRatio)}
                      className={inputClass}
                    >
                      {ASPECT_RATIOS.map((ratio) => (
                        <option key={ratio} value={ratio}>
                          {ratio}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Negative prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(event) => setNegativePrompt(event.target.value)}
                    className={`${inputClass} min-h-[96px] resize-none`}
                  />
                </div>

                {imageError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {imageError}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleGenerateImage} disabled={isGeneratingImage} className={primaryButtonClass}>
                    {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate visual brief
                  </button>
                  <button
                    onClick={() =>
                      saveProject({
                        title: `Saved preview · ${truncate(imagePrompt || 'Untitled visual', 28)}`,
                        type: 'Image',
                        summary: `Preset ${visualPreset} dengan style ${artStyle} dan rasio ${aspectRatio}.`,
                        section: 'canvas',
                        accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
                      })
                    }
                    className={secondaryButtonClass}
                  >
                    Simpan ke canvas
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="overflow-hidden p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Preview board</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Visual moodboard</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyToClipboard('image-output', imageOutput)}
                    disabled={!imageOutput}
                    className={secondaryButtonClass}
                  >
                    {copiedKey === 'image-output' ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-lime-300" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={() => downloadTextFile('image-direction-brief.txt', imageOutput)}
                    disabled={!imageOutput}
                    className={secondaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="space-y-4">
                  <div className={`overflow-hidden rounded-[28px] border border-white/10 bg-black/25 ${ASPECT_RATIO_CLASSES[aspectRatio]}`}>
                    <img src={imagePreview} alt="Image preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Current preset</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                        {currentPreset.name}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{currentPreset.vibe}</p>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                    {imageOutput ||
                      'Visual brief akan muncul di sini bersama prompt utama, negative prompt, dan catatan produksi.'}
                  </pre>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'video' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Video Lab</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Susun storyboard cepat</h2>
                </div>
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Ide video</label>
                  <textarea
                    value={videoIdea}
                    onChange={(event) => setVideoIdea(event.target.value)}
                    placeholder="Contoh: teaser launch aplikasi invoice AI untuk UMKM dengan nuansa premium dan hook langsung pada rasa capek bikin invoice manual."
                    className={textareaClass}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Platform</label>
                    <input
                      value={videoPlatform}
                      onChange={(event) => setVideoPlatform(event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Durasi</label>
                    <select
                      value={videoDuration}
                      onChange={(event) => setVideoDuration(event.target.value as (typeof VIDEO_DURATIONS)[number])}
                      className={inputClass}
                    >
                      {VIDEO_DURATIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Motion</label>
                    <select
                      value={videoMotion}
                      onChange={(event) => setVideoMotion(event.target.value as (typeof VIDEO_MOTIONS)[number])}
                      className={inputClass}
                    >
                      {VIDEO_MOTIONS.map((motion) => (
                        <option key={motion} value={motion}>
                          {motion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {videoError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {videoError}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className={primaryButtonClass}>
                    {isGeneratingVideo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate storyboard
                  </button>
                  <button
                    onClick={() =>
                      saveProject({
                        title: `Storyboard · ${truncate(videoIdea || 'Untitled video', 28)}`,
                        type: 'Video',
                        summary: `${videoPlatform}, ${videoDuration}, motion ${videoMotion}.`,
                        section: 'canvas',
                        accent: 'from-lime-400/20 via-emerald-500/10 to-transparent',
                      })
                    }
                    className={secondaryButtonClass}
                  >
                    Simpan ke canvas
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="overflow-hidden p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Preview board</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Motion & beat sheet</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyToClipboard('video-output', videoOutput)}
                    disabled={!videoOutput}
                    className={secondaryButtonClass}
                  >
                    {copiedKey === 'video-output' ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-lime-300" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={() => downloadTextFile('video-storyboard.txt', videoOutput)}
                    disabled={!videoOutput}
                    className={secondaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/25 aspect-video">
                    <img src={videoPreview} alt="Video preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                    <p className="text-sm font-semibold text-white">Motion stack</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                      {[videoMotion, 'Fast hook', 'Benefit reveal', 'CTA resolve'].map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                    {videoOutput ||
                      'Storyboard, beat sheet, dan overlay text akan muncul di sini sesudah Anda menekan generate.'}
                  </pre>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'audio' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Audio Lab</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Voice-over & sound direction</h2>
                </div>
                <Clock className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Tema audio</label>
                  <textarea
                    value={audioIdea}
                    onChange={(event) => setAudioIdea(event.target.value)}
                    placeholder="Contoh: VO 30 detik untuk founder note yang menjelaskan kenapa tool ini menghemat jam kerja tim konten."
                    className={textareaClass}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Format</label>
                    <select
                      value={audioFormat}
                      onChange={(event) => setAudioFormat(event.target.value as (typeof AUDIO_FORMATS)[number])}
                      className={inputClass}
                    >
                      {AUDIO_FORMATS.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Vibe</label>
                    <input
                      value={audioVibe}
                      onChange={(event) => setAudioVibe(event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                {audioError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {audioError}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className={primaryButtonClass}>
                    {isGeneratingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate audio brief
                  </button>
                  <button
                    onClick={() =>
                      saveProject({
                        title: `Audio cue · ${truncate(audioIdea || 'Untitled audio', 28)}`,
                        type: 'Audio',
                        summary: `${audioFormat} dengan vibe ${audioVibe}.`,
                        section: 'canvas',
                        accent: 'from-amber-400/20 via-orange-500/10 to-transparent',
                      })
                    }
                    className={secondaryButtonClass}
                  >
                    Simpan ke canvas
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Output</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">VO script & sound bed</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyToClipboard('audio-output', audioOutput)}
                    disabled={!audioOutput}
                    className={secondaryButtonClass}
                  >
                    {copiedKey === 'audio-output' ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-lime-300" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={() => downloadTextFile('audio-script.txt', audioOutput)}
                    disabled={!audioOutput}
                    className={secondaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="mt-6 rounded-[26px] border border-white/10 bg-black/25 p-5">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                  {audioOutput || 'Voice script, sound bed, dan delivery notes akan tampil di sini.'}
                </pre>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'campaigns' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Campaign Studio</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">One brief, many assets</h2>
                </div>
                <Coins className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Produk / link / brief</label>
                  <textarea
                    value={campaignLink}
                    onChange={(event) => setCampaignLink(event.target.value)}
                    placeholder="Contoh: SaaS untuk invoice otomatis bagi UMKM yang ingin menagih lebih cepat tanpa admin ribet."
                    className={textareaClass}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Offer utama</label>
                    <input
                      value={campaignOffer}
                      onChange={(event) => setCampaignOffer(event.target.value)}
                      placeholder="Trial 14 hari, onboarding cepat, hasil langsung terasa"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Audience</label>
                    <input
                      value={campaignAudience}
                      onChange={(event) => setCampaignAudience(event.target.value)}
                      placeholder="Owner UMKM, seller online, growth marketer"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Goal</label>
                  <select
                    value={campaignGoal}
                    onChange={(event) => setCampaignGoal(event.target.value as (typeof CAMPAIGN_GOALS)[number])}
                    className={inputClass}
                  >
                    {CAMPAIGN_GOALS.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>
                {campaignError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {campaignError}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleGenerateCampaign} disabled={isGeneratingCampaign} className={primaryButtonClass}>
                    {isGeneratingCampaign ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate blueprint
                  </button>
                  <button onClick={() => setActiveView('copy')} className={secondaryButtonClass}>
                    Lanjut ke Copy Lab
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Blueprint</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Campaign architecture</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyToClipboard('campaign-output', campaignOutput)}
                    disabled={!campaignOutput}
                    className={secondaryButtonClass}
                  >
                    {copiedKey === 'campaign-output' ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-lime-300" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={() => downloadTextFile('campaign-blueprint.txt', campaignOutput)}
                    disabled={!campaignOutput}
                    className={secondaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-5 xl:grid-cols-[0.4fr_0.6fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Funnel stack</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      {['Awareness hook', 'Proof angle', 'Landing CTA', 'Retargeting follow-up'].map((step) => (
                        <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next action</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      Setelah blueprint jadi, dorong ke Copy Lab untuk headline dan ke Video Lab untuk beat-by-beat storyboard.
                    </p>
                  </div>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200">
                    {campaignOutput ||
                      'Campaign blueprint akan muncul di sini dengan angle utama, asset stack, dan CTA tree.'}
                  </pre>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'canvas' && (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4 lg:grid-cols-3">
              {workflowColumns.map((column) => (
                <GlassPanel key={column.title} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{column.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{column.detail}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                      {column.items.length}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {column.items.length > 0 ? (
                      column.items.map((item) => (
                        <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
                          <p className="mt-3 text-xs text-slate-500">{item.timestamp}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-500">
                        Belum ada item di kolom ini.
                      </div>
                    )}
                  </div>
                </GlassPanel>
              ))}
            </div>

            <div className="space-y-6">
              <GlassPanel className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workflow summary</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Board snapshot</h3>
                  </div>
                  <Palette className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="mt-5 space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-medium text-white">Total asset</p>
                    <p className="mt-2 text-slate-400">{savedItems.length} item siap diteruskan ke eksekusi.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-medium text-white">Mode kerja</p>
                    <p className="mt-2 text-slate-400">
                      {providerStatus === 'live'
                        ? `${activeProviderMeta.label} aktif untuk ideasi real-time.`
                        : providerStatus === 'setup'
                          ? `${activeProviderMeta.label} sudah dipilih, tinggal lengkapi setup live.`
                          : 'Demo flow aktif sebagai fallback lokal.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-medium text-white">Rekomendasi</p>
                    <p className="mt-2 text-slate-400">
                      Simpan blueprint campaign dulu, lalu pecah ke Image + Video untuk produksi cepat.
                    </p>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Export</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Handoff cepat</h3>
                  </div>
                  <Download className="h-5 w-5 text-lime-300" />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Ekspor hasil per modul sebagai file teks untuk diserahkan ke desainer, editor, atau tim media buying.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      downloadTextFile(
                        'canvas-summary.txt',
                        savedItems.map((item) => `${item.title}\n${item.summary}\n${item.timestamp}`).join('\n\n'),
                      )
                    }
                    className={primaryButtonClass}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export summary
                  </button>
                  <button onClick={() => setActiveView('campaigns')} className={secondaryButtonClass}>
                    Buka Campaign Studio
                  </button>
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {activeView === 'assistant' && (
          <GlassPanel className="overflow-hidden">
            <div className="flex flex-col gap-6 p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Copilot room</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Diskusi, revisi, arahkan next-step</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                  {liveAiEnabled ? 'Connected' : 'Fallback assistant'}
                </div>
              </div>

              <div className="h-[58vh] overflow-y-auto rounded-[26px] border border-white/10 bg-black/25 p-5">
                <div className="space-y-5">
                  {chatMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[85%] items-end gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${message.role === 'user' ? 'bg-white text-black' : 'border border-white/10 bg-white/[0.05] text-cyan-300'}`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-[24px] px-5 py-4 text-sm leading-7 ${message.role === 'user' ? 'bg-white text-black' : 'border border-white/10 bg-white/[0.05] text-slate-200'}`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-300">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 text-slate-200">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder="Tanya apa pun: revisi hook, pecah campaign, cari angle, atau minta struktur storyboard."
                  className={`${inputClass} flex-1`}
                />
                <button onClick={() => void handleSendMessage()} disabled={isChatting || !chatInput.trim()} className={primaryButtonClass}>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim
                </button>
              </div>
            </div>
          </GlassPanel>
        )}

        {activeView === 'apps' && (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Apps</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Micro tools & presets</h2>
                </div>
                <Database className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Preset Vault', description: 'Pilih preset orisinal untuk isi Image dan Video Lab.', view: 'image' as StudioView },
                  { title: 'Campaign Jumpstart', description: 'Lompat ke studio campaign dengan brief kasar.', view: 'campaigns' as StudioView },
                  { title: 'Storyboard Builder', description: 'Masuk ke Video Lab dengan struktur motion-first.', view: 'video' as StudioView },
                  { title: 'Copilot Assist', description: 'Diskusi cepat untuk revisi dan ide konten.', view: 'assistant' as StudioView },
                ].map((tool) => (
                  <button
                    key={tool.title}
                    onClick={() => setActiveView(tool.view)}
                    className="rounded-[24px] border border-white/10 bg-black/25 p-5 text-left transition hover:border-cyan-400/20 hover:bg-black/40"
                  >
                    <p className="text-lg font-semibold text-white">{tool.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                      Open
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Preset vault</p>
                  <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="mt-4 space-y-3">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="font-medium text-white">{preset.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{preset.description}</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                    </button>
                  ))}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Virality predictor</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Skor hook secara instan</h2>
                </div>
                <BarChart3 className="h-5 w-5 text-lime-300" />
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Hook</label>
                    <textarea
                      value={viralityHook}
                      onChange={(event) => setViralityHook(event.target.value)}
                      placeholder="Contoh: Stop bikin konten cantik kalau tidak ada yang berhenti scroll."
                      className={`${inputClass} min-h-[96px] resize-none`}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Caption</label>
                    <textarea
                      value={viralityCaption}
                      onChange={(event) => setViralityCaption(event.target.value)}
                      placeholder="Tuliskan caption pendek yang akan mendampingi video atau visual utama."
                      className={`${inputClass} min-h-[140px] resize-none`}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">CTA</label>
                    <input
                      value={viralityCta}
                      onChange={(event) => setViralityCta(event.target.value)}
                      placeholder="Contoh: Simpan dulu, tes 2 hook ini malam ini."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-white/10 bg-black/25 p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Score</p>
                    <div className="mt-4 flex items-end gap-4">
                      <p className="text-5xl font-semibold text-white">{viralityReport.score}</p>
                      <p className="mb-1 text-sm text-lime-300">{viralityReport.label}</p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-lime-300"
                        style={{ width: `${viralityReport.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-black/25 p-6">
                    <p className="text-sm font-semibold text-white">Checklist</p>
                    <div className="mt-4 space-y-3">
                      {viralityReport.notes.map((note) => (
                        <div key={note} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Settings</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Runtime & provider matrix</h2>
                </div>
                <Settings className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-3 block text-sm text-slate-300">Pilih provider</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PROVIDER_IDS.map((providerId) => {
                      const meta = PROVIDER_META[providerId];
                      const isActive = providerId === selectedProvider;
                      const envFallback = providerId === 'demo' ? '' : getEnvApiKey(providerId);
                      const hasInlineKey = providerConfigs[providerId].apiKey.trim().length > 0;
                      const providerIsReady =
                        providerId === 'demo'
                          ? false
                          : providerId === 'compatible'
                            ? Boolean(
                                (providerConfigs[providerId].apiKey.trim() || envFallback) &&
                                  normalizeBaseUrl(providerConfigs[providerId].baseUrl),
                              )
                            : Boolean(providerConfigs[providerId].apiKey.trim() || envFallback);

                      return (
                        <button
                          key={providerId}
                          onClick={() => setSelectedProvider(providerId)}
                          className={`rounded-[24px] border p-4 text-left transition ${
                            isActive
                              ? 'border-cyan-300/30 bg-white text-black'
                              : 'border-white/10 bg-black/25 text-white hover:border-white/20 hover:bg-black/35'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{meta.label}</p>
                              <p
                                className={`mt-1 text-xs uppercase tracking-[0.22em] ${
                                  isActive ? 'text-black/60' : 'text-slate-500'
                                }`}
                              >
                                {meta.badge}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                providerId === 'demo'
                                  ? 'bg-black/10 text-black'
                                  : providerIsReady
                                    ? isActive
                                      ? 'bg-black/10 text-black'
                                      : 'bg-emerald-400/20 text-emerald-200'
                                    : isActive
                                      ? 'bg-black/10 text-black'
                                      : 'bg-amber-400/20 text-amber-200'
                              }`}
                            >
                              {providerId === 'demo'
                                ? 'Offline'
                                : providerIsReady
                                  ? hasInlineKey
                                    ? 'Saved'
                                    : 'Env'
                                  : 'Setup'}
                            </span>
                          </div>
                          <p className={`mt-3 text-sm leading-6 ${isActive ? 'text-black/75' : 'text-slate-400'}`}>
                            {meta.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-[26px] border border-white/10 bg-gradient-to-r ${activeProviderMeta.accent} p-[1px]`}>
                  <div className="rounded-[25px] bg-[#0b0d12]/95 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{activeProviderMeta.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{activeProviderMeta.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                          providerStatus === 'live'
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : providerStatus === 'setup'
                              ? 'bg-amber-400/20 text-amber-200'
                              : 'bg-slate-400/20 text-slate-200'
                        }`}
                      >
                        {providerStatus === 'live'
                          ? 'Live ready'
                          : providerStatus === 'setup'
                            ? 'Need setup'
                            : 'Demo local'}
                      </span>
                    </div>

                    {selectedProvider !== 'demo' && (
                      <div className="mt-5 grid gap-4">
                        <div>
                          <label className="mb-2 block text-sm text-slate-300">Model</label>
                          <input
                            value={providerConfigs[selectedProvider].model}
                            onChange={(event) =>
                              updateProviderConfig(selectedProvider, { model: event.target.value })
                            }
                            placeholder={activeProviderMeta.defaultModel}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm text-slate-300">
                            {activeProviderMeta.label} API key
                          </label>
                          <input
                            type="password"
                            value={providerConfigs[selectedProvider].apiKey}
                            onChange={(event) =>
                              updateProviderConfig(selectedProvider, { apiKey: event.target.value })
                            }
                            placeholder={
                              selectedProvider === 'openrouter'
                                ? 'or-...'
                                : selectedProvider === 'openai'
                                  ? 'sk-...'
                                  : selectedProvider === 'anthropic'
                                    ? 'sk-ant-...'
                                    : selectedProvider === 'gemini'
                                      ? 'AIza...'
                                      : 'provider-key'
                            }
                            className={inputClass}
                          />
                          <p className="mt-2 text-xs leading-6 text-slate-500">
                            Bisa pakai input manual atau env fallback{' '}
                            <span className="text-slate-300">{activeProviderMeta.envKey}</span>.
                          </p>
                        </div>

                        {activeProviderMeta.supportsBaseUrl && (
                          <div>
                            <label className="mb-2 block text-sm text-slate-300">Base URL</label>
                            <input
                              value={providerConfigs[selectedProvider].baseUrl}
                              onChange={(event) =>
                                updateProviderConfig(selectedProvider, { baseUrl: event.target.value })
                              }
                              placeholder="https://api.groq.com/openai/v1"
                              className={inputClass}
                            />
                            <p className="mt-2 text-xs leading-6 text-slate-500">
                              Gunakan base URL model yang kompatibel dengan endpoint{' '}
                              <span className="text-slate-300">/chat/completions</span>.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedProvider === 'demo' && (
                      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300">
                        Mode demo menjaga seluruh flow tetap bisa dipakai untuk presentasi, prototyping,
                        dan pengujian UI ketika kredensial live belum siap.
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-sm text-slate-300">Rekomendasi model cepat</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeProviderMeta.recommendedModels.map((modelOption) => (
                          <button
                            key={modelOption}
                            onClick={() => updateProviderConfig(selectedProvider, { model: modelOption })}
                            className={`rounded-full px-3 py-2 text-xs transition ${
                              resolvedModel === modelOption
                                ? 'bg-white text-black'
                                : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                            }`}
                          >
                            {modelOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {settingsNotice && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {settingsNotice}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSaveSettings} className={primaryButtonClass}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan settings
                  </button>
                  <button
                    onClick={() => {
                      const defaults = createDefaultProviderConfigs();
                      updateProviderConfig(selectedProvider, defaults[selectedProvider]);
                    }}
                    className={secondaryButtonClass}
                  >
                    Reset provider aktif
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">System notes</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Polish, mobile, dan readiness</h2>
                </div>
                <Sparkles className="h-5 w-5 text-lime-300" />
              </div>

              <div className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/25">
                  <img
                    src={HERO_ART_SECONDARY}
                    alt="Mobile studio visual"
                    className="h-56 w-full object-cover"
                  />
                </div>

                <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                  {[
                    'UI kini lebih siap mobile: padding diperhalus, panel lebih adaptif, dan area bawah disiapkan untuk navigasi cepat.',
                    'Animasi dibuat tipis-tipis dan ringan: hover lift, drift glow, serta entry motion yang tetap ramah performa.',
                    'Provider tidak lagi tunggal; studio kini mendukung OpenRouter, OpenAI, Anthropic, Gemini, dan OpenAI-compatible custom endpoint.',
                    'Fallback lokal tetap dipertahankan agar seluruh demo dan presentasi tetap hidup meski API key belum dimasukkan.',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 leading-7">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Status provider aktif</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {activeProviderMeta.label} · {resolvedModel}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                        providerStatus === 'live'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : providerStatus === 'setup'
                            ? 'bg-amber-400/20 text-amber-200'
                            : 'bg-slate-400/20 text-slate-200'
                      }`}
                    >
                      {providerStatus === 'live'
                        ? 'ready'
                        : providerStatus === 'setup'
                          ? 'setup'
                          : 'demo'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Env fallback: <span className="text-white">{activeProviderMeta.envKey ?? 'Tidak diperlukan'}</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Base URL: <span className="text-white">{activeProviderMeta.supportsBaseUrl ? resolvedBaseUrl || 'Belum diisi' : activeProviderMeta.baseUrl}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}
      </main>

      <div className="ui-mobile-dock fixed inset-x-4 bottom-4 z-40 xl:hidden">
        <div className="flex items-center gap-2 overflow-x-auto rounded-[24px] border border-white/10 bg-[#0b0d12]/88 px-3 py-3 backdrop-blur-2xl">
          {MOBILE_DOCK_ITEMS.map((viewId) => {
            const navItem = NAV_ITEMS.find((item) => item.id === viewId);

            if (!navItem) {
              return null;
            }

            const Icon = navItem.icon;
            const isActive = navItem.id === activeView;

            return (
              <button
                key={navItem.id}
                onClick={() => setActiveView(navItem.id)}
                className={`flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{navItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
