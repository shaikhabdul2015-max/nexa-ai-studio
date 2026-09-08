import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Sliders,
  ArrowRight,
} from "lucide-react";
import { generateHighResImage } from "../../services/api";

interface GeneratedImageItem {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: string;
  imageSize: "1K" | "2K" | "4K";
  style: string;
  model: string;
  createdAt: string;
}

const PRESET_STYLES = [
  "Photorealistic",
  "Digital Art",
  "Minimalist Modern",
  "Cyberpunk Futuristic",
  "Cinematic 3D",
  "Architectural Concept",
];

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const IMAGE_SIZES: Array<"1K" | "2K" | "4K"> = ["1K", "2K", "4K"];

export const ImageStudioView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [prompt, setPrompt] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedSize, setSelectedSize] = useState<"1K" | "2K" | "4K">("1K");
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImageItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Gallery
  const [gallery, setGallery] = useState<GeneratedImageItem[]>(() => {
    const saved = localStorage.getItem("nexa_image_gallery");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return [
      {
        id: "img-init-1",
        prompt: "Futuristic sustainable metropolis with bio-luminescent vertical gardens and flying magnetic transport, golden hour lighting",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        aspectRatio: "16:9",
        imageSize: "2K",
        style: "Photorealistic",
        model: "gemini-3-pro-image-preview",
        createdAt: new Date().toISOString(),
      },
      {
        id: "img-init-2",
        prompt: "Minimalist ceramic quantum sculpture on dark stone pedestal, soft architectural studio lighting, octane render",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        aspectRatio: "1:1",
        imageSize: "1K",
        style: "Minimalist Modern",
        model: "gemini-3-pro-image-preview",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("nexa_image_gallery", JSON.stringify(gallery));
  }, [gallery]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const data = await generateHighResImage(
        prompt,
        selectedRatio,
        selectedSize,
        selectedStyle
      );

      const newImage: GeneratedImageItem = {
        id: "img-" + Date.now(),
        prompt,
        url: data.imageUrl,
        aspectRatio: selectedRatio,
        imageSize: selectedSize,
        style: selectedStyle,
        model: data.model || "gemini-3-pro-image-preview",
        createdAt: new Date().toISOString(),
      };

      setCurrentImage(newImage);
      setGallery((prev) => [newImage, ...prev]);
      trackUsage("image", 1200);
      addNotification("Image Generated", `Rendered at ${selectedSize} resolution`, "success");
    } catch (err: any) {
      addNotification("Generation Failed", err.message || "Failed to generate image.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (img: GeneratedImageItem) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `nexa_image_${img.imageSize}_${Date.now()}.png`;
    a.click();
  };

  const displayImage = currentImage || gallery[0];

  return (
    <div id="image-studio-view-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Gemini 3 Pro Image Generation (1K / 2K / 4K)</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t.image.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {t.image.subtitle}
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Prompt */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="image-prompt-textarea"
                className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                Creative Image Prompt
              </label>
              <textarea
                id="image-prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={t.image.promptPlaceholder}
                className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* MANDATORY AFFORDANCE: Image Size (1K, 2K, 4K) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Resolution Size (imageSize)
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                  gemini-3-pro-image-preview
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      id={`image-size-btn-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-colors border ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-2xs"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ratio) => {
                  const isSelected = selectedRatio === ratio;
                  return (
                    <button
                      key={ratio}
                      id={`aspect-ratio-btn-${ratio}`}
                      onClick={() => setSelectedRatio(ratio)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors border ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      {ratio}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Artistic Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STYLES.map((style) => {
                  const isSelected = selectedStyle === style;
                  return (
                    <button
                      key={style}
                      id={`style-btn-${style.replace(/\s+/g, "-")}`}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-2 rounded-xl text-xs font-medium text-left truncate transition-colors border ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              id="generate-image-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing High-Res Pixels ({selectedSize})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image ({selectedSize})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Active Preview & High-Res View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col items-center justify-center min-h-[480px]">
            {isLoading ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full border-3 border-neutral-900 dark:border-white border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  Invoking gemini-3-pro-image-preview with {selectedSize} density...
                </p>
              </div>
            ) : displayImage ? (
              <div className="w-full space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 group max-h-[500px] flex items-center justify-center">
                  <img
                    src={displayImage.url}
                    alt={displayImage.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain max-h-[480px]"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-xl text-white">
                    <button
                      onClick={() => handleDownload(displayImage)}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyPrompt(displayImage.prompt)}
                      className="p-1.5 hover:bg-white/20 rounded-lg"
                      title="Copy prompt"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 text-xs">
                  <div>
                    <p className="text-neutral-900 dark:text-white font-medium line-clamp-2">
                      {displayImage.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 font-mono">
                      <span>Size: {displayImage.imageSize}</span>
                      <span>·</span>
                      <span>Ratio: {displayImage.aspectRatio}</span>
                      <span>·</span>
                      <span>Style: {displayImage.style}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-2 text-neutral-400 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                <p>Enter a prompt and hit Generate to produce visuals with Gemini Pro.</p>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {gallery.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Recent Studio Creations ({gallery.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentImage(item)}
                    className={`relative rounded-xl overflow-hidden aspect-square border cursor-pointer group transition-all ${
                      displayImage?.id === item.id
                        ? "border-neutral-900 dark:border-white ring-2 ring-neutral-400"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 rounded bg-black/70 text-white">
                      {item.imageSize}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
