import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  Palette,
  PenTool,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from 'lucide-react';

import { GlassPanel, SectionEyebrow, StatCard } from './components/studio-ui';
import {
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
  type AspectRatio,
  type ChatMessage,
  type ContentType,
  type OpenRouterMessage,
  type PersistedState,
  type Preset,
  type ProviderConfigMap,
  type ProviderId,
  type ProviderRuntimeConfig,
  requestProviderText,
  type SavedItem,
  type StudioView,
  type WorkspaceDrafts,
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
  normalizeBaseUrl,
  nowStamp,
  toErrorMessage,
  truncate,
} from './lib/studio';

function App() {
  const persistedState = useMemo(() => getInitialPersistedState(), []);
  const persistedDrafts: WorkspaceDrafts = persistedState?.workspaceDrafts ?? {};
  const [activeView, setActiveView] = useState<StudioView>(persistedState?.activeView ?? 'explore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<ContentType>(
    CONTENT_TYPES.includes(persistedDrafts.selectedType as ContentType)
      ? (persistedDrafts.selectedType as ContentType)
      : 'Caption Instagram',
  );
  const [copyTone, setCopyTone] = useState<(typeof COPY_TONES)[number]>(
    COPY_TONES.includes(persistedDrafts.copyTone as (typeof COPY_TONES)[number])
      ? (persistedDrafts.copyTone as (typeof COPY_TONES)[number])
      : 'Tajam & meyakinkan',
  );
  const [promptInput, setPromptInput] = useState(persistedDrafts.promptInput ?? '');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(persistedDrafts.generatedCopy ?? '');
  const [copyError, setCopyError] = useState('');

  const [imagePrompt, setImagePrompt] = useState(persistedDrafts.imagePrompt ?? '');
  const [negativePrompt, setNegativePrompt] = useState(
    persistedDrafts.negativePrompt ?? 'blur, noisy texture, weak contrast, cluttered frame',
  );
  const [artStyle, setArtStyle] = useState<(typeof ART_STYLES)[number]>(
    ART_STYLES.includes(persistedDrafts.artStyle as (typeof ART_STYLES)[number])
      ? (persistedDrafts.artStyle as (typeof ART_STYLES)[number])
      : 'Cinematic',
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    ASPECT_RATIOS.includes(persistedDrafts.aspectRatio as AspectRatio)
      ? (persistedDrafts.aspectRatio as AspectRatio)
      : '16:9',
  );
  const [visualPreset, setVisualPreset] = useState<string>(
    PRESETS.some((preset) => preset.name === persistedDrafts.visualPreset)
      ? (persistedDrafts.visualPreset as string)
      : PRESETS[0].name,
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageOutput, setImageOutput] = useState(persistedDrafts.imageOutput ?? '');
  const [imageError, setImageError] = useState('');

  const [videoIdea, setVideoIdea] = useState(persistedDrafts.videoIdea ?? '');
  const [videoMotion, setVideoMotion] = useState<(typeof VIDEO_MOTIONS)[number]>(
    VIDEO_MOTIONS.includes(persistedDrafts.videoMotion as (typeof VIDEO_MOTIONS)[number])
      ? (persistedDrafts.videoMotion as (typeof VIDEO_MOTIONS)[number])
      : 'Slow dolly in',
  );
  const [videoDuration, setVideoDuration] = useState<(typeof VIDEO_DURATIONS)[number]>(
    VIDEO_DURATIONS.includes(persistedDrafts.videoDuration as (typeof VIDEO_DURATIONS)[number])
      ? (persistedDrafts.videoDuration as (typeof VIDEO_DURATIONS)[number])
      : '30 detik',
  );
  const [videoPlatform, setVideoPlatform] = useState(persistedDrafts.videoPlatform ?? 'Instagram Reels');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoOutput, setVideoOutput] = useState(persistedDrafts.videoOutput ?? '');
  const [videoError, setVideoError] = useState('');

  const [audioIdea, setAudioIdea] = useState(persistedDrafts.audioIdea ?? '');
  const [audioVibe, setAudioVibe] = useState(persistedDrafts.audioVibe ?? 'Cinematic pulse');
  const [audioFormat, setAudioFormat] = useState<(typeof AUDIO_FORMATS)[number]>(
    AUDIO_FORMATS.includes(persistedDrafts.audioFormat as (typeof AUDIO_FORMATS)[number])
      ? (persistedDrafts.audioFormat as (typeof AUDIO_FORMATS)[number])
      : 'Voice-over Ad',
  );
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioOutput, setAudioOutput] = useState(persistedDrafts.audioOutput ?? '');
  const [audioError, setAudioError] = useState('');

  const [campaignLink, setCampaignLink] = useState(persistedDrafts.campaignLink ?? '');
  const [campaignOffer, setCampaignOffer] = useState(persistedDrafts.campaignOffer ?? '');
  const [campaignAudience, setCampaignAudience] = useState(persistedDrafts.campaignAudience ?? '');
  const [campaignGoal, setCampaignGoal] = useState<(typeof CAMPAIGN_GOALS)[number]>(
    CAMPAIGN_GOALS.includes(persistedDrafts.campaignGoal as (typeof CAMPAIGN_GOALS)[number])
      ? (persistedDrafts.campaignGoal as (typeof CAMPAIGN_GOALS)[number])
      : 'Konversi',
  );
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [campaignOutput, setCampaignOutput] = useState(persistedDrafts.campaignOutput ?? '');
  const [campaignError, setCampaignError] = useState('');

  const [viralityHook, setViralityHook] = useState(persistedDrafts.viralityHook ?? '');
  const [viralityCaption, setViralityCaption] = useState(persistedDrafts.viralityCaption ?? '');
  const [viralityCta, setViralityCta] = useState(persistedDrafts.viralityCta ?? '');

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
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [providerTestNote, setProviderTestNote] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

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
      activeView,
      selectedProvider,
      providerConfigs,
      savedItems,
      chatMessages,
      workspaceDrafts: {
        selectedType,
        copyTone,
        promptInput,
        generatedCopy,
        imagePrompt,
        negativePrompt,
        artStyle,
        aspectRatio,
        visualPreset,
        imageOutput,
        videoIdea,
        videoMotion,
        videoDuration,
        videoPlatform,
        videoOutput,
        audioIdea,
        audioVibe,
        audioFormat,
        audioOutput,
        campaignLink,
        campaignOffer,
        campaignAudience,
        campaignGoal,
        campaignOutput,
        viralityHook,
        viralityCaption,
        viralityCta,
      },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    activeView,
    selectedProvider,
    providerConfigs,
    savedItems,
    chatMessages,
    selectedType,
    copyTone,
    promptInput,
    generatedCopy,
    imagePrompt,
    negativePrompt,
    artStyle,
    aspectRatio,
    visualPreset,
    imageOutput,
    videoIdea,
    videoMotion,
    videoDuration,
    videoPlatform,
    videoOutput,
    audioIdea,
    audioVibe,
    audioFormat,
    audioOutput,
    campaignLink,
    campaignOffer,
    campaignAudience,
    campaignGoal,
    campaignOutput,
    viralityHook,
    viralityCaption,
    viralityCta,
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatting]);

  useEffect(() => {
    setShowApiKey(false);
    setProviderTestNote('');
  }, [selectedProvider]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isMobileMenuOpen]);

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

  const handleExportWorkspace = () => {
    const payload: PersistedState = {
      activeView,
      selectedProvider,
      providerConfigs,
      savedItems,
      chatMessages,
      workspaceDrafts: {
        selectedType,
        copyTone,
        promptInput,
        generatedCopy,
        imagePrompt,
        negativePrompt,
        artStyle,
        aspectRatio,
        visualPreset,
        imageOutput,
        videoIdea,
        videoMotion,
        videoDuration,
        videoPlatform,
        videoOutput,
        audioIdea,
        audioVibe,
        audioFormat,
        audioOutput,
        campaignLink,
        campaignOffer,
        campaignAudience,
        campaignGoal,
        campaignOutput,
        viralityHook,
        viralityCaption,
        viralityCta,
      },
    };

    downloadTextFile(
      `kontenkilat-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
    );
    setSettingsNotice('Workspace berhasil diekspor ke file JSON lokal.');
    window.setTimeout(() => setSettingsNotice(''), 2200);
  };

  const handleImportWorkspace = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const importedDrafts = parsed.workspaceDrafts ?? {};

      if (parsed.selectedProvider && PROVIDER_IDS.includes(parsed.selectedProvider as ProviderId)) {
        setSelectedProvider(parsed.selectedProvider as ProviderId);
      }

      if (parsed.providerConfigs) {
        setProviderConfigs(createDefaultProviderConfigs());
        setProviderConfigs((previous) => ({
          ...previous,
          ...parsed.providerConfigs,
        }));
      }

      if (Array.isArray(parsed.savedItems) && parsed.savedItems.length) {
        setSavedItems(parsed.savedItems as SavedItem[]);
      }

      if (Array.isArray(parsed.chatMessages) && parsed.chatMessages.length) {
        setChatMessages(parsed.chatMessages as ChatMessage[]);
      }

      if (typeof parsed.activeView === 'string' && NAV_ITEMS.some((item) => item.id === parsed.activeView)) {
        setActiveView(parsed.activeView as StudioView);
      }

      if (CONTENT_TYPES.includes(importedDrafts.selectedType as ContentType)) {
        setSelectedType(importedDrafts.selectedType as ContentType);
      }
      if (COPY_TONES.includes(importedDrafts.copyTone as (typeof COPY_TONES)[number])) {
        setCopyTone(importedDrafts.copyTone as (typeof COPY_TONES)[number]);
      }
      if (typeof importedDrafts.promptInput === 'string') setPromptInput(importedDrafts.promptInput);
      if (typeof importedDrafts.generatedCopy === 'string') setGeneratedCopy(importedDrafts.generatedCopy);
      if (typeof importedDrafts.imagePrompt === 'string') setImagePrompt(importedDrafts.imagePrompt);
      if (typeof importedDrafts.negativePrompt === 'string') setNegativePrompt(importedDrafts.negativePrompt);
      if (ART_STYLES.includes(importedDrafts.artStyle as (typeof ART_STYLES)[number])) {
        setArtStyle(importedDrafts.artStyle as (typeof ART_STYLES)[number]);
      }
      if (ASPECT_RATIOS.includes(importedDrafts.aspectRatio as AspectRatio)) {
        setAspectRatio(importedDrafts.aspectRatio as AspectRatio);
      }
      if (typeof importedDrafts.visualPreset === 'string') setVisualPreset(importedDrafts.visualPreset);
      if (typeof importedDrafts.imageOutput === 'string') setImageOutput(importedDrafts.imageOutput);
      if (typeof importedDrafts.videoIdea === 'string') setVideoIdea(importedDrafts.videoIdea);
      if (VIDEO_MOTIONS.includes(importedDrafts.videoMotion as (typeof VIDEO_MOTIONS)[number])) {
        setVideoMotion(importedDrafts.videoMotion as (typeof VIDEO_MOTIONS)[number]);
      }
      if (VIDEO_DURATIONS.includes(importedDrafts.videoDuration as (typeof VIDEO_DURATIONS)[number])) {
        setVideoDuration(importedDrafts.videoDuration as (typeof VIDEO_DURATIONS)[number]);
      }
      if (typeof importedDrafts.videoPlatform === 'string') setVideoPlatform(importedDrafts.videoPlatform);
      if (typeof importedDrafts.videoOutput === 'string') setVideoOutput(importedDrafts.videoOutput);
      if (typeof importedDrafts.audioIdea === 'string') setAudioIdea(importedDrafts.audioIdea);
      if (typeof importedDrafts.audioVibe === 'string') setAudioVibe(importedDrafts.audioVibe);
      if (AUDIO_FORMATS.includes(importedDrafts.audioFormat as (typeof AUDIO_FORMATS)[number])) {
        setAudioFormat(importedDrafts.audioFormat as (typeof AUDIO_FORMATS)[number]);
      }
      if (typeof importedDrafts.audioOutput === 'string') setAudioOutput(importedDrafts.audioOutput);
      if (typeof importedDrafts.campaignLink === 'string') setCampaignLink(importedDrafts.campaignLink);
      if (typeof importedDrafts.campaignOffer === 'string') setCampaignOffer(importedDrafts.campaignOffer);
      if (typeof importedDrafts.campaignAudience === 'string') setCampaignAudience(importedDrafts.campaignAudience);
      if (CAMPAIGN_GOALS.includes(importedDrafts.campaignGoal as (typeof CAMPAIGN_GOALS)[number])) {
        setCampaignGoal(importedDrafts.campaignGoal as (typeof CAMPAIGN_GOALS)[number]);
      }
      if (typeof importedDrafts.campaignOutput === 'string') setCampaignOutput(importedDrafts.campaignOutput);
      if (typeof importedDrafts.viralityHook === 'string') setViralityHook(importedDrafts.viralityHook);
      if (typeof importedDrafts.viralityCaption === 'string') setViralityCaption(importedDrafts.viralityCaption);
      if (typeof importedDrafts.viralityCta === 'string') setViralityCta(importedDrafts.viralityCta);

      setSettingsNotice('Workspace berhasil diimpor. Draft, output, dan pengaturan dipulihkan.');
      window.setTimeout(() => setSettingsNotice(''), 2400);
    } catch {
      setSettingsNotice('File workspace tidak valid atau formatnya rusak.');
      window.setTimeout(() => setSettingsNotice(''), 2400);
    } finally {
      event.target.value = '';
    }
  };

  const handleTestProvider = async () => {
    if (selectedProvider === 'demo') {
      setProviderTestNote('Demo mode tidak menghubungi provider live, tetapi seluruh flow UI tetap aktif.');
      return;
    }

    setIsTestingProvider(true);
    setProviderTestNote('');

    try {
      const result = await requestProviderText({
        providerId: selectedProvider,
        config: runtimeProviderConfig,
        messages: [
          {
            role: 'system',
            content:
              'Balas singkat dalam bahasa Indonesia. Jika koneksi berhasil, katakan provider siap dipakai untuk studio konten.',
          },
          {
            role: 'user',
            content: 'Tes koneksi singkat. Cukup balas satu kalimat.',
          },
        ],
      });

      setProviderTestNote(`Tes sukses: ${truncate(result.replace(/\s+/g, ' ').trim(), 120)}`);
    } catch (error) {
      setProviderTestNote(`Tes gagal: ${toErrorMessage(error)}`);
    } finally {
      setIsTestingProvider(false);
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
      setCopyError('Isi brief atau topik terlebih dahulu.');
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
      setImageError('Tulis deskripsi visual terlebih dahulu.');
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
      setVideoError('Isi ide video atau momentum campaign terlebih dahulu.');
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
      setAudioError('Masukkan topik atau konteks audio terlebih dahulu.');
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
      setCampaignError('Masukkan nama produk, link, atau brief campaign terlebih dahulu.');
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
      <a
        href="#studio-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Lewati ke konten utama
      </a>
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
        <div className="mx-auto flex max-w-[1580px] items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_12px_30px_rgba(76,201,240,0.14)]">
              <img src={BRAND_LOGO_MARK} alt="KontenKilat AI logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">KontenKilat AI</p>
              <p className="max-w-[200px] text-xs leading-5 text-slate-400 sm:max-w-none">
                Studio konten cepat untuk naskah, visual, video, dan audio
              </p>
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
                  aria-current={isActive ? 'page' : undefined}
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
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-studio-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <aside
          id="mobile-studio-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Studio menu mobile"
          className="fixed inset-y-0 right-0 z-50 w-[84vw] max-w-sm overflow-y-auto border-l border-white/10 bg-[#0b0d12] p-5 shadow-2xl xl:hidden"
        >
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
                  aria-current={activeView === item.id ? 'page' : undefined}
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

      <main
        id="studio-main"
        className="relative z-10 mx-auto max-w-[1580px] px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:py-6 sm:pb-28 md:px-8 md:py-8 md:pb-10"
      >
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3 sm:space-y-4">
            <SectionEyebrow>{activeViewMeta.title}</SectionEyebrow>
            <div>
              <h1 className="text-[2.2rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.75rem] md:text-5xl">
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
                    className="ui-sheen group relative min-h-[270px] overflow-hidden rounded-[24px] border border-white/10 bg-black/30 text-left sm:min-h-[340px] sm:rounded-[28px]"
                  >
                    <img
                      src={HERO_ART_PRIMARY}
                      alt="Campaign Engine preview"
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/35 to-black/70" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_28%)]" />
                    <div className="relative flex h-full flex-col justify-between p-5 sm:p-6 md:p-8">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[11px] sm:tracking-[0.28em]">
                          Creative OS
                        </span>
                        <span className="rounded-full bg-lime-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-black sm:text-[11px] sm:tracking-[0.28em]">
                          New
                        </span>
                      </div>
                      <div className="max-w-xl">
                        <h2 className="text-[2rem] font-semibold leading-[1.02] text-white sm:text-3xl md:text-5xl">Campaign Engine</h2>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200 sm:mt-4 sm:leading-7 md:text-base">
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
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stack provider</p>
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
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lab naskah</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Buat copy yang siap dipakai</h2>
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
                    Buat copy
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
                    Buat brief visual
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
                    Buat storyboard
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
                    Buat brief audio
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
                    Buat blueprint
                  </button>
                  <button onClick={() => setActiveView('copy')} className={secondaryButtonClass}>
                    Lanjut ke Lab Naskah
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
                      Setelah blueprint jadi, dorong ke Lab Naskah untuk headline dan ke Lab Video untuk beat-by-beat storyboard.
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

              <div className="h-[50dvh] overflow-y-auto rounded-[24px] border border-white/10 bg-black/25 p-4 sm:h-[58vh] sm:rounded-[26px] sm:p-5">
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
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Utilitas</p>
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
                  <h2 className="mt-2 text-2xl font-semibold text-white">Provider & koneksi studio</h2>
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
                          aria-pressed={isActive}
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
                          ? 'Siap live'
                          : providerStatus === 'setup'
                            ? 'Perlu setup'
                            : 'Demo lokal'}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeProviderMeta.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300"
                        >
                          {capability}
                        </span>
                      ))}
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
                          <div className="flex gap-2">
                            <input
                              type={showApiKey ? 'text' : 'password'}
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
                            <button
                              type="button"
                              onClick={() => setShowApiKey((value) => !value)}
                              className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                              aria-pressed={showApiKey}
                            >
                              {showApiKey ? 'Sembunyikan' : 'Lihat'}
                            </button>
                          </div>
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
                {providerTestNote && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                    {providerTestNote}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSaveSettings} className={primaryButtonClass}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Simpan settings
                  </button>
                  <button onClick={handleTestProvider} className={secondaryButtonClass} disabled={isTestingProvider}>
                    {isTestingProvider ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menguji koneksi
                      </>
                    ) : (
                      'Tes provider aktif'
                    )}
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
                  <button onClick={handleExportWorkspace} className={secondaryButtonClass}>
                    Export workspace
                  </button>
                  <button
                    onClick={() => importFileRef.current?.click()}
                    className={secondaryButtonClass}
                  >
                    Import workspace
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImportWorkspace}
                  />
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

      <div className="ui-mobile-dock fixed inset-x-2 bottom-[calc(0.625rem+env(safe-area-inset-bottom))] z-40 xl:hidden sm:inset-x-3 sm:bottom-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-6 gap-1 rounded-[20px] border border-white/10 bg-[#0b0d12]/88 px-2 py-2 backdrop-blur-2xl sm:rounded-[22px] sm:px-2.5 sm:py-2.5">
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
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[18px] px-1.5 py-1.5 text-[10px] leading-none transition sm:gap-1 sm:rounded-2xl sm:px-2 sm:py-2 sm:text-[11px] ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon className="h-[15px] w-[15px] sm:h-4 sm:w-4" />
                <span className="max-w-full truncate text-center tracking-[-0.01em]">{navItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
