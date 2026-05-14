'use client';

import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
};

export const fetchWeatherData = async (city: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const mockWeatherData = {
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
  };

  return mockWeatherData;
};

interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: string;
}

export const WeatherCard = ({ city, temperature, condition }: WeatherCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 w-full max-w-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{city}</h2>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-4xl font-extrabold text-blue-600">{temperature}°C</p>
          <p className="text-gray-500 font-medium capitalize">{condition}</p>
        </div>
        <div className="text-5xl">
          {condition === 'Sunny' && '☀️'}
          {condition === 'Cloudy' && '☁️'}
          {condition === 'Rainy' && '🌧️'}
          {condition === 'Windy' && '💨'}
        </div>
      </div>
    </div>
  );
};
