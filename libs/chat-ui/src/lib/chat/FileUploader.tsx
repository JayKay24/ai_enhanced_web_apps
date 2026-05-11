"use client";

import React, { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from '../ui/button';

export interface FileAttachment {
  name: string;
  type: string;
  data: string; // Base64 including prefix like data:image/png;base64,...
}

interface FileUploaderProps {
  onFileUpload: (files: FileAttachment[]) => void;
  files: FileAttachment[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export function FileUploader({ onFileUpload, files, onRemoveFile, disabled }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileAttachment[] = [];
    let processedCount = 0;

    Array.from(selectedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          data: reader.result as string,
        });

        processedCount++;
        if (processedCount === selectedFiles.length) {
          onFileUpload(newFiles);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group w-20 h-20 border rounded-md overflow-hidden bg-gray-100 shadow-sm">
              <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        title="Upload Image"
        className="shrink-0 text-gray-500 hover:text-gray-900"
      >
        <ImagePlus className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default FileUploader;
