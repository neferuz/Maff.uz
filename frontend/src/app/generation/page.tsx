"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
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
  createdAt: string;
}

export default function GenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [error, setError] = useState("");
  
  // Gallery and History
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("maff_generation_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse generation history", e);
      }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Пожалуйста, введите описание для генерации.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setCurrentImages([]);
    setGenerationStatus("Подключение к генератору...");

    try {
      const response = await fetch("/api/generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Ошибка сервера (${response.status})`);
      }

      const data = await response.json();
      const generationId = data.sdGenerationJob?.generationId;

      if (!generationId) {
        throw new Error("Не удалось запустить задачу генерации.");
      }

      // Start polling status
      pollGeneration(generationId);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Произошла ошибка при запуске генерации.");
      setIsGenerating(false);
    }
  };

  const pollGeneration = (generationId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    setGenerationStatus("Запуск алгоритма...");

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setError("Время ожидания генерации истекло. Пожалуйста, попробуйте еще раз.");
        setIsGenerating(false);
        return;
      }

      setGenerationStatus(`Создание изображения... (${attempts * 2} сек)`);

      try {
        const response = await fetch(`/api/generation?id=${generationId}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Ошибка при получении статуса.");
        }

        const data = await response.json();
        const job = data.generations_by_pk;

        if (!job) {
          return; // Continue polling
        }

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
            createdAt: new Date().toLocaleString(),
          }));

          const updatedHistory = [...newHistoryItems, ...history].slice(0, 50); // limit to 50 items
          setHistory(updatedHistory);
          localStorage.setItem("maff_generation_history", JSON.stringify(updatedHistory));
        } else if (job.status === "FAILED") {
          clearInterval(interval);
          throw new Error("Генерация завершилась ошибкой.");
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
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 pt-28">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Внутренний инструмент
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Генератор декоров и текстур
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Введите текстовое описание текстуры ламината или двери для создания высококачественного эскиза 1:1.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            
            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Описание текстуры (Промпт)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: wood texture background, seamless oak laminate pattern, high resolution..."
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                />
                <p className="text-[11px] text-slate-400 leading-normal">
                  * Для получения наилучшего результата пишите промпты на английском языке и указывайте детали (например: seamless, oak, wood pattern).
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-600 leading-relaxed animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{generationStatus}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Сгенерировать текстуру</span>
                  </>
                )}
              </button>

            </form>
            
          </div>

          {/* Results Gallery (Right) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[440px] flex flex-col">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Результат генерации (1:1)
            </h2>

            {/* Empty State / Loading State / Gallery */}
            {isGenerating && currentImages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin"></div>
                  <div className="absolute inset-1.5 bg-slate-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">{generationStatus}</p>
                  <p className="text-xs text-slate-400">Генерация обычно занимает около 10-15 секунд.</p>
                </div>
              </div>
            ) : currentImages.length > 0 ? (
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {currentImages.map((url, index) => (
                    <div key={index} className="group relative bg-slate-100 rounded-xl overflow-hidden aspect-square border border-slate-200 shadow-sm max-w-md mx-auto w-full">
                      <img
                        src={url}
                        alt={prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      {/* Action Overlays */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setLightboxImage(url)}
                          className="w-10 h-10 rounded-full bg-white text-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                          title="Посмотреть в полный экран"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(url, `texture-${index + 1}.jpg`)}
                          className="w-10 h-10 rounded-full bg-white text-slate-800 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Здесь появится сгенерированная текстура.</p>
                <p className="text-xs text-slate-400 mt-1">Опишите текстуру слева и нажмите «Сгенерировать».</p>
              </div>
            )}

          </div>

        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                История генераций
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-red-500/70 hover:text-red-600 flex items-center gap-1 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить историю
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden aspect-square shadow-sm">
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
        <div className="fixed inset-0 bg-slate-950/90 z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-slate-950">
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
