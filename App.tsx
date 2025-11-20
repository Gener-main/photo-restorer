import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { enhancePhoto, QualitySetting } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

const QUALITY_OPTIONS: { id: QualitySetting; label: string; }[] = [
  { id: 'quick', label: 'Быстро' },
  { id: 'standard', label: 'Стандарт' },
  { id: 'high', label: 'Высокое' },
  { id: 'archival', label: 'Архивное' },
];

const QUALITY_DESCRIPTIONS: Record<QualitySetting, string> = {
  quick: 'Самый быстрый вариант для базовой коррекции цвета и царапин.',
  standard: 'Хороший баланс скорости и качества для общих улучшений.',
  high: 'Более медленная, продвинутая обработка для значительного восстановления.',
  archival: 'Самый интенсивный процесс для достижения музейного качества.'
};


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualitySetting>('standard');

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setEnhancedImage(null);
    setOriginalFile(file);
    try {
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
    } catch (err) {
      setError('Не удалось прочитать выбранный файл. Пожалуйста, попробуйте другое изображение.');
      setOriginalImage(null);
      setOriginalFile(null);
    }
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!originalImage || !originalFile) {
      setError('Пожалуйста, сначала выберите изображение.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEnhancedImage(null);

    try {
      const { base64Data, mimeType } = await extractBase64AndMime(originalImage);
      const enhancedBase64 = await enhancePhoto(base64Data, mimeType, quality);
      setEnhancedImage(`data:${mimeType};base64,${enhancedBase64}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка.';
      setError(`Не удалось улучшить фото. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalFile, quality]);
  
  const extractBase64AndMime = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const mimeType = blob.type;
    const base64Data = dataUrl.split(',')[1];
    return { base64Data, mimeType };
  };

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setOriginalFile(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <Header />
      <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center mt-8">
        {error && <ErrorDisplay message={error} onClear={() => setError(null)} />}
        
        {!originalImage && <ImageUploader onFileSelect={handleFileSelect} />}

        {originalImage && !enhancedImage && !isLoading && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Ваше фото</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl max-w-2xl">
              <img src={originalImage} alt="Original upload" className="max-h-[60vh] w-auto rounded-md" />
            </div>
            
            <div className="mt-8 w-full max-w-md text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Качество улучшения</h3>
              <div className="flex rounded-full bg-gray-800 p-1">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setQuality(option.id)}
                    className={`w-1/4 px-2 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 focus:outline-none ${quality === option.id ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 h-8 flex items-center justify-center px-4">
                {QUALITY_DESCRIPTIONS[quality]}
              </p>
            </div>

            <button
              onClick={handleEnhance}
              className="mt-4 px-8 py-4 bg-cyan-600 text-white font-bold text-lg rounded-full hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Улучшить фото
            </button>
             <button
              onClick={handleReset}
              className="mt-4 text-gray-400 hover:text-white transition-colors"
            >
              Начать заново
            </button>
          </div>
        )}

        {isLoading && (
          <div className="w-full flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Идет улучшение...</h2>
            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl max-w-2xl relative">
              <img src={originalImage || ''} alt="Processing" className="max-h-[60vh] w-auto rounded-md opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                <LoadingSpinner />
                <p className="mt-4 text-lg">ИИ творит свою магию. Пожалуйста, подождите.</p>
              </div>
            </div>
          </div>
        )}

        {enhancedImage && originalImage && originalFile && (
          <ComparisonView 
            original={originalImage}
            enhanced={enhancedImage}
            fileName={originalFile.name}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default App;