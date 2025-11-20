import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          AI Реставратор Фото
        </span>
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-300">
        Вдохните новую жизнь в ваши старые воспоминания. Загрузите фото, чтобы начать.
      </p>
    </header>
  );
};