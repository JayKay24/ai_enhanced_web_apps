import * as React from 'react';
import { AlertCircle } from 'lucide-react';

export interface SessionCompletedBannerProps {
  title: string;
  description?: string;
  className?: string;
}

const SessionCompletedBanner: React.FC<SessionCompletedBannerProps> = ({
  title,
  description,
  className = ''
}) => {
  return (
    <div className={`bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-4 rounded-r-xl shadow-sm mx-4 shrink-0 transition-all duration-300 ${className}`}>
      <div className="flex items-center">
        <AlertCircle className="mr-2 text-yellow-500 shrink-0" size={20} />
        <p className="font-semibold text-sm">{title}</p>
      </div>
      {description && (
        <p className="mt-1 text-xs text-yellow-700/80 dark:text-yellow-300/80">{description}</p>
      )}
    </div>
  );
};

export default SessionCompletedBanner;
