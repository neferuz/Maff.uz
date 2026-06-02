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
  X,
  Upload,
  Image as ImageControl
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
  
  // Image Reference States
  const [refImageFile, setRefImageFile] = useState<File | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [initImageId, setInitImageId] = useState<string | null>(null);
  const [isUploadingRef, setIsUploadingRef] = useState(false);

  // Gallery and History
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Load history from server on mount (with localStorage fallback)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/generation/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        } else {
          throw new Error("Failed to fetch history");
        }
      } catch (e) {
        console.error("Failed to load history from server", e);
        const savedHistory = localStorage.getItem("maff_generation_history");
        if (savedHistory) {
          try {
            setHistory(JSON.parse(savedHistory));
          } catch (e2) {}
        }
      }
    };
    fetchHistory();
  }, []);

  // Handle reference image selection
  const handleRefImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setRefImageFile(file);
    setRefImagePreview(URL.createObjectURL(file));
    setIsUploadingRef(true);
    setInitImageId(null);

    try {
      // Normalize extension from MIME type instead of filename
      const mimeToExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = mimeToExt[file.type] || file.name.split(".").pop() || "jpg";
      
      // 1. Get presigned upload URL from server
      const response = await fetch("/api/generation/init-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extension }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Не удалось запросить URL для загрузки референса.");
      }

      const data = await response.json();
      const uploadData = data.uploadInitImage;

      if (!uploadData) {
        throw new Error("Неверная структура ответа от сервера загрузки.");
      }

      const { id, url, fields } = uploadData;

      // 2. Upload the file to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, val]) => {
        formData.append(key, String(val));
      });
      formData.append("file", file);

      const s3Response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!s3Response.ok && s3Response.status !== 204) {
        throw new Error(`Ошибка загрузки на S3: (${s3Response.status})`);
      }

      // Successful upload! Save the image ID
      setInitImageId(id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка при загрузке референсного изображения.");
      removeRefImage();
    } finally {
      setIsUploadingRef(false);
    }
  };

  const removeRefImage = () => {
    setRefImageFile(null);
    if (refImagePreview) {
      URL.revokeObjectURL(refImagePreview);
    }
    setRefImagePreview(null);
    setInitImageId(null);
    setIsUploadingRef(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Пожалуйста, введите описание для генерации.");
      return;
    }

    if (isUploadingRef) {
      setError("Пожалуйста, подождите, пока загрузится референсное изображение.");
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
          prompt: prompt.trim(),
          initImageId: initImageId
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
      let errorMsg = err.message || "Произошла ошибка при запуске генерации.";
      if (/credit|token|balance|limit|insufficient|payment/i.test(errorMsg)) {
        errorMsg = "Баланс закончился, обратитесь к Ферузу разработчику";
      }
      setError(errorMsg);
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

          // Post to server to share with all users
          fetch("/api/generation/history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: newHistoryItems }),
          })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                setHistory(data.history);
              } else {
                const updatedHistory = [...newHistoryItems, ...history].slice(0, 50);
                setHistory(updatedHistory);
                localStorage.setItem("maff_generation_history", JSON.stringify(updatedHistory));
              }
            })
            .catch(() => {
              const updatedHistory = [...newHistoryItems, ...history].slice(0, 50);
              setHistory(updatedHistory);
              localStorage.setItem("maff_generation_history", JSON.stringify(updatedHistory));
            });
        } else if (job.status === "FAILED") {
          clearInterval(interval);
          throw new Error("Генерация завершилась ошибкой.");
        }

      } catch (err: any) {
        clearInterval(interval);
        let errorMsg = err.message || "Ошибка при получении результата.";
        if (/credit|token|balance|limit|insufficient|payment/i.test(errorMsg)) {
          errorMsg = "Баланс закончился, обратитесь к Ферузу разработчику";
        }
        setError(errorMsg);
        setIsGenerating(false);
      }
    }, 2000);
  };

  const clearHistory = () => {
    if (confirm("Вы уверены, что хотите очистить всю историю генераций для всех пользователей?")) {
      fetch("/api/generation/history", {
        method: "DELETE",
      })
        .then(async (res) => {
          if (res.ok) {
            setHistory([]);
            localStorage.removeItem("maff_generation_history");
          }
        })
        .catch((e) => {
          console.error("Failed to clear shared history", e);
        });
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    if (!url || !url.startsWith("http")) {
      console.warn("Invalid image URL for download:", url);
      return;
    }
    // Skip fetch for cross-origin URLs to avoid CORS errors
    // (Leonardo AI S3 bucket does not allow cross-origin fetch)
    const isSameOrigin = url.startsWith(window.location.origin) || url.startsWith("/");
    if (isSameOrigin) {
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
        return;
      } catch (e) {
        // Fall through to window.open
      }
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-alt)] text-slate-800 font-sans pb-10 pt-20">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f5f9] border border-slate-200 text-[#2c3b6e] text-[11px] font-semibold mb-3">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Внутренний инструмент
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2c3b6e] mb-1.5">
            Генератор декоров и текстур
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-xs">
            Введите текстовое описание текстуры ламината или двери, либо загрузите референс, для создания высококачественного эскиза 1:1.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4.5 space-y-4">
            
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Prompt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Описание текстуры (Промпт)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: wood texture background, seamless oak laminate pattern, high resolution..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2c3b6e] focus:ring-1 focus:ring-[#2c3b6e]/30 transition-all resize-none"
                />
              </div>

              {/* Reference Image Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <ImageControl className="w-3 h-3 text-[#2c3b6e]" />
                  Референсное изображение (Имидж-гайд / Опционально)
                </label>
                
                {!refImagePreview ? (
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 hover:border-[#2c3b6e]/40 transition-all cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Выберите файл изображения</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG или WEBP (макс. 5MB)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleRefImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center gap-2.5">
                    <div className="relative w-12 h-12 rounded bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                      <img src={refImagePreview} alt="Reference Preview" className="w-full h-full object-cover" />
                      {isUploadingRef && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{refImageFile?.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {isUploadingRef ? "Загрузка на сервер..." : initImageId ? "Готов к генерации (сильное влияние)" : "Обработка..."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeRefImage}
                      className="w-6.5 h-6.5 rounded-full bg-slate-200/80 hover:bg-red-50 hover:text-red-500 text-slate-500 flex items-center justify-center transition-colors shrink-0"
                      title="Удалить референс"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-600 leading-relaxed animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || isUploadingRef}
                className="w-full h-11 bg-[#2c3b6e] hover:bg-[#1a2544] active:scale-[0.99] text-white font-medium rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4.5 min-h-[360px] flex flex-col">
            <h2 className="text-sm font-bold text-[#2c3b6e] mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ImageIcon className="w-4.5 h-4.5 text-[#2c3b6e]" />
              Результат генерации (1:1)
            </h2>

            {/* Empty State / Loading State / Gallery */}
            {isGenerating && currentImages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#2c3b6e] animate-spin"></div>
                  <div className="absolute inset-1.5 bg-slate-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#2c3b6e] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-700">{generationStatus}</p>
                  <p className="text-[10px] text-slate-400">Генерация обычно занимает около 10-15 секунд.</p>
                </div>
              </div>
            ) : currentImages.length > 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  {currentImages.map((url, index) => (
                    <div key={index} className="group relative bg-slate-50 rounded-lg overflow-hidden aspect-square border border-slate-200 w-full mx-auto">
                      <img
                        src={url}
                        alt={prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      {/* Action Overlays */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setLightboxImage(url)}
                          className="w-9 h-9 rounded-full bg-white text-slate-800 hover:bg-[#2c3b6e] hover:text-white flex items-center justify-center transition-all hover:scale-105"
                          title="Посмотреть в полный экран"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(url, `texture-${index + 1}.jpg`)}
                          className="w-9 h-9 rounded-full bg-white text-slate-800 hover:bg-[#2c3b6e] hover:text-white flex items-center justify-center transition-all hover:scale-105"
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
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <ImageIcon className="w-8 h-8 text-slate-300 mb-1.5" />
                <p className="text-xs text-slate-500">Здесь появится сгенерированная текстура.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Опишите текстуру слева и нажмите «Сгенерировать».</p>
              </div>
            )}

          </div>

        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-4.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <h2 className="text-xs font-bold text-[#2c3b6e] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#2c3b6e]" />
                История генераций
              </h2>
              <button
                onClick={clearHistory}
                className="text-[11px] text-red-500/70 hover:text-red-600 flex items-center gap-1 transition-colors font-medium cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Очистить историю
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {history.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group relative bg-slate-100 rounded-lg border border-slate-200 overflow-hidden aspect-square">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex flex-col justify-between">
                    <p className="text-[9px] text-slate-300 line-clamp-3 leading-snug">{item.prompt}</p>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                      <button
                        onClick={() => setLightboxImage(item.url)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Посмотреть в полный экран"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => downloadImage(item.url, `history-${item.id}.jpg`)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <img
              src={lightboxImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
}
