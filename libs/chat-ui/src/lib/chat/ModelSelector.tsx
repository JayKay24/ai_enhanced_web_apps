import React from 'react';
import { SUPPORTED_PROVIDERS_CONFIG, ProviderId } from '@ai-enhanced-web-apps/shared-utils';

export interface ModelSelectorProps {
  providerId: string;
  modelId: string;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  providerId,
  modelId,
  onProviderChange,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const currentProvider = SUPPORTED_PROVIDERS_CONFIG[providerId as ProviderId];

  return (
    <div className="flex flex-row gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Provider</label>
        <select
          value={providerId}
          onChange={(e) => onProviderChange(e.target.value as ProviderId)}
          disabled={disabled}
          className="p-2 border border-gray-300 rounded bg-white text-sm"
        >
          {Object.entries(SUPPORTED_PROVIDERS_CONFIG).map(([id, p]) => (
            <option key={id} value={id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Model</label>
        <select
          value={modelId}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className="p-2 border border-gray-300 rounded bg-white text-sm"
        >
          {currentProvider?.models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ModelSelector;
