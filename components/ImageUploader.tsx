import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_FORMATS.includes(file.type)) {
        setError(`Неверный тип файла. Пожалуйста, загрузите изображение в формате JPEG, PNG или WebP.`);
        return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`Файл слишком большой. Максимальный размер ${MAX_FILE_SIZE_MB}МБ.`);
        return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
  
  const handleClick = () => {
    document.getElementById('file-input')?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  return (
    <div className="w-full max-w-2xl text-center">
        <div 
            className={`relative border-4 border-dashed rounded-2xl p-8 sm:p-12 lg:p-16 transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 hover:border-cyan-500 bg-gray-800'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            role="button"
            tabIndex={0}
        >
            <input 
                type="file" 
                id="file-input"
                className="hidden"
                accept={ACCEPTED_FORMATS.join(',')}
                onChange={handleFileChange}
            />
            <div className="flex flex-col items-center pointer-events-none">
                <svg className="w-16 h-16 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
                <p className="text-xl font-semibold text-gray-200">Перетащите ваше фото сюда</p>
                <p className="text-gray-400 mt-2">или</p>
                <span className="mt-2 font-semibold text-cyan-400">нажмите для выбора</span>
                <p className="text-xs text-gray-500 mt-4">PNG, JPG, WEBP до {MAX_FILE_SIZE_MB}МБ</p>
            </div>
        </div>
        {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
};