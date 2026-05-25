import React from 'react';

export interface WelcomeHeaderProps {
  emoji: string;
  emojiLabel: string;
  title: string;
  subtitle: string;
}

export default function WelcomeHeader({
  emoji,
  emojiLabel,
  title,
  subtitle,
}: WelcomeHeaderProps) {
  return (
    <h1 className="text-6xl font-semibold leading-tight mt-4 mb-16">
      <div className="inline-block">
        Hello, I'm{' '}
        <span role="img" aria-label={emojiLabel}>
          {emoji}
        </span>{' '}
        {title}
      </div>
      <br />
      <span className="text-gray-400">{subtitle}</span>
    </h1>
  );
}
