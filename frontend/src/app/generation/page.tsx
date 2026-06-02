"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  Image as ImageIcon,
  Download,
  Loader2,
  History,
  Trash2,
  AlertCircle,
  Maximize2,
  X
} from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  modelId: string;
  createdAt: string;
}

export default function GenerationPage() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState("gemini-3.1-flash-image-preview");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [error, setError] = useState("");
  
  // Gallery and History
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Load API key and history from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("maff_leonardo_key") || "";
    setApiKey(savedKey);

    const savedHistory = localStorage.getItem("maff_generation_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse generation history", e);
      }
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem("maff_leonardo_key", value);
  };

  // Map aspect ratio to width and height
  const getDimensions = () => {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1024, height: 576 };
      case "4:3":
        return { width: 1024, height: 768 };
      case "1:1":
      default:
        return { width: 1024, height: 1024 };
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Пожалуйста, введите описание (промпт) для генерации.");
      return;
    }
    if (!apiKey.trim()) {
      setError("Пожалуйста, введите ваш API-ключ Leonardo.ai.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setCurrentImages([]);
    setGenerationStatus("Отправка запроса в Leonardo.ai...");

    try {
      const { width, height } = getDimensions();
      
      const response = await fetch("/api/generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelId,
          width,
          height,
          num_images: numImages,
          apiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Ошибка сервера (${response.status})`);
      }

      const data = await response.json();
      const generationId = data.sdGenerationJob?.generationId;

      if (!generationId) {
        throw new Error("Не удалось получить Generation ID из ответа API.");
      }

      // Start polling
      pollGeneration(generationId);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла неизвестная ошибка при генерации.");
      setIsGenerating(false);
    }
  };

  const pollGeneration = (generationId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    setGenerationStatus("Инициализация генерации...");

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setError("Время ожидания генерации истекло. Пожалуйста, проверьте статус позже.");
        setIsGenerating(false);
        return;
      }

      setGenerationStatus(`Генерация изображений... (${attempts * 2} сек)`);

      try {
        const response = await fetch(`/api/generation?id=${generationId}&apiKey=${encodeURIComponent(apiKey.trim())}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Ошибка при опросе статуса генерации.");
        }

        const data = await response.json();
        const job = data.generations_by_pk;

        if (!job) {
          return; // Continue polling
        }

        // Check if images are generated
        const images = job.generated_images || [];
        if (images.length > 0) {
          clearInterval(interval);
          
          const imageUrls = images.map((img: any) => img.url);
          setCurrentImages(imageUrls);
          setIsGenerating(false);

          // Save to history
          const newHistoryItems: GeneratedImage[] = images.map((img: any) => ({
            id: img.id,
            url: img.url,
            prompt: prompt.trim(),
            modelId,
            createdAt: new Date().toLocaleString(),
          }));

          const updatedHistory = [...newHistoryItems, ...history].slice(0, 50); // limit to 50 items
          setHistory(updatedHistory);
          localStorage.setItem("maff_generation_history", JSON.stringify(updatedHistory));
        } else if (job.status === "FAILED") {
          clearInterval(interval);
          throw new Error("Генерация завершилась с ошибкой на стороне Leonardo.ai.");
        }

      } catch (err: any) {
        clearInterval(interval);
        setError(err.message || "Ошибка при получении результата.");
        setIsGenerating(false);
      }
    }, 2000);
  };

  const clearHistory = () => {
    if (confirm("Вы уверены, что хотите очистить всю историю генераций?")) {
      setHistory([]);
      localStorage.removeItem("maff_generation_history");
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            Интеграция с Leonardo.ai
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-3">
            Генерация Изображений
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Создавайте потрясающие изображения с помощью передовой модели <span className="text-indigo-300 font-semibold">Nano Banana 2</span> (Gemini 3.1 Flash Image).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
            
            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* API Key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  API-Ключ Leonardo.ai (Bearer Token)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Вставьте ваш Bearer API-ключ..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Модель нейросети
                </label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                >
                  <option value="gemini-3.1-flash-image-preview">Nano Banana 2 (Gemini 3.1 Flash)</option>
                  <option value="gemini-3-pro-image-preview">Nano Banana Pro (Gemini 3 Pro)</option>
                  <option value="gemini-2.5-flash-image">Nano Banana (Gemini 2.5 Flash)</option>
                  <option value="b24e16ff-06e3-43eb-8d33-4416c2d75876">Leonardo Lightning XL</option>
                </select>
              </div>

              {/* Aspect Ratio and Number of images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                    Размер кадра
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                  >
                    <option value="1:1">1:1 (Квадрат)</option>
                    <option value="16:9">16:9 (Широкий)</option>
                    <option value="4:3">4:3 (Стандарт)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                    Кол-во картинок
                  </label>
                  <select
                    value={numImages}
                    onChange={(e) => setNumImages(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                  >
                    <option value="1">1 изображение</option>
                    <option value="2">2 изображения</option>
                    <option value="4">4 изображения</option>
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Описание изображения (Промпт)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Опишите то, что вы хотите увидеть на картинке (желательно на английском для лучшего качества)..."
                  rows={4}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400 leading-relaxed animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{generationStatus}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Сгенерировать</span>
                  </>
                )}
              </button>

            </form>
            
          </div>

          {/* Results Gallery (Right) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl min-h-[460px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              Результат генерации
            </h2>

            {/* Empty State / Loading State / Gallery */}
            {isGenerating && currentImages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                  <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">{generationStatus}</p>
                  <p className="text-xs text-slate-500">Обычно процесс занимает от 5 до 15 секунд.</p>
                </div>
              </div>
            ) : currentImages.length > 0 ? (
              <div className="flex-1 space-y-4">
                <div className={`grid gap-4 ${currentImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {currentImages.map((url, index) => (
                    <div key={index} className="group relative bg-slate-950 rounded-xl overflow-hidden aspect-square border border-slate-800 shadow-md">
                      <img
                        src={url}
                        alt={prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Action Overlays */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setLightboxImage(url)}
                          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-110"
                          title="Посмотреть в полный экран"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(url, `generation-${index + 1}.jpg`)}
                          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-110"
                          title="Скачать изображение"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800/80 rounded-xl">
                <ImageIcon className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">Здесь появятся ваши сгенерированные изображения.</p>
                <p className="text-xs text-slate-600 mt-1">Заполните поля слева и нажмите «Сгенерировать».</p>
              </div>
            )}

          </div>

        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-6">
              <h2 className="text-base font-bold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                История генераций
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить историю
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden aspect-square shadow-sm">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-between">
                    <p className="text-[10px] text-slate-300 line-clamp-4 leading-relaxed">{item.prompt}</p>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 mt-2">
                      <button
                        onClick={() => setLightboxImage(item.url)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Посмотреть в полный экран"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => downloadImage(item.url, `history-${item.id}.jpg`)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Скачать изображение"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-slate-950/95 z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={lightboxImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
}
