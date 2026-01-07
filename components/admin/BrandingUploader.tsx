'use client';

import { useState, useRef } from 'react';

interface BrandingUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  type: 'logo' | 'favicon';
  description?: string;
}

export function BrandingUploader({
  value,
  onChange,
  label,
  type,
  description,
}: BrandingUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB for logo, 500KB for favicon)
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 500 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${type === 'logo' ? '2MB' : '500KB'}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'branding');
      formData.append('bucket', 'site-assets'); // Mock bucket name

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    }

    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const dimensions = type === 'logo' 
    ? 'Recommended: 200x60px or similar aspect ratio'
    : 'Recommended: 32x32px or 64x64px';

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{dimensions}</p>
      </div>

      {value ? (
        <div className="group relative inline-block">
          <div className={`overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-4 ${
            type === 'favicon' ? 'w-24 h-24' : 'w-64 h-32'
          }`}>
            <img
              src={value}
              alt={label}
              className="h-full w-full object-contain"
            />
          </div>
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Replace
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-sm font-medium text-white hover:bg-red-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 hover:bg-gray-100 ${
          type === 'favicon' ? 'w-24 h-24' : 'w-64 h-32'
        }`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <>
              <svg className="mb-2 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs text-gray-500">Upload</span>
            </>
          )}
        </label>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}




